import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMe } from "../../api/authService";
import { getInviteById } from "../../api/hangmanInviteService";
import HangmanDrawing from "./HangmanDrawing";
import { toast } from "react-toastify";
import hangmanSocket from "../../utils/hangmanSocket";
import { useNavigate } from "react-router-dom";

function MultiplayerHangmanGame() {
    const { inviteId } = useParams();
    const [userId, setUserId] = useState<string | null>(null);
    const [invite, setInvite] = useState<any>(null);
    const [role, setRole] = useState<"giver" | "guesser" | null>(null);
    const [wordToGuess, setWordToGuess] = useState<string | null>(null);
    const [inputWord, setInputWord] = useState("");
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    const [incorrectGuesses, setIncorrectGuesses] = useState(0);
    const navigate = useNavigate();

    const maxIncorrect = 7;

    const normalizeLetter = (letter: string) =>
        letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const resetGame = () => {
        setWordToGuess(null);
        setInputWord("");
        setGuessedLetters([]);
        setIncorrectGuesses(0);
    };

    const isGameOver = incorrectGuesses >= maxIncorrect;
    const isWin = wordToGuess &&
        wordToGuess
            .split("")
            .every((c) => guessedLetters.includes(normalizeLetter(c)));

    const opponentName = invite && userId
        ? (invite.sender.id === userId
            ? `${invite.recipient.firstname} ${invite.recipient.lastname}`
            : `${invite.sender.firstname} ${invite.sender.lastname}`)
        : null;

    const handleGuess = (letter: string) => {
        if (
            role !== "guesser" ||
            !wordToGuess ||
            guessedLetters.includes(letter) ||
            isGameOver ||
            isWin
        ) return;

        const normalized = normalizeLetter(wordToGuess);
        const correct = normalized.includes(letter);

        const newGuessedLetters = [...guessedLetters, letter];
        const newIncorrect = correct ? incorrectGuesses : incorrectGuesses + 1;

        setGuessedLetters(newGuessedLetters);
        setIncorrectGuesses(newIncorrect);

        hangmanSocket.emit("hangman:letterGuessed", {
            inviteId,
            letter,
            incorrectGuesses: newIncorrect,
        });
    };

    const handleSubmitWord = () => {
        const trimmed = inputWord.trim().toLowerCase();
        if (!trimmed || trimmed.length < 3) {
            toast.error("Enter a word with at least 3 letters.");
            return;
        }
        setWordToGuess(trimmed);
        hangmanSocket.emit("hangman:wordSubmitted", {
            inviteId,
            word: trimmed,
        });
    };

    useEffect(() => {
        const setup = async () => {

            hangmanSocket.emit("hangman:join", `hangman-${inviteId}`);

            try {
                const me = await fetchMe();
                setUserId(me.id);
                const inviteData = await getInviteById(inviteId!);
                setInvite(inviteData);

                const roleFromStorage = localStorage.getItem("hangman-role");
                if (roleFromStorage === "giver" || roleFromStorage === "guesser") {
                    setRole(roleFromStorage);
                } else {
                    const backendRole = inviteData.guesserId === me.id ? "guesser" : "giver";
                    setRole(backendRole);
                    localStorage.setItem("hangman-role", backendRole);
                }
            } catch (err) {
                toast.error("Failed to load game info.");
            }
        };

        setup();
        return () => {
        };
    }, [inviteId]);

    useEffect(() => {
        const handleWordSubmitted = ({ word }: { word: string }) => {
            setWordToGuess(word);
        };

        const handleLetterGuessed = ({ letter, incorrectGuesses: updatedIncorrect }: { letter: string; incorrectGuesses: number }) => {
            setGuessedLetters((prev) => [...prev, letter]);
            setIncorrectGuesses(updatedIncorrect);
        };

        const handleReplayStarted = () => {
            resetGame();
        };

        hangmanSocket.on("hangman:wordSubmitted", handleWordSubmitted);
        hangmanSocket.on("hangman:letterGuessed", handleLetterGuessed);
        hangmanSocket.on("hangman:replayStarted", handleReplayStarted);

        return () => {
            hangmanSocket.off("hangman:wordSubmitted", handleWordSubmitted);
            hangmanSocket.off("hangman:letterGuessed", handleLetterGuessed);
            hangmanSocket.off("hangman:replayStarted", handleReplayStarted);
        };
    }, []);

    useEffect(() => {
        const handleOpponentLeft = () => {
            toast.info("Your opponent left the game.");
            localStorage.removeItem("hangman-role");
            navigate("/hangman");
        };

        hangmanSocket.on("hangman:opponentLeft", handleOpponentLeft);

        return () => {
            hangmanSocket.off("hangman:opponentLeft", handleOpponentLeft);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-xl mx-auto bg-white p-6 rounded shadow space-y-4 text-center">
                <h1 className="text-2xl font-bold">🎮 Multiplayer Hangman</h1>

                {role === "giver" && !wordToGuess && (
                    <div>
                        <p className="mb-2">You are the word giver. Enter a word for your friend to guess:</p>
                        <input
                            type="text"
                            className="border px-2 py-1 rounded w-full"
                            value={inputWord}
                            onChange={(e) => setInputWord(e.target.value)}
                        />
                        <button
                            className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
                            onClick={handleSubmitWord}
                        >
                            Start Game
                        </button>
                    </div>
                )}

                {(role === "giver" || role === "guesser") && wordToGuess && (
                    <div className="space-y-4">
                        {role === "giver" && (
                            <p className="text-blue-600 font-semibold mb-2">
                                Waiting for your friend to guess: "{wordToGuess}"
                            </p>
                        )}

                        <HangmanDrawing incorrectGuesses={incorrectGuesses} />

                        <p className="text-gray-600">
                            Wrong guesses: {incorrectGuesses} / {maxIncorrect}
                        </p>

                        <div className="text-2xl font-mono tracking-widest">
                            {wordToGuess.split("").map((c, idx) => {
                                const normalized = normalizeLetter(c);
                                const reveal = guessedLetters.includes(normalized) || isGameOver || isWin;
                                return (
                                    <span key={idx}>
                                        {reveal ? c.toUpperCase() : "_"}{" "}
                                    </span>
                                );
                            })}
                        </div>

                        {role === "guesser" && (
                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                                {"abcdefghijklmnopqrstuvwxyz".split("").map((letter) => (
                                    <button
                                        key={letter}
                                        onClick={() => handleGuess(letter)}
                                        disabled={!!(guessedLetters.includes(letter) || isGameOver || isWin)}
                                        className={`w-8 h-8 border rounded text-lg ${guessedLetters.includes(letter)
                                            ? "bg-gray-300"
                                            : "hover:bg-blue-100"
                                            }`}
                                    >
                                        {letter}
                                    </button>
                                ))}
                            </div>
                        )}

                        {(isWin || isGameOver) && (
                            <div className="space-y-2">
                                {role === "guesser" ? (
                                    <>
                                        {isWin && (
                                            <p className="text-green-600 font-bold">You Win!</p>
                                        )}
                                        {isGameOver && (
                                            <p className="text-red-600 font-bold">
                                                Game Over! The word was "{wordToGuess}"
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {isWin && (
                                            <p className="text-green-600 font-bold">
                                                {opponentName} won!
                                            </p>
                                        )}
                                        {isGameOver && (
                                            <p className="text-red-600 font-bold">
                                                {opponentName} lost! The word was "{wordToGuess}"
                                            </p>
                                        )}
                                    </>
                                )}

                                <div className="flex justify-center gap-4 mt-4">
                                    <button
                                        onClick={() => {
                                            hangmanSocket.emit("hangman:replayRequested", { inviteId });
                                        }}
                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                                    >
                                        ↺ Restart
                                    </button>
                                    <button
                                        onClick={() => {
                                            hangmanSocket.emit("hangman:leaveGame", { inviteId });
                                            localStorage.removeItem("hangman-role");
                                            navigate("/hangman");
                                        }}
                                        className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
                                    >
                                        ← Main Menu
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {role === "guesser" && !wordToGuess && (
                    <p className="text-center text-lg font-semibold text-gray-700">
                        {opponentName} is choosing a word...
                    </p>
                )}
            </div>
        </div>
    );
}

export default MultiplayerHangmanGame;

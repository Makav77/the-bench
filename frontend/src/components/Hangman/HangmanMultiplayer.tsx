import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMe } from "../../api/authService";
import { getInviteById } from "../../api/hangmanInviteService";
import HangmanDrawing from "./HangmanDrawing";
import { toast } from "react-toastify";
import socket from "../../utils/socket";

function MultiplayerHangmanGame() {
    const { inviteId } = useParams();
    const [userId, setUserId] = useState<string | null>(null);
    const [invite, setInvite] = useState<any>(null);
    const [role, setRole] = useState<"giver" | "guesser" | null>(null);
    const [wordToGuess, setWordToGuess] = useState<string | null>(null);
    const [inputWord, setInputWord] = useState("");
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    const [incorrectGuesses, setIncorrectGuesses] = useState(0);

    const maxIncorrect = 7;

    const normalizeLetter = (letter: string) =>
        letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const isGameOver = incorrectGuesses >= maxIncorrect;
    const isWin =
        wordToGuess &&
        wordToGuess
            .split("")
            .every((c) => guessedLetters.includes(normalizeLetter(c)));

    const opponentName =
        invite && userId
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
        )
            return;

        const normalized = normalizeLetter(wordToGuess);
        const correct = normalized.includes(letter);

        const newGuessedLetters = [...guessedLetters, letter];
        const newIncorrect = correct ? incorrectGuesses : incorrectGuesses + 1;

        setGuessedLetters(newGuessedLetters);
        setIncorrectGuesses(newIncorrect);

        socket.emit("hangman:letterGuessed", {
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
        socket.emit("hangman:wordSubmitted", {
            inviteId,
            word: trimmed,
        });
    };

    useEffect(() => {
        const setup = async () => {
            socket.connect();
            socket.emit("join", `hangman-${inviteId}`);
            try {
                const me = await fetchMe();
                setUserId(me.id);
                const inviteData = await getInviteById(inviteId!);
                setInvite(inviteData);

                const players = [inviteData.sender.id, inviteData.recipient.id].sort();
                setRole(players[0] === me.id ? "giver" : "guesser");
            } catch (err) {
                toast.error("Failed to load game info.");
            }
        };

        setup();
    }, [inviteId]);

    useEffect(() => {
        const handleWordSubmitted = ({ word }: { word: string }) => {
            setWordToGuess(word);
        };

        socket.on("hangman:wordSubmitted", handleWordSubmitted);

        return () => {
            socket.off("hangman:wordSubmitted", handleWordSubmitted);
        };
    }, []);

    useEffect(() => {
        const handleLetterGuessed = ({
            letter,
            incorrectGuesses: updatedIncorrect,
        }: { letter: string; incorrectGuesses: number }) => {
            if (role !== "giver") return;

            setGuessedLetters((prev) => [...prev, letter]);
            setIncorrectGuesses(updatedIncorrect);
        };

        socket.on("hangman:letterGuessed", handleLetterGuessed);

        return () => {
            socket.off("hangman:letterGuessed", handleLetterGuessed);
        };
    }, [role]);

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

                        {isWin && (
                            <p className="text-green-600 font-bold">
                                🎉 You Win!
                            </p>
                        )}
                        {isGameOver && (
                            <p className="text-red-600 font-bold">
                                💀 Game Over! The word was "{wordToGuess}"
                            </p>
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

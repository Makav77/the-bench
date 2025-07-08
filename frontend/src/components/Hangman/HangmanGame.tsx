import { useEffect, useState } from "react";
import { getWords } from "../../api/hangmanService";
import { toast } from "react-toastify";
import HangmanDrawing from "./HangmanDrawing";

type GameMode = "solo" | "friend" | null;

function HangmanPage() {
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | null>(null);
  const [word, setWord] = useState<string | null>(null);
  const [noWordsMessage, setNoWordsMessage] = useState<string | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);

  const maxIncorrect = 7;
  const normalizeLetter = (letter: string) =>
    letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const isGameOver = incorrectGuesses >= maxIncorrect;
  const isWin =
    word &&
    word
      .split("")
      .every((c) => guessedLetters.includes(normalizeLetter(c)));

  const handleGuess = (letter: string) => {
    if (!word || guessedLetters.includes(letter) || isGameOver || isWin) return;

    const normalizedWord = normalizeLetter(word);
    const isCorrect = normalizedWord.includes(letter);

    setGuessedLetters((prev) => [...prev, letter]);
    if (!isCorrect) {
      setIncorrectGuesses((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const fetchWord = async () => {
      if (gameMode === "solo" && difficulty !== null) {
        try {
          const words = await getWords();
          const filtered = words.filter((w) => w.difficulty === difficulty);
          if (filtered.length === 0) {
            setNoWordsMessage("No words available for this difficulty.");
            return;
          }

          const random = filtered[Math.floor(Math.random() * filtered.length)];
          setWord(random.word.toLowerCase());
        } catch {
          toast.error("Failed to load words.");
        }
      }
    };

    fetchWord();
  }, [gameMode, difficulty]);

  return (
    <div className="min-h-screen bg-blue-500 text-black py-12">
      <div className="p-6 max-w-2xl mx-auto space-y-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center">Play Hangman</h1>

        {noWordsMessage && (
          <div className="text-center space-y-2">
            <p className="text-red-600 font-medium">{noWordsMessage}</p>
            <button
              onClick={() => {
                setNoWordsMessage(null);
                setDifficulty(null);
              }}
              className="text-sm text-gray-600 hover:underline"
            >
              ← Back
            </button>
          </div>
        )}

        {gameMode === null && (
          <div className="flex gap-4 justify-center">
            <button
              className="px-6 py-3 rounded bg-yellow-500 hover:bg-yellow-600 text-white text-lg"
              onClick={() => setGameMode("solo")}
            >
              Play Solo
            </button>
            <button
              className="px-6 py-3 rounded bg-green-500 hover:bg-green-600 text-white text-lg"
              onClick={() => setGameMode("friend")}
            >
              Invite a Friend
            </button>
          </div>
        )}

        {gameMode === "solo" && difficulty === null && (
          <div className="flex flex-col gap-4 items-center">
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setDifficulty(1)}
                className="px-4 py-2 bg-blue-200 hover:bg-blue-300 rounded"
              >
                Easy
              </button>
              <button
                onClick={() => setDifficulty(2)}
                className="px-4 py-2 bg-yellow-200 hover:bg-yellow-300 rounded"
              >
                Medium
              </button>
              <button
                onClick={() => setDifficulty(3)}
                className="px-4 py-2 bg-red-200 hover:bg-red-300 rounded"
              >
                Hard
              </button>
            </div>
            <button
              onClick={() => setGameMode(null)}
              className="text-sm text-gray-600 hover:underline"
            >
              ← Back
            </button>
          </div>
        )}

        {gameMode === "solo" && difficulty !== null && word && (
          <div className="text-center space-y-4">
            <HangmanDrawing incorrectGuesses={incorrectGuesses} />
            <p className="text-lg font-medium">
              Difficulty: {["Easy", "Medium", "Hard"][difficulty - 1]}
            </p>

            <div className="text-2xl font-mono tracking-widest">
              {word.split("").map((char, idx) => {
                const normalizedChar = normalizeLetter(char);
                return guessedLetters.includes(normalizedChar) || isGameOver || isWin ? (
                  <span key={idx}>{char.toUpperCase()} </span>
                ) : (
                  <span key={idx}>_ </span>
                );
              })}
            </div>

            <p className="text-gray-600">Wrong guesses: {incorrectGuesses} / {maxIncorrect}</p>

            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {"abcdefghijklmnopqrstuvwxyz".split("").map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleGuess(letter)}
                  disabled={!!(guessedLetters.includes(letter) || isGameOver || isWin)}
                  className={`w-8 h-8 border rounded text-lg ${
                    guessedLetters.includes(letter)
                      ? "bg-gray-300 cursor-not-allowed"
                      : "hover:bg-blue-100"
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>

            <p className="text-sm text-gray-500 italic mt-2">
              Tip: Accented letters can be guessed using their base letter. For example: <strong>é → e</strong>, <strong>ç → c</strong>
            </p>

            {isWin && <p className="text-green-600 font-bold">You Win!</p>}
            {isGameOver && <p className="text-red-600 font-bold">You Lost. The word was "{word}"</p>}

            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => {
                  setWord(null);
                  setGuessedLetters([]);
                  setIncorrectGuesses(0);
                  setDifficulty(null);
                }}
                className="text-sm text-gray-600 hover:underline"
              >
                ↺ Restart
              </button>
              <button
                onClick={() => {
                  setWord(null);
                  setGuessedLetters([]);
                  setIncorrectGuesses(0);
                  setDifficulty(null);
                  setGameMode(null);
                }}
                className="text-sm text-gray-600 hover:underline"
              >
                ← Main Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HangmanPage;

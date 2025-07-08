import { useEffect, useState } from "react";
import { getWords, addWord, deleteWord, updateWord } from "../../api/hangmanService";
import { DictionaryEntry } from "../../api/hangmanService";
import { toast } from "react-toastify";

function DashboardHangman() {
    const [words, setWords] = useState<DictionaryEntry[]>([]);
    const [newWord, setNewWord] = useState("");
    const [difficulty, setDifficulty] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchWords = async () => {
        setLoading(true);
        try {
            const result = await getWords();
            setWords(
                result.filter(
                    (w) =>
                        typeof w.word === "string" &&
                        typeof w.difficulty === "number" &&
                        w.difficulty >= 1 &&
                        w.difficulty <= 3
                )
            );
        } catch (e) {
            toast.error("Failed to load dictionary");
            setWords([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddWord = async () => {
        try {
            await addWord(newWord, difficulty);
            toast.success("Word added");
            setNewWord("");
            fetchWords();
        } catch {
            toast.error("Failed to add word");
        }
    };

    const handleDeleteWord = async (word: string) => {
        try {
            await deleteWord(word);
            toast.success("Word deleted");
            fetchWords();
        } catch {
            toast.error("Failed to delete word");
        }
    };

    useEffect(() => {
        fetchWords();
    }, []);

    return (
        <div className="bg-white p-6 rounded-2xl space-y-6 shadow-md">
            <h2 className="text-xl font-semibold">Hangman Dictionary</h2>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <input
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="New word"
                    className="border px-3 py-2 rounded flex-grow"
                />
                <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(Number(e.target.value))}
                    className="border px-3 py-2 rounded"
                >
                    <option value={1}>Easy</option>
                    <option value={2}>Medium</option>
                    <option value={3}>Hard</option>
                </select>
                <button
                    onClick={handleAddWord}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Add Word
                </button>
            </div>

            {loading ? (
                <p className="text-center text-gray-500">Loading...</p>
            ) : words.length === 0 ? (
                <p className="text-center text-gray-500">No words in the dictionary yet.</p>
            ) : (
                <ul className="space-y-3">
                    {words.map((entry, idx) => (
                        <li
                            key={entry.word}
                            className="flex justify-between items-center border p-3 rounded shadow-sm"
                        >
                            {entry.isEditing ? (
                                <div className="flex flex-col sm:flex-row gap-2 flex-grow">
                                    <input
                                        type="text"
                                        value={entry.newWord ?? entry.word}
                                        onChange={(e) => {
                                            const updated = [...words];
                                            updated[idx].newWord = e.target.value;
                                            setWords(updated);
                                        }}
                                        className="border px-2 py-1 rounded w-32"
                                    />
                                    <select
                                        value={entry.newDifficulty ?? entry.difficulty}
                                        onChange={(e) => {
                                            const updated = [...words];
                                            updated[idx].newDifficulty = Number(e.target.value);
                                            setWords(updated);
                                        }}
                                        className="border px-2 py-1 rounded"
                                    >
                                        <option value={1}>Easy</option>
                                        <option value={2}>Medium</option>
                                        <option value={3}>Hard</option>
                                    </select>
                                    <button
                                        onClick={async () => {
                                            const trimmedWord = (entry.newWord ?? entry.word).trim();

                                            if (!trimmedWord) {
                                                toast.error("Word cannot be empty or whitespace");
                                                return;
                                            }

                                            try {
                                                await updateWord(entry.word, trimmedWord, entry.newDifficulty ?? entry.difficulty);
                                                toast.success("Word updated");

                                                fetchWords();
                                            } catch {
                                                toast.error("Failed to update word");
                                            }
                                        }}
                                        className="text-green-600 hover:underline text-sm"
                                    >
                                        Save
                                    </button>

                                    <button
                                        onClick={() => {
                                            const updated = [...words];
                                            updated[idx].isEditing = false;
                                            setWords(updated);
                                        }}
                                        className="text-gray-500 hover:underline text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <strong>{entry.word}</strong>
                                        <span className="ml-2 text-sm text-gray-500">
                                            ({["Easy", "Medium", "Hard"][entry.difficulty - 1] ?? "Unknown"})
                                        </span>
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => {
                                                const updated = [...words];
                                                updated[idx].isEditing = true;
                                                updated[idx].newWord = entry.word;
                                                updated[idx].newDifficulty = entry.difficulty;
                                                setWords(updated);
                                            }}
                                            className="text-blue-600 hover:underline text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteWord(entry.word)}
                                            className="text-red-600 hover:underline text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}

                </ul>
            )}
        </div>
    );
}

export default DashboardHangman;

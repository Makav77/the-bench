import { useState, FormEvent } from "react";
import { createPoll } from "../../api/pollService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function CreatePollPage() {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [type, setType] = useState<"single"|"multiple"|"limited">("single");
    const [maxSelections, setMaxSelections] = useState(0);
    const [autoClose, setAutoClose] = useState(0);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const cleanOptions = options.filter(o => o.trim());
            await createPoll({ question, options: cleanOptions, type, maxSelections: type === "limited" ? maxSelections: undefined, autoCloseInHours: autoClose || undefined });
            toast.success("Poll created.");
            navigate("/polls");
        } catch (error) {
            toast.error("Unable to create a poll : " + error);
        }
    };

    return (
        <div className="p-6 w-[50%] mx-auto">
            <h1 className="text-2xl font-bold mb-4">Create a poll</h1>
            <form
                onSubmit={handleSubmit}
                className="space-y-4 bg-white p-4 rounded shadow"
            >
                <div>
                    <label className="font-semibold">
                        Question<span className="text-red-500">*</span>
                    </label>
                    <input
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        className="w-full border rounded px-2 py-1"
                    />
                </div>

                <div>
                    <label className="font-semibold">
                        Options (2-10)<span className="text-red-500">*</span>
                    </label>
                    
                    {options.map((opt, index) => (
                        <input
                            key={index}
                            value={opt}
                            onChange={e => {
                                const array = [...options];
                                array[index] = e.target.value;
                                setOptions(array);
                            }}
                            className="w-full border rounded px-2 py-1 mb-1"
                        />
                    ))}
                    <button
                        type="button"
                        disabled={options.length >= 10}
                        onClick={() => setOptions([...options, ""])}
                        className="text-blue-600 underline"
                    >
                        + Add
                    </button>
                </div>

                <div>
                    <label className="font-semibold">
                        Poll type
                    </label>

                    <select
                        value={type}
                        onChange={e => setType(e.target.value as any)}
                        className="border rounded px-2 py-1"
                    >
                        <option value="single">Single answer</option>
                        <option value="multiple">Multiple answer</option>
                        <option value="limited">Limited answer</option>
                    </select>
                </div>

                {type === "limited" && (
                    <div>
                        <label className="font-semibold">Max answer</label>
                        <input
                            type="number"
                            min={1}
                            value={maxSelections}
                            onChange={e => setMaxSelections(parseInt(e.target.value))}
                            className="w-20 border rounded px-2 py-1"
                        />
                    </div>
                )}

                <div>
                    <label className="font-semibold">Auto closing poll</label>
                    <input
                        type="number"
                        min={0}
                        value={autoClose}
                        onChange={e => setAutoClose(parseInt(e.target.value))}
                        className="w-20 border rounded px-2 py-1"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-green-600 text-white px-4 rounded shadow"
                >
                    Create
                </button>
            </form>
        </div>
    )
}

export default CreatePollPage;
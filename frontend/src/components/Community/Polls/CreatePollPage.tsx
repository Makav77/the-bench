import { useState, FormEvent } from "react";
import { createPoll } from "../../../api/pollService";
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

        if (!question.trim()) {
            toast.error("You must ask a question.");
            return;
        }

        const cleanOptions = options.map(o => o.trim()).filter(o => o);
        if (cleanOptions.length < 2) {
            toast.error("You must provide at least two answers.");
            return;
        }

        if (cleanOptions.length > 10) {
            toast.error("You can't provide more than ten answers.");
            return;
        }

        if (type === "limited" && (!maxSelections || maxSelections < 1)) {
            toast.error("Vous must set a minimum number of selections for a limited type");
            return;
        }

        try {
            const cleanOptions = options.filter(o => o.trim());
            await createPoll({ question, options: cleanOptions, type, maxSelections: type === "limited" ? maxSelections: undefined, autoCloseIn: autoClose || undefined });
            toast.success("Poll created.");
            navigate("/polls");
        } catch (error) {
            toast.error("Unable to create a poll : " + error);
        }
    };

    return (
        <div className="p-6 w-[30%] mx-auto">
            <h1 className="text-2xl font-bold mb-4">Create a poll</h1>
            <form
                onSubmit={handleSubmit}
                className="space-y-4 bg-white p-4 rounded-2xl shadow"
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

                <div className="flex flex-col">
                    <label className="font-semibold">
                        Poll type<span className="text-red-500">*</span>
                    </label>

                    <select
                        value={type}
                        onChange={e => setType(e.target.value as any)}
                        className="border rounded px-2 py-1 w-[40%]"
                    >
                        <option value="single">Single answer</option>
                        <option value="multiple">Multiple answer</option>
                        <option value="limited">Limited answer</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="font-semibold">Auto closing poll (hours) <span className="text-red-500 italic text-sm">optionnal</span></label>
                    <input
                        type="number"
                        min={0}
                        value={autoClose}
                        onChange={e => setAutoClose(parseInt(e.target.value))}
                        className="w-15 border rounded px-2 py-1"
                    />
                </div>

                <div>
                    <label className="font-semibold">
                        Answers (2-10)<span className="text-red-500">*</span>
                    </label>

                    {options.map((opt, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                value={opt}
                                onChange={e => {
                                    const newOpts = [...options];
                                    newOpts[index] = e.target.value;
                                    setOptions(newOpts);
                                }}
                                className="w-full border rounded px-2 py-1 mb-1"
                            />

                            {options.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOptions(options.filter((_, i) => i !== index));
                                    }}
                                    className="border rounded flex items-center justify-center cursor-pointer px-2 py-1 mb-1"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    ))}

                    <div className="flex justify-center">
                        <button
                            type="button"
                            disabled={options.length >= 10}
                            onClick={() => setOptions([...options, ""])}
                            className="text-blue-600 border rounded-4xl px-2 py-1 font-bold w-[30%] cursor-pointer hover:bg-gray-200"
                        >
                            Add answers
                        </button>
                    </div>
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

                <div className="mt-8 w-[60%] flex justify-between mx-auto">
                    <button
                        type="button"
                        className="bg-red-400 hover:bg-red-500 text-white px-4 py-1 rounded shadow cursor-pointer w-[40%] font-semibold text-xl"
                        onClick={() => navigate("/polls")}
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded shadow cursor-pointer w-[40%] font-semibold text-xl"
                    >
                        Create
                    </button>
                </div>

                
            </form>
        </div>
    )
}

export default CreatePollPage;

import { useState, FormEvent } from "react";
import { createPoll } from "../../../api/pollService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import usePermission from "../../Utils/usePermission";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

function CreatePollPage() {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [type, setType] = useState<"single"|"multiple"|"limited">("single");
    const [maxSelections, setMaxSelections] = useState(0);
    const [autoCloseDate, setAutoCloseDate] = useState<Date | null>(null);
    const [autoCloseTime, setAutoCloseTime] = useState<string | null>(null);
    const navigate = useNavigate();

    const { restricted, expiresAt, reason } = usePermission("create_poll");
    if (restricted === null) {
        return <p className="p-6 text-center">Checking permissions ...</p>;
    }

    if (restricted) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">
                    You are no longer allowed to create a poll until{" "}
                    {expiresAt
                        ? format(new Date(expiresAt), "dd/MM/yyyy 'at' HH:mm")
                        : "unknown date"}.
                    <br />
                    {reason && (
                        <span>
                            Reason: {reason}
                            <br />
                        </span>
                    )}
                    Contact a moderator or administrator for more information.
                </p>
            </div>
        );
    }

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

        let autoCloseAt: string | undefined = undefined;
        if (autoCloseDate && autoCloseTime) {
            const [hours, minutes] = autoCloseTime.split(':').map(Number);
            const dateWithTime = new Date(autoCloseDate);
            dateWithTime.setHours(hours, minutes, 0, 0);
            autoCloseAt = dateWithTime.toISOString();
        }

        try {
            const cleanOptions = options.filter(o => o.trim());
            await createPoll({ question, options: cleanOptions, type, maxSelections: type === "limited" ? maxSelections: undefined, autoCloseAt });
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
                className="space-y-4 bg-white p-4 rounded-2xl shadow relative z-0"
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

                <div className="flex gap-4 justify-center items-start">
                    <div className="flex flex-col items-center">
                        <label className="font-semibold mb-1">
                            Auto closing Date{" "}
                            <span className="text-red-500 italic text-sm">optionnal</span>
                        </label>
                        <DatePicker
                            selected={autoCloseDate}
                            onChange={(date: Date | null) => setAutoCloseDate(date)}
                            dateFormat="dd/MM/yyyy"
                            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 bg-white cursor-pointer hover:border-blue-400 transition w-auto max-w-[150px]"
                            placeholderText="Select date"
                            isClearable
                        />
                    </div>
                    
                    <div className="flex flex-col items-center">
                        <label className="font-semibold mb-1">
                            Auto closing Time{" "}
                            <span className="text-red-500 italic text-sm">optionnal</span>
                        </label>
                        <input
                            type="time"
                            value={autoCloseTime || ""}
                            onChange={(e) => setAutoCloseTime(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 bg-white cursor-pointer hover:border-blue-400 transition w-auto max-w-[100px]"
                        />
                    </div>
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

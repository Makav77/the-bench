import { useState, FormEvent } from "react";
import { createPoll } from "../../../api/pollService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import usePermission from "../../Utils/usePermission";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { useTranslation } from "react-i18next";

function CreatePollPage() {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [type, setType] = useState<"single"|"multiple"|"limited">("single");
    const [maxSelections, setMaxSelections] = useState(0);
    const [autoCloseDate, setAutoCloseDate] = useState<Date | null>(null);
    const [autoCloseTime, setAutoCloseTime] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation("Community/CreatePollPage");
    const { restricted, expiresAt, reason } = usePermission("create_poll");

    if (restricted === null) {
        return <p className="p-6 text-center">
            {t("checkingPermissions")}
        </p>;
    }

    if (restricted) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">
                    {t("restrictionMessage")} {" "}
                    {expiresAt
                        ? format(new Date(expiresAt), "dd/MM/yyyy 'at' HH:mm")
                        : "unknown date"}.
                    <br />
                    {reason && (
                        <span>
                            {t("reason")} {reason}
                            <br />
                        </span>
                    )}
                    {t("contactMessage")}
                </p>
            </div>
        );
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const cleanQuestion = question.trim();

        if (cleanQuestion) {
            toast.error(t("toastQuestionError"));
            return;
        }

        const cleanOptions = options.map(o => o.trim()).filter(o => o);
        if (cleanOptions.length < 2) {
            toast.error(t("toastAnswerError"));
            return;
        }

        if (cleanOptions.length > 10) {
            toast.error(t("toastTooManyAnswerError"));
            return;
        }

        if (type === "limited" && (!maxSelections || maxSelections < 1)) {
            toast.error(t("toastLimitedAnswerError"));
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
            await createPoll({ question: cleanQuestion, options: cleanOptions, type, maxSelections: type === "limited" ? maxSelections: undefined, autoCloseAt });
            toast.success(t("toastPollCreated"));
            navigate("/polls");
        } catch {
            toast.error(t("toastPollCreatedError"));
        }
    };

    return (
        <div className="p-6 w-[30%] mx-auto max-sm:w-full max-sm:p-6">
            <h1 className="text-2xl font-bold mb-4 max-sm:text-3xl max-sm:text-center">
                {t("createPoll")}
            </h1>

            <form
                onSubmit={handleSubmit}
                className="space-y-4 bg-white p-4 rounded-2xl shadow relative z-0"
            >
                <div>
                    <label className="font-semibold max-sm:text-lg">
                        {t("question")}<span className="text-red-500">*</span>
                    </label>
                    <input
                        value={question}
                        onChange={e => setQuestion(e.target.value.trimStart())}
                        className="w-full border rounded px-2 py-1 max-sm:py-4 max-sm:text-lg max-sm:px-5"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="font-semibold max-sm:text-lg">
                        {t("pollType")}<span className="text-red-500">*</span>
                    </label>
                    <select
                        value={type}
                        onChange={e => setType(e.target.value as any)}
                        className="border rounded px-2 py-1 w-[40%] max-sm:w-full max-sm:py-4 max-sm:text-lg max-sm:px-5"
                    >
                        <option value="single">
                            {t("singleAnswer")}
                        </option>

                        <option value="multiple">
                            {t("multipleAnswer")}
                        </option>

                        <option value="limited">
                            {t("limitedAnswer")}
                        </option>
                    </select>
                </div>

                <div className="flex gap-4 justify-center items-start max-sm:flex-col max-sm:gap-6">
                    <div className="flex flex-col items-center w-full">
                        <label className="font-semibold mb-1 max-sm:text-lg">
                            {t("autoClosingDate")} <span className="text-red-500 italic text-sm">{t("optionnal")}</span>
                        </label>
                        <DatePicker
                            selected={autoCloseDate}
                            onChange={(date: Date | null) => setAutoCloseDate(date)}
                            dateFormat="dd/MM/yyyy"
                            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 bg-white cursor-pointer hover:border-blue-400 transition w-auto max-w-[150px] max-sm:w-full max-sm:py-4 max-sm:text-lg max-sm:px-5"
                            isClearable
                        />
                    </div>
                    
                    <div className="flex flex-col items-center w-full">
                        <label className="font-semibold mb-1 max-sm:text-lg">
                            {t("autoClosingTime")} <span className="text-red-500 italic text-sm">{t("optionnal")}</span>
                        </label>
                        <input
                            type="time"
                            value={autoCloseTime || ""}
                            onChange={(e) => setAutoCloseTime(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 bg-white cursor-pointer hover:border-blue-400 transition w-auto max-w-[100px] max-sm:w-full max-sm:py-4 max-sm:text-lg max-sm:px-5"
                        />
                    </div>
                </div>

                <div>
                    <label className="font-semibold max-sm:text-lg">
                        {t("answers")}<span className="text-red-500">*</span>
                    </label>

                    {options.map((opt, index) => (
                        <div key={index} className="flex items-center gap-2 max-sm:gap-6">
                            <input
                                value={opt}
                                onChange={e => {
                                    const newOpts = [...options];
                                    newOpts[index] = e.target.value.trimStart();
                                    setOptions(newOpts);
                                }}
                                className="w-full border rounded px-2 py-1 mb-1 max-sm:py-4 max-sm:text-lg max-sm:px-5"
                            />
                            {options.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOptions(options.filter((_, i) => i !== index));
                                    }}
                                    className="border rounded flex items-center justify-center cursor-pointer px-2 py-1 mb-1 max-sm:py-4 max-sm:px-5 max-sm:text-lg"
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
                            className="text-blue-600 border rounded-4xl px-2 py-1 font-bold w-[35%] cursor-pointer hover:bg-gray-200 mt-5 max-sm:w-full max-sm:text-lg max-sm:py-4 max-sm:px-5"
                        >
                            {t("addAnswers")}
                        </button>
                    </div>
                </div>

                {type === "limited" && (
                    <div className="flex gap-3 items-center">
                        <label className="font-semibold max-sm:text-lg">Max answer</label>
                        <input
                            type="number"
                            min={1}
                            value={maxSelections}
                            onChange={e => setMaxSelections(parseInt(e.target.value))}
                            className="w-20 border rounded px-2 py-1 max-sm:py-4 max-sm:text-lg max-sm:px-5"
                        />
                    </div>
                )}

                <div className="mt-8 w-[60%] flex justify-between mx-auto max-sm:w-full max-sm:flex-col max-sm:gap-4">
                    <button
                        type="button"
                        className="bg-red-400 hover:bg-red-500 text-white px-4 py-1 rounded shadow cursor-pointer w-[40%] font-semibold text-xl max-sm:w-full max-sm:h-14 max-sm:text-2xl"
                        onClick={() => navigate("/polls")}
                    >
                        {t("cancel")}
                    </button>
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded shadow cursor-pointer w-[40%] font-semibold text-xl max-sm:w-full max-sm:h-14 max-sm:text-2xl"
                    >
                        {t("create")}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreatePollPage;

import { FormEvent, useState } from "react";
import { createReport } from "../../api/reportService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

interface ReportModalProps {
    reportedUserId: string;
    reportedContentId: string;
    reportedContentType: string;
    onClose: () => void;
}

const REASONS = [
    { value: "OFFENSIVE_LANGUAGE", label: "Foul language / insults" },
    { value: "HATE_SPEECH", label: "Hate speech" },
    { value: "SPAM", label: "Spam" },
    { value: "INAPPROPRIATE_CONTENT", label: "Inappropriate content" },
    { value: "OTHER", label: "Other (please specify below)"},
];

function ReportModal({ reportedUserId, reportedContentId, reportedContentType, onClose }: ReportModalProps) {
    const [reason, setReason] = useState<string>(REASONS[0].value);
    const [description, setDescription] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const { t } = useTranslation("Utils/ReportModal");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createReport({
                reportedUserId,
                reason,
                reportedContentId,
                reportedContentType,
                description: description.trim() === "" ? null : description.trim(),
            });
            toast.success("Report send.");
            onClose();
        } catch(error) {
            console.error("Create report error : " + error);
            toast.error("Unable to send report.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center backdrop-brightness-30">
            <div className="w-[50%] bg-white rounded-2xl p-6 max-w-md">
                <h2 className="text-2xl font-semibold mb-4">{t("reportTitle")}</h2>
                <form onSubmit={handleSubmit}>

                    <div className="mb-4">
                        <label
                            htmlFor="reason"
                            className="block font-medium mb-1">
                                {t("reason")}
                        </label>
                        <select
                            id="reason"
                            className="w-full border rounded p-2"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        >
                            {REASONS.map((opt) => (
                                <option
                                    key={opt.value}
                                    value={opt.value}
                                >
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="description"
                            className="block font-medium mb-1"
                        >
                            {t("description")}
                        </label>
                        <textarea
                            id="description"
                            className="w-full border rounded p-2"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t("descriptionPlaceholder")}
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-500 cursor-pointer"
                            disabled={loading}
                        >
                            {t("cancel")}
                        </button>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled;bg-red-300 cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? t("sending") : t("send") }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ReportModal;

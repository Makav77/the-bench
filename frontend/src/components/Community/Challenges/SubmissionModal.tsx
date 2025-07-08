import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { submitCompletion } from "../../../api/challengeService";
import { useTranslation } from "react-i18next";

interface SubmissionModalProps {
    challengeId: string;
    onClose: () => void;
    onSubmitted: () => void;
}

function SubmissionModal({ challengeId, onClose, onSubmitted }: SubmissionModalProps) {
    const [text, setText] = useState<string>("");
    const [imageUrl, setImageUrl] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { t } = useTranslation("Community/SubmissionModal");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!text.trim() && !imageUrl.trim()) {
            setError("Please provide text or image URL.");
            return;
        }

        setLoading(true);

        try {
            await submitCompletion(challengeId, { 
                text: text.trim() !== "" ? text.trim() : undefined,
                imageUrl: imageUrl.trim() !== "" ? imageUrl.trim() : undefined,
            });
            toast.success(t("toastSendSubmission"));
            onSubmitted();
        } catch {
            toast.error(t("toastSendSubmissionError"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="relative w-[90%] max-w-md bg-white rounded-2xl p-6">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-semibold mb-4">{t("validateCompletion")}</h2>

                {error && <p className="mb-4 text-red-500">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-medium mb-1">{t("text")}</label>
                        <textarea
                            rows={3}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-1">{t("image")}</label>
                        <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-500 disabled:opacity-50 cursor-pointer"
                        >
                            {t("cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? t("sending") : t("send")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default SubmissionModal;

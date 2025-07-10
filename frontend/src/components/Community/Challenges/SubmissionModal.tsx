import { FormEvent, useState, useRef } from "react";
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
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { t } = useTranslation("Community/SubmissionModal");
    const [file, setFile] = useState<File | null>(null);
    const [previewURL, setPreviewURL] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setFile(file);
        setError(null);
        if (file) {
            setPreviewURL(URL.createObjectURL(file));
        } else {
            setPreviewURL(null);
        }
    };

    const handleRemoveImage = () => {
        setFile(null);
        setPreviewURL(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!text.trim() && !file) {
            setError("Merci de fournir une preuve texte ou image 😊");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            if (text.trim()) {
                formData.append("text", text.trim());
            }

            if (file) {
                formData.append("file", file);
            }

            await submitCompletion(challengeId, formData);
            toast.success(t("toastSendSubmission"));
            onSubmitted();
        } catch {
            toast.error(t("toastSendSubmissionError"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 max-sm:p-2">
            <div className="relative w-[90%] max-w-md bg-white rounded-2xl p-6 max-sm:p-3 max-sm:w-full">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer max-sm:text-lg"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-semibold mb-4 max-sm:text-xl">{t("validateCompletion")}</h2>

                {error && <p className="mb-4 text-red-500 max-sm:text-base">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-medium mb-1 max-sm:text-base">{t("text")}</label>
                        <textarea
                            rows={3}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full border rounded px-2 py-1 max-sm:text-base"
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-1 max-sm:text-base">{t("image")}</label>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer max-sm:w-3/4 max-sm:mx-auto"
                            disabled={loading}
                        >
                            {t("selectFile")}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleFileChange}
                        />

                        {previewURL && (
                            <div className="mt-3 flex flex-col items-center">
                                <img
                                    src={previewURL}
                                    alt="Aperçu"
                                    className="h-40 object-cover rounded max-sm:w-full max-sm:h-32"
                                />
                                <button
                                    type="button"
                                    className="mt-2 text-red-500 hover:underline"
                                    onClick={handleRemoveImage}
                                >
                                    {t("removeImage")}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-2 max-sm:space-x-0 max-sm:flex-col max-sm:gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-500 disabled:opacity-50 cursor-pointer max-sm:text-base max-sm:w-full"
                        >
                            {t("cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 cursor-pointer max-sm:text-base max-sm:w-full"
                        >
                            {loading ? t("sending") : t("send")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SubmissionModal;

import { toast } from "react-toastify";
import { useState } from "react";
import apiClient from "../../../api/apiClient";
import { useTranslation } from "react-i18next";

export function AddBadgeModal({ onClose, onBadgeCreated }: { onClose: () => void, onBadgeCreated: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [cost, setCost] = useState<number>(0);
    const [previewURL, setPreviewURL] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation("Community/CreateBadgeModal");

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setFile(file);
        setError(null);
        if (file) {
            setPreviewURL(URL.createObjectURL(file));
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!file) {
            setError(t("noImageError"));
            return;
        }
        if (cost <= 0) {
            setError(t("negativeCostError"));
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("image", file);
            formData.append("cost", String(cost));
            formData.append("available", "true");
            await apiClient.post("/shop/badges", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success(t("badgeCreated"));
            onBadgeCreated();
        } catch {
            toast.error(t("badgeCreatedError"));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
            <div className="bg-white rounded-lg shadow-lg p-8 w-[350px] relative">
                <h2 className="text-xl font-bold mb-4 text-center">{t("addBadge")}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="text-red-500">{error}</div>}
                    <div>
                        <label className="block font-semibold mb-1">{t("image")} <span className="text-red-500">*</span></label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                        />
                        {previewURL && (
                            <img
                                src={previewURL} 
                                alt="Preview"
                                className="mt-2 h-24 w-24 mx-auto object-contain"
                            />
                        )}
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">{t("cost")} <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            min={1}
                            className="border px-2 py-1 rounded w-full"
                            value={cost}
                            onChange={e => setCost(Number(e.target.value))}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            className="text-gray-500 text-2xl font-bold absolute top-2 right-4"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            ×
                        </button>

                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? t("creation") : t("created")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

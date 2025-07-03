import { useState, ChangeEvent, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface FlashPostFormProps {
    defaultValues?: { title: string; description: string };
    onSubmit: (data: { title: string; description: string}) => Promise<void>;
}

function FlashPostForm({ defaultValues, onSubmit }: FlashPostFormProps) {
    const [title, setTitle] = useState(defaultValues?.title || "");
    const [description, setDescription] = useState(defaultValues?.description || "");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation("FlashPosts/FlashPostForm");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!title || !description) {
            setError("All field must be completed.");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            await onSubmit({ title, description });
        } catch (error) {
            setError("Error : " + error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-xl mx-auto space-y-4 p-4 bg-white rounded shadow"
        >
            {error && <p className="text-red-500">{error}</p>}

            <div>
                <label className="font-semibold">
                    {t("title")}<span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                />
            </div>

            <div>
                <label className="font-semibold">
                    {t("description")}<span className="text-red-500">*</span>
                </label>
                <textarea
                    rows={5}
                    maxLength={10000}
                    value={description}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                />
            </div>

            <div className="flex justify-between">
                <button
                    type="button"
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded cursor-pointer"
                    onClick={() => navigate("/bulletinsboard")}
                >
                    {t("cancel")}
                </button>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded disabled:opacity-50 cursor-pointer"
                >
                    {isLoading ? t("loading") : defaultValues ? t("update") : t("create")}
                </button>
            </div>
        </form>
    );
}

export default FlashPostForm;

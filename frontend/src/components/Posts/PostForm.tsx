import { useState, ChangeEvent, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface PostFormProps {
    defaultValues?: { title : string; description: string };
    onSubmit: (data: { title: string; description: string }) => Promise<void>;
}

function PostForm({ defaultValues, onSubmit }: PostFormProps) {
    const [title, setTitle] = useState(defaultValues?.title || "");
    const [description, setDescription] = useState(defaultValues?.description || "");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation("Posts/PostForm");

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
            className="max-w-xl mx-auto space-y-4 p-4 bg-white rounded shadow max-sm:space-y-6"
        >
            {error && <p className="text-red-500 text-base max-sm:text-center max-sm:text-sm">{error}</p>}

            <div>
                <label className="font-semibold max-sm:xl">
                    {t("title")} <span className="text-red-500">*</span>
                </label>

                <input
                    type="text"
                    value={title}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                    className="w-full border rounded px-2 py-2 max-sm:py-4 max-sm:text-lg max-sm:mt-2"
                />
            </div>

            <div>
                <label className="font-semibold max-sm:text-xl">
                    {t("description")} <span className="text-red-500">*</span>
                </label>
                <textarea
                    rows={5}
                    maxLength={10000}
                    value={description}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                    className="w-full border rounded px-2 py-2 max-sm:py-4 max-sm:text-lg max-sm:mt-2"
                />
            </div>

            <div className="flex justify-between max-sm:flex-col max-sm:space-y-3 max-sm:gap-0 max-sm:space-x-0 max-sm:mt-2">
                <button
                    type="button"
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded cursor-pointer max-sm:w-full max-sm:py-4 max-sm:text-lg"
                    onClick={() => navigate("/bulletinsboard")}
                >
                    {t("cancel")}
                </button>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded disabled:opacity-50 cursor-pointer max-sm:w-full max-sm:py-4 max-sm:text-lg"
                >
                    {isLoading ? t("loading") : defaultValues ? t("update") : t("create")}
                </button>
            </div>
        </form>
    );
}

export default PostForm;

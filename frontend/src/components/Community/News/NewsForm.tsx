import { useState, useRef, ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface NewsFormProps {
    defaultValues?: {
        title: string;
        content: string;
        tags?: string[];
        images?: string[];
    };
    onSubmit: (data: { title: string; content: string; tags: string[]; images: File[]; removeImages?: string[] }) => Promise<void>;
    isLoading?: boolean;
}

function NewsForm({ defaultValues, onSubmit, isLoading }: NewsFormProps) {
    const [title, setTitle] = useState(defaultValues?.title ?? "");
    const [content, setContent] = useState(defaultValues?.content ?? "");
    const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? []);
    const [tagInput, setTagInput] = useState("");
    const [existingImages, setExistingImages] = useState<string[]>(defaultValues?.images ?? []);
    const [removeImages, setRemoveImages] = useState<string[]>([]);
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation("Community/NewsForm");

    const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags(prev => [...prev, tagInput.trim()]);
            }
            setTagInput("");
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) {
            return;
        }
        const files = Array.from(e.target.files);
        if (existingImages.length + images.length + files.length > 10) {
            setError("10 images max");
            return;
        }
        setImages(prev => [...prev, ...files]);
        setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    };

    const handleRemoveImage = (index: number, isExisting: boolean) => {
        if (isExisting) {
            setRemoveImages(prev => [...prev, existingImages[index]]);
            setExistingImages(prev => prev.filter((_, i) => i !== index));
        } else {
            setImages(prev => prev.filter((_, i) => i !== index));
            setImagePreviews(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!title || !content) {
            setError("All field must be completed");
            return;
        }
        try {
            await onSubmit({ title, content, tags, images, removeImages });
        } catch (error) {
            setError("Error : " + error);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-[30%] mx-auto space-y-4 p-6 bg-white rounded-2xl shadow max-sm:w-full"
        >
            {error && <p className="text-red-500">{error}</p>}

            <div>
                <label className="font-semibold">
                    {t("title")}<span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full border rounded px-2 py-1 max-sm:text-base"
                    required
                />
            </div>

            <div>
                <label className="font-semibold">
                    {t("content")}<span className="text-red-500">*</span>
                </label>
                <textarea
                    rows={10}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full border rounded px-2 py-1 max-sm:text-base max-sm:py-2"
                    required
                />
            </div>

            <div>
                <label className="font-semibold">
                    {t("tags")}
                </label>
                <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="w-full border px-3 py-2 rounded mt-1 max-sm:text-base"
                    placeholder={t("placeholderTag")}
                />
                <div className="flex flex-wrap mt-2 gap-2">
                    {tags.map((tag, i) => (
                        <span
                            key={i}
                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                        >
                            {tag}
                            <button
                                type="button"
                                className="ml-2 text-red-500 cursor-pointer"
                                onClick={() => setTags(tags.filter((_, index) => index !== i))}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            <div>
                <label className="font-semibold">
                    {t("images")}
                </label>
                <div className="flex items-center gap-3 mb-2 max-sm:flex-col max-sm:gap-2">
                    <button
                        type="button"
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer max-sm:w-full max-sm:h-12 max-sm:text-base"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={existingImages.length + images.length >= 10}
                    >
                        {t("addImage")}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={handleFileChange}
                        disabled={existingImages.length + images.length >= 10}
                    />
                </div>

                <div className="flex gap-3 flex-wrap max-sm:gap-2">
                    {existingImages.map((src, i) => (
                        <div
                            key={i}
                            className="relative"
                        >
                            <img
                                src={src}
                                alt={`Image existante ${i + 1}`}
                                className="w-24 h-24 object-cover rounded border max-sm:w-20 max-sm:h-20"
                            />
                            <button
                                type="button"
                                className="absolute top-1 right-1 bg-white rounded-full text-red-500 px-2 cursor-pointer"
                                onClick={() => handleRemoveImage(i, true)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    {imagePreviews.map((src, i) => (
                        <div
                            key={`preview-${i}`}
                            className="relative"
                        >
                            <img
                                src={src}
                                alt={`Preview ${i + 1}`}
                                className="w-24 h-24 object-cover rounded border max-sm:w-20 max-sm:h-20"
                            />
                            <button
                                type="button"
                                className="absolute top-1 right-1 bg-white rounded-full text-red-500 px-2 cursor-pointer"
                                onClick={() => handleRemoveImage(i, false)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between max-sm:flex-col max-sm:gap-3">
                <button
                    type="button"
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded disabled:opacity-50 cursor-pointer max-sm:w-full max-sm:h-12 max-sm:text-base"
                    onClick={() => navigate("/news")}
                >
                    {t("cancel")}
                </button>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded disabled:opacity-50 cursor-pointer max-sm:w-full max-sm:h-12 max-sm:text-base"
                >
                    {isLoading ? t("loading") : t("validate")}
                </button>
            </div>
        </form>
    );
}

export default NewsForm;

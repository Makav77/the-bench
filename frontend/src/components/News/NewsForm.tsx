import { useState, useRef, ChangeEvent, FormEvent, KeyboardEvent } from "react";

interface NewsFormProps {
    defaultValues?: {
        title: string;
        content: string;
        tags?: string[];
        images?: string[];
    };
    onSubmit: (data: { title: string; content: string; tags: string[]; images: File[]; removeImages?: string[] }) => Promise<void>;
    isLoading?: boolean;
    buttonLabel?: string;
}

function NewsForm({ defaultValues, onSubmit, isLoading, buttonLabel }: NewsFormProps) {
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
            className="max-w-xl mx-auto space-y-4 p-4 bg-white rounded shadow"
        >
            {error && <p className="text-red-500">{error}</p>}

            <div>
                <label className="font-semibold">
                    Title<span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                    required
                />
            </div>

            <div>
                <label className="font-semibold">
                    Content<span className="text-red-500">*</span>
                </label>
                <textarea
                    rows={10}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                    required
                />
            </div>

            <div>
                <label className="font-semibold">
                    Tags
                </label>
                <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="w-full border px-3 py-2 rounded mt-1"
                    placeholder="Press Enter to add tag"
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
                                className="ml-2 text-red-500"
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
                    Images (max 10)
                </label>
                <div className="flex items-center gap-3 mb-2">
                    <button
                        type="button"
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={existingImages.length + images.length >= 10}
                    >
                        Add image
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
                <div className="flex gap-3 flex-wrap">
                    {existingImages.map((src, i) => (
                        <div
                            key={i}
                            className="relative"
                        >
                            <img
                                src={src}
                                alt={`Image existante ${i + 1}`}
                                className="w-24 h-24 object-cover rounded border"
                            />
                            <button
                                type="button"
                                className="absolute top-1 right-1 bg-white rounded-full text-red-500 px-2"
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
                                className="w-24 h-24 object-cover rounded border"
                            />
                            <button
                                type="button"
                                className="absolute top-1 right-1 bg-white rounded-full text-red-500 px-2"
                                onClick={() => handleRemoveImage(i, false)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded disabled:opacity-50 cursor-pointer"
                >
                    {isLoading ? "Loading..." : buttonLabel ?? "Validate"}
                </button>
            </div>
        </form>
    );
}

export default NewsForm;

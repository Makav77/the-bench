import { ChangeEvent, useRef, useState, KeyboardEvent, FormEvent } from "react";
import { createNews, uploadImages } from "../../api/newsService";
import { toast } from "react-toastify";

function NewsForm() {
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState<string>("");
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) {
            return
        }
        const files = Array.from(e.target.files);

        if (images.length + files.length > 30) {
            toast.error("30 images max");
            return;
        }

        setImages(prev => [...prev, ...files]);
        setImagePreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags(prev => [...prev, tagInput.trim()]);
            }
            setTagInput("");
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let imagesUrls: string[] = [];
            if (images.length > 0) {
                imagesUrls = await uploadImages(images);
            }

            await createNews({ title, content, images: imagesUrls, tags });
            toast.success("News in waiting for validation by a admin");
        } catch (error) {
            toast.error("Unable to publish news : " + error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-xl mx-auto p-6 bg-white rounded-2xl shadow space-y-5"
        >
            <h2 className="text-2xl font-bold mb-4">Write an article for neighborhood</h2>

            <div>
                <label className="font-semibold">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full border px-3 py-2 rounded mt-1"
                    placeholder="Article title"
                    required
                />
            </div>

            <div>
                <label className="font-semibold">Content</label>
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full border px-3 py-2 rounded mt-1 min-h-[120px]"
                    placeholder="Article content"
                    required
                />
            </div>

            <div>
                <label className="font-semibold">Tags</label>
                <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="w-full border px-3 py-2 rounded mt-1"
                    placeholder="Press Enter to add a tag"
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
                <label className="font-semibold">Images</label>
                <div className="flex items-center gap-3 mb-2">
                    <button
                        type="button"
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        disabled={images.length >= 30}
                    >
                        Add image {images.length >= 30 ? "(max 30)" : ""}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={handleFileChange}
                        disabled={images.length >= 30}
                    />
                </div>
                <div className="flex gap-3 flex-wrap">
                    {imagePreviews.map((src, i) => (
                        <div
                            key={i}
                            className="relative"
                        >
                            <img
                                src={src}
                                alt={`Preview ${i + 1}`}
                                className="w-2' h-24 object-cover rounded border"
                            />
                            <button
                                type="button"
                                className="absolute top-1 right-1 bg-white rounded-full text-red-500 px-2"
                                onClick={() => handleRemoveImage(i)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
                disabled={isLoading}
            >
                {isLoading ? "Publication..." : "Publish"}
            </button>
        </form>
    );
}

export default NewsForm;

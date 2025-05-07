import { useState, ChangeEvent, FormEvent } from "react";

interface PostFormProps {
    defaultValues?: { title : string; description: string };
    onSubmit: (data: { title: string; description: string }) => Promise<void>;
}

function PostForm({ defaultValues, onSubmit }: PostFormProps) {
    const [title, setTitle] = useState(defaultValues?.title || "");
    const [description, setDescription] = useState(defaultValues?.description || "");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            className="max-w-xl mx-auto p-4 bg-white rounded shadow space-y-4"
        >
            {error && <p className="text-red-500">{error}</p>}
            <div>
                <label className="block font-semibold">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                />
            </div>

            <div>
                <label className="block font-semibold">Description</label>
                <textarea
                    rows={5}
                    value={description}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                />
            </div>

            <div className="text-right">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                    {isLoading ? "Loading..." : defaultValues ? "Update" : "Create"}
                </button>
            </div>
        </form>
    );
}

export default PostForm;

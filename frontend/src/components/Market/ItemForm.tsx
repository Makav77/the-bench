import { useState, ChangeEvent, FormEvent, useEffect} from "react";
import { useNavigate } from "react-router-dom";

export interface ItemFormData {
    title: string;
    description: string;
    price?: number;
    images?: File[];
    contactEmail?: string;
    contactPhone?: string;
}

export type DefaultItemFormData = Omit<ItemFormData, "images"> & {
    images?: string[];
};

interface ItemFormProps {
    defaultValues?: DefaultItemFormData;
    onSubmit: (data: ItemFormData) => void;
}

function ItemForm({ defaultValues, onSubmit }: ItemFormProps) {
    const [form, setForm] = useState<ItemFormData>(() => ({
        title: defaultValues?.title || "",
        description: defaultValues?.description || "",
        price: defaultValues?.price,
        images: [],
        contactEmail: defaultValues?.contactEmail || "",
        contactPhone: defaultValues?.contactPhone || "",
    }));

    const [previewURLs, setPreviewURLs] = useState<string[]>(defaultValues?.images || []);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (defaultValues?.images) {
            setPreviewURLs(defaultValues.images);
        }
    }, [defaultValues]);

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setForm((f) => ({
            ...f,
            [name]:
                (name === "price" ? (value === "" ? undefined : parseFloat(value)) : value)
        }));
        setError(null);
    }

    function handleFilesChange(e: ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) {
            return;
        }

        const files = Array.from(e.target.files);
        setForm((f) => ({
            ...f,
            images: files,
        }));
        setError(null);

        const URLs = files.map((f) => URL.createObjectURL(f));
        setPreviewURLs(URLs);
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        if (!form.title || !form.description) {
            setError("Title and description required.");
            return;
        }
        setIsSubmitting(true);

        try {
            onSubmit(form);
        } catch (error) {
            setError("Error : " + error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form
            onClick={handleSubmit}
            className="max-w-xl mx-auto space-y-4 p-4 bg-white rounded shadow"
        >
            {error && <p className="test-red-500">{error}</p>}

            <div>
                <label className="font-semibold">
                    Title<span className="text-red-500">*</span>
                </label>
                <input
                    name="title"
                    type="text"
                    maxLength={100}
                    value={form.title}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                />
            </div>

            <div>
                <label className="font-semibold">
                    Description<span className="text-red-500">*</span>
                </label>
                <textarea
                    name="description"
                    rows={5}
                    value={form.description}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                />
            </div>

            <div>
                <label className="font-semibold">
                    Price (€)
                </label>
                <input
                    name="price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.price ?? ""}
                    onChange={handleChange}
                    className="w-32 border rounded px-2 py-1"
                />
            </div>

            <div>
                <label className="font-semibold">
                    Pictures
                </label>
                <input
                    name="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFilesChange}
                    className="w-full"
                />
                {previewURLs.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        {previewURLs.map((url, index) => (
                            <img
                                key={index}
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="h-20 object-cover rounded"
                            />
                        ))}
                    </div>
                )}
            </div>

            <div>
                <label className="font-semibold">
                    Contact (email)
                </label>
                <input
                    name="contactEmail"
                    type="email"
                    value={form.contactEmail}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                />
            </div>

            <div>
                <label className="font-semibold">
                    Contact (phone)
                </label>
                <input
                    name="contactPhone"
                    type="tel"
                    value={form.contactPhone}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                />
            </div>

            <div className="flex justify-between">
                <button
                    type="button"
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded cursor-pointer"
                    onClick={() => navigate("/market")}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50"
                >
                    {isSubmitting ? "Loading..." : defaultValues ? "Update" : "Create"}
                </button>
            </div>
        </form>
    )
}

export default ItemForm;

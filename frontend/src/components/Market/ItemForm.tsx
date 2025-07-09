import { useState, ChangeEvent, FormEvent, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation("Market/ItemForm");


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

    async function handleSubmit(e: FormEvent) {
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
            onSubmit={handleSubmit}
            className="max-w-xl mx-auto space-y-4 p-8 bg-white rounded shadow max-sm:p-2 max-sm:space-y-6"
        >
            {error && <p className="text-red-500">{error}</p>}

            <div>
                <label className="font-semibold max-sm:text-lg">
                    {t("title")}<span className="text-red-500">*</span>
                </label>
                <input
                    name="title"
                    type="text"
                    maxLength={100}
                    value={form.title}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 max-sm:text-lg max-sm:py-3"
                />
            </div>

            <div>
                <label className="font-semibold max-sm:text-lg">
                    {t("description")}<span className="text-red-500">*</span>
                </label>
                <textarea
                    name="description"
                    rows={5}
                    value={form.description}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 max-sm:text-lg max-sm:py-3"
                />
            </div>

            <div className="flex flex-col">
                <label className="font-semibold max-sm:text-lg">
                    {t("price")} (€)
                </label>
                <input
                    name="price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.price ?? ""}
                    onChange={handleChange}
                    className="w-32 border rounded px-2 py-1 max-sm:text-lg max-sm:w-full max-sm:py-3"
                />
            </div>

            <div className="flex flex-col">
                <label className="font-semibold max-sm:text-lg">
                    {t("pictures")}
                </label>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-green-600 hover:bg-green-700 text-white rounded cursor-pointer w-[30%] h-8 max-sm:w-full max-sm:h-12 max-sm:text-lg"
                >
                    {t("selectFiles")}
                </button>
                <input
                    ref={fileInputRef}
                    name="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFilesChange}
                    className="w-full"
                    hidden
                />
                {previewURLs.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2 max-sm:grid-cols-1 max-sm:gap-4">
                        {previewURLs.map((url, index) => (
                            <img
                                key={index}
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="h-20 object-cover rounded max-sm:h-44 max-sm:w-full max-sm:rounded-xl"
                            />
                        ))}
                    </div>
                )}
            </div>

            <div>
                <label className="font-semibold max-sm:text-lg">
                    {t("contactMail")}
                </label>
                <input
                    name="contactEmail"
                    type="email"
                    value={form.contactEmail}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 max-sm:text-lg max-sm:py-3"
                />
            </div>

            <div>
                <label className="font-semibold max-sm:text-lg">
                    {t("contactPhone")}
                </label>
                <input
                    name="contactPhone"
                    type="tel"
                    value={form.contactPhone}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 max-sm:text-lg max-sm:py-3"
                />
            </div>

            <div className="flex justify-between max-sm:flex-col max-sm:gap-4">
                <button
                    type="button"
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded cursor-pointer max-sm:w-full max-sm:text-lg max-sm:py-4"
                    onClick={() => navigate("/marketplace")}
                >
                    {t("cancel")}
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50 cursor-pointer max-sm:w-full max-sm:text-lg max-sm:py-4"
                >
                    {isSubmitting ? t("loading") : defaultValues ? t("update") : t("create")}
                </button>
            </div>
        </form>
    );
}

export default ItemForm;

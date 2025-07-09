import { useState, ChangeEvent, FormEvent, useRef } from "react";
import { createGalleryItem } from "../../../api/galleryService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import usePermission from "../../Utils/usePermission";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

export default function CreateGalleryItemPage() {
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState("");
    const [previewURL, setPreviewURL] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { t } = useTranslation("Community/CreateGalleryImagePage");
    const { restricted, expiresAt, reason } = usePermission("publish_gallery");

    if (restricted === null) {
        return <p className="p-6 text-center">{t("checkingPermissions")}</p>;
    }

    if (restricted) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">
                    {t("restrictionMessage")} {" "}
                    {expiresAt
                        ? format(new Date(expiresAt), "dd/MM/yyyy 'at' HH:mm")
                        : "unknown date"}.
                    <br />
                    {reason && (
                        <span>
                            {t("reason")} {reason}
                            <br />
                        </span>
                    )}
                    {t("contactMessage")}
                </p>
            </div>
        );
    }

    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setFile(file);
        setError(null);
        if (file) {
            setPreviewURL(URL.createObjectURL(file));
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!file) {
            setError("Vous devez sélectionner une image.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const item = await createGalleryItem(file, description);
            toast.success(t("toastImageUpload"));
            navigate(`/gallery/${item.id}`);
        } catch {
            toast.error(t("toastImageUploadError"));
        } finally {
            setIsSubmitting(false);
        }
    }

return (
    <div className="p-6 w-[50%] mx-auto max-sm:w-full max-sm:p-2">
        <h1 className="max-w-xl mx-auto text-4xl font-semibold mb-4">{t("addPicture")}</h1>
        <form
            onSubmit={handleSubmit}
            className="max-w-xl mx-auto space-y-4 p-4 bg-white rounded shadow max-sm:p-4 max-sm:space-y-4"
        >
            {error && <p className="text-red-500 max-sm:text-base">{error}</p>}

            <div>
                <label className="block font-semibold">
                    {t("Image")}<span className="text-red-500">*</span>
                </label>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded cursor-pointer max-sm:w-3/4 max-sm:mx-auto max-sm:h-12"
                    disabled={isSubmitting}
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
            </div>

            {previewURL && (
                <div>
                    <img
                        src={previewURL}
                        alt="Aperçu"
                        className="h-40 object-cover rounded max-sm:w-full max-sm:h-32"
                    />
                </div>
            )}

            <div>
                <label className="block font-semibold max-sm:text-base">{t("description")}</label>
                <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border rounded px-2 py-1 max-sm:text-base"
                    disabled={isSubmitting}
                />
            </div>

            <div className="flex justify-between max-sm:flex-col max-sm:gap-2">
                <button
                    type="button"
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded cursor-pointer max-sm:w-3/4 max-sm:mx-auto max-sm:h-12"
                    onClick={() => navigate("/gallery")}
                    disabled={isSubmitting}
                >
                    {t("cancel")}
                </button>

                <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded disabled:opacity-50 cursor-pointer max-sm:w-3/4 max-sm:mx-auto max-sm:h-12"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? t("sending") : t("send")}
                </button>
            </div>
        </form>
    </div>
)

}

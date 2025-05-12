import { useState, ChangeEvent, FormEvent } from "react";
import { createGalleryItem } from "../../api/galleryService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function CreateGalleryItemPage() {
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState("");
    const navigate = useNavigate();

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setFile(e.target.files[0]);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error("Vous devez sélectionner une image.");
            return;
        }
        try {
            const item = await createGalleryItem(file, description);
            toast.success("Image ajoutée !");
            navigate(`/gallery/${item.id}`);
        } catch {
            toast.error("Erreur lors de l'ajout.");
        }
    };

    return (
        <div className="p-6 w-[40%] mx-auto">
            <h1 className="text-2xl font-bold mb-4">Ajouter une image</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-semibold">Image *</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                </div>
                <div>
                    <label className="block font-semibold">Description</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={3}
                        className="w-full border rounded px-2 py-1"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    Créer
                </button>
            </form>
        </div>
    );
}

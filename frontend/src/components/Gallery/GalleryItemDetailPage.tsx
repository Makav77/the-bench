import { useState, useEffect } from "react";
import { getGalleryItem, GalleryItemSummary, deleteGalleryItem, toggleLikeGalleryItem } from "../../api/galleryService";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

export default function GalleryItemDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [item, setItem] = useState<GalleryItemSummary | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (id) getGalleryItem(id).then(setItem).catch(() => toast.error("Impossible de charger"));
    }, [id]);

    if (!item) return <p>Loading...</p>;

    const isOwner = user?.id === item.author.id;
    const liked = item.likedBy.some(u => u.id === user?.id);

    const handleToggleLike = async () => {
        try {
            const updated = await toggleLikeGalleryItem(item.id);
            setItem(updated);
        } catch {
            toast.error("Impossible de liker/déliker");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Supprimer cette image ?")) return;
        try {
            await deleteGalleryItem(item.id);
            toast.success("Image supprimée");
            navigate("/gallery");
        } catch {
            toast.error("Impossible de supprimer");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow max-w-lg w-full">
                <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 cursor-pointer">← Retour</button>
                <img src={item.url} alt={item.description} className="w-full mb-4 rounded" />
                {item.description && <p className="mb-4">{item.description}</p>}
                <p className="text-sm text-gray-500 mb-4">
                    Posté par {item.author.firstname} {item.author.lastname} le {new Date(item.createdAt).toLocaleString()}
                </p>
                <div className="flex items-center space-x-4">
                    <button onClick={handleToggleLike} className="flex items-center">
                        {liked ? '💖' : '🤍'} {item.likedBy.length}
                    </button>
                    {(isOwner || user?.role==='admin') && (
                        <button onClick={handleDelete} className="text-red-600">Supprimer</button>
                    )}
                </div>
            </div>
        </div>
    );
}

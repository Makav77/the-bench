import { useState, useEffect } from "react";
import { GalleryItemSummary, getGalleryItems, toggleLikeGalleryItem } from "../../api/galleryService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

function GalleryPage() {
    const [galleryItems, setGalleryItems] = useState<GalleryItemSummary[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            setError(null);

            try {
                const { data, lastPage } = await getGalleryItems(page, 30);
                setGalleryItems(data);
                setLastPage(lastPage);
            } catch (error) {
                setError("Unable to load gallery items : " + error);
                toast.error("Unable to load gallery.");
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [page]);

    const handleToggleLike = async (id: string) => {
        try {
            const updated = await toggleLikeGalleryItem(id);
            setGalleryItems(galleryItems.map(i => (i.id === id ? updated : i)));
        } catch (error) {
            setError("Unable to like or unlike : " + error);
            toast.error("Unable to like or unline.");
        }
    };

    return (
        <div className="p-6 w-[60%] mx-auto">
            <div className="flex justify-content mb-4">
                <h1 className="text-2xl font-bold">Gallery</h1>
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={() => navigate("/gallery/create")}
                >
                    Add image
                </button>
            </div>

            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid grid-cols-3 gap 4">
                    {galleryItems.map(item => {
                        
                    })}
            )}
        </div>
    )
    
}

export default GalleryPage;
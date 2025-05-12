import { useState, useEffect } from "react";
import { GalleryItemSummary, getGalleryItems, toggleLikeGalleryItem } from "../../api/galleryService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import GalleryItemCard from "./GalleryItemCard";

function GalleryPage() {
    const [galleryItems, setGalleryItems] = useState<GalleryItemSummary[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        async function load() {
            setIsLoading(true);

            try {
                const { data, lastPage } = await getGalleryItems(page, 30);
                setGalleryItems(data);
                setLastPage(lastPage);
            } catch (error) {
                toast.error("Unable to load gallery : " + error);
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
            toast.error("Unable to like or unline : " + error);
        }
    };

    return (
        <div className="p-6 w-[50%] mx-auto">
            <div className="flex justify-end mb-4">
                <button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-fit cursor-pointer"
                    onClick={() => navigate("/gallery/create")}
                >
                    Add image
                </button>
            </div>

            <h1 className="text-2xl font-bold mb-4">Gallery</h1>

            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid grid-cols-3 gap 4">
                    {galleryItems.map(item => (
                        <GalleryItemCard
                            key={item.id}
                            galleryItem={item}
                            onClick={() => navigate(`/gallery/${item.id}`)}
                            onToggleLike={() => handleToggleLike(item.id)}
                            currentUserId={user?.id}
                        />
                    ))}
                </div>
            )}

            <div className="flex justify-center items-center mt-6 gap-4">
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                >
                    ← Prev
                </button>

                <span>
                    Page {page} / {lastPage}
                </span>

                <button
                    type="button"
                    disabled={page >= lastPage}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                >
                    Next →
                </button>
            </div>
        </div>
    )
    
}

export default GalleryPage;

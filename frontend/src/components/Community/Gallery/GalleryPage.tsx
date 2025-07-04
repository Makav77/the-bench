import { useState, useEffect } from "react";
import { GalleryItemSummary, getGalleryItems, toggleLikeGalleryItem } from "../../../api/galleryService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import GalleryItemCard from "./GalleryItemCard";
import { useTranslation } from "react-i18next";

function GalleryPage() {
    const [galleryItems, setGalleryItems] = useState<GalleryItemSummary[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation("Community/GalleryPage");

    useEffect(() => {
        async function load() {
            setIsLoading(true);

            try {
                const { data, lastPage } = await getGalleryItems(page, 30);
                setGalleryItems(data);
                setLastPage(lastPage);
            } catch {
                toast.error(t("toastLoadGalleryError"));
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
            toast.error(t("toastLikeUnlikeError"));
        }
    };

    return (
        <div className="p-6 w-[50%] mx-auto">
            <div className="flex justify-between mb-4">
                <button
                    type="button"
                    onClick={() => navigate("/community")}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded transition-colors duration-150 cursor-pointer mb-5"
                >
                    {t("back")}
                </button>

                <button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-fit cursor-pointer"
                    onClick={() => navigate("/gallery/create")}
                >
                    {t("addImage")}
                </button>
            </div>

            <h1 className="text-2xl font-bold mb-4">Gallery</h1>

            {isLoading ? (
                <p>{t("loading")}</p>
            ) : (
                <div className="grid grid-cols-3 gap-4">
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
                    {t("previous")}
                </button>

                <span>
                    {t("page")} {page} / {lastPage}
                </span>

                <button
                    type="button"
                    disabled={page >= lastPage}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                >
                    {t("next")}
                </button>
            </div>
        </div>
    )
    
}

export default GalleryPage;

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
    }, [page, t]);

    const handleToggleLike = async (id: string) => {
        try {
            const updated = await toggleLikeGalleryItem(id);
            setGalleryItems(galleryItems.map(i => (i.id === id ? updated : i)));
        } catch {
            toast.error(t("toastLikeUnlikeError"));
        }
    };

    return (
        <div className="w-[40%] mx-auto px-2 max-sm:w-full max-sm:p-6">
            <div className="mt-5 max-sm:mt-0">
                <button
                    type="button"
                    onClick={() => navigate("/community")}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded transition-colors duration-150 cursor-pointer mb-5 w-full sm:w-auto max-sm:h-12 max-sm:text-base max-sm:px-8"
                >
                    {t("back")}
                </button>
            </div>

            <div className="flex justify-end mb-4 h-10 max-sm:h-15">
                <button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 max-sm:px-8 rounded w-fit cursor-pointer"
                    onClick={() => navigate("/gallery/create")}
                >
                    {t("addImage")}
                </button>
            </div>

            <h1 className="text-3xl font-bold mb-4">Gallery</h1>

            {isLoading ? (
                <p className="max-sm:text-base">{t("loading")}</p>
            ) : (
                <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1 max-sm:gap-2">
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

            <div className="flex justify-center items-center mt-6 gap-4 max-sm:mt-10">
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer max-sm:text-base max-sm:px-5 max-sm:py-3"
                >
                    {t("previous")}
                </button>

                <span className="max-sm:text-sm">
                    {t("page")} {page} / {lastPage}
                </span>

                <button
                    type="button"
                    disabled={page >= lastPage}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer max-sm:text-base max-sm:px-5 max-sm:py-3"
                >
                    {t("next")}
                </button>
            </div>
        </div>
    );
}

export default GalleryPage;

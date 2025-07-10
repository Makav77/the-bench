import { useState, useEffect } from "react";
import { getGalleryItem, GalleryItemSummary, deleteGalleryItem, toggleLikeGalleryItem } from "../../../api/galleryService";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import ReportModal from "../../Utils/ReportModal";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function GalleryItemDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [galleryItem, setGalleryItem] = useState<GalleryItemSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showReportModal, setShowReportModal] = useState<boolean>(false);
    const { t } = useTranslation("Community/GalleryItemDetailPage");

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            setError(null);
            try {
                if (id) {
                    const galleryItem = await getGalleryItem(id);
                    setGalleryItem(galleryItem);
                }
            } catch {
                toast.error(t("toastLoadGalleryError"));
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [id, t]);

    if (isLoading) {
        return <p className="p-6">
            {t("loading")}
        </p>
    }

    if (error) {
        return <p className="text-red-500">
            {error}
        </p>
    }

    if (!galleryItem) {
        return <p>
            {t("emprtyGallery")}
        </p>;
    }

    const isAuthor = user?.id === galleryItem.author.id;
    const liked = galleryItem.likedBy.some(u => u.id === user?.id);

    const handleToggleLike = async () => {
        try {
            const updated = await toggleLikeGalleryItem(galleryItem.id);
            setGalleryItem(updated);
        } catch {
            toast.error(t("toastLikeUnlikeError"));
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(t("confirmAlert"));
        if (!confirmed) {
            return;
        }
        try {
            await deleteGalleryItem(id!);
            toast.success(t("toastImageDeleted"));
            navigate("/gallery");
        } catch {
            toast.error(t("toastImageDeletedError"));
        }
    };

    return (
        <div
            className="absolute left-0 top-0 w-full h-full flex items-center justify-center z-50 bg-black/30 backdrop-blur-xl max-sm:p-2"
            onClick={() => navigate("/gallery")}
        >
            <div
                className="bg-white p-6 rounded-2xl shadow max-w-lg w-full"
                onClick={(e => e.stopPropagation())}
            >
                <button 
                    onClick={() => navigate("/gallery")}
                    className="mb-4 text-blue-600 cursor-pointer text-2xl hover:underline"
                >
                        <X className="w-6 h-6 text-gray-600 hover:bg-gray-200 rounded-3xl" />
                </button>

                <img 
                    src={galleryItem.url} 
                    alt={galleryItem.description} 
                    className="w-full mb-4 rounded"
                />

                {galleryItem.description && <p className="mb-4">{galleryItem.description}</p>}

                <p className="text-sm text-gray-500 mb-4">
                    {t("publishedBy")}{" "}
                    <span
                        onClick={() => navigate(`/profile/${galleryItem.author.id}`)}
                        className="text-blue-600 hover:underline cursor-pointer"
                    >
                        {galleryItem.author.firstname} {galleryItem.author.lastname}
                    </span>{" "}
                    {t("on")} {new Date(galleryItem.createdAt).toLocaleString()}
                </p>

                <div className="flex justify-between items-center space-x-4">
                    <div className="flex space-x-4">
                        <button 
                            onClick={handleToggleLike} 
                            className="flex items-center cursor-pointer"
                        >
                            {liked ? '💖' : '🤍'} {galleryItem.likedBy.length}
                        </button>

                        <div>
                            {(isAuthor || user?.role==='admin') && (
                                <button 
                                    onClick={handleDelete} 
                                    className="text-red-600 cursor-pointer hover:underline px-2 py-1"
                                >
                                    {t("delete")}
                                </button>
                            )}
                        </div>
                    </div>

                    {!isAuthor && galleryItem.author.role !== "admin" && galleryItem.author.role !== "moderator" && (
                        <div>
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                            >
                                {t("report")}
                            </button>

                            {showReportModal && (
                                <ReportModal
                                    reportedUserId={galleryItem.author.id}
                                    reportedContentId={galleryItem.id}
                                    reportedContentType="GALLERY"
                                    onClose={() => setShowReportModal(false)}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

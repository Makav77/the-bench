import { useState, useEffect } from "react";
import { getGalleryItem, GalleryItemSummary, deleteGalleryItem, toggleLikeGalleryItem } from "../../../api/galleryService";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import ReportModal from "../../Utils/ReportModal";

export default function GalleryItemDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [galleryItem, setGalleryItem] = useState<GalleryItemSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showReportModal, setShowReportModal] = useState<boolean>(false);

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            setError(null);

            try {
                if (id) {
                    const galleryItem = await getGalleryItem(id);
                    setGalleryItem(galleryItem);
                }
            } catch (error) {
                console.error(error);
                toast.error("Unable to load gallery item");
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [id]);

    if (isLoading) {
        return <p className="p-6">Loading...</p>
    }

    if (error) {
        return <p className="text-red-500">{error}</p>
    }

    if (!galleryItem) {
        return <p>Loading...</p>;
    }

    const isOwner = user?.id === galleryItem.author.id;
    const liked = galleryItem.likedBy.some(u => u.id === user?.id);

    const handleToggleLike = async () => {
        try {
            const updated = await toggleLikeGalleryItem(galleryItem.id);
            setGalleryItem(updated);
        } catch {
            toast.error("Unable to like/unlike");
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm("You are about to delete an image. Would you like to confirm ?");
        if (!confirmed) {
            return;
        }
        
        try {
            await deleteGalleryItem(id!);
            toast.success("Image successfully deleted!");
            navigate("/gallery");
        } catch (error) {
            toast.error("Unable to delete image : " + error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow max-w-lg w-full">
                <button 
                    onClick={() => navigate("/gallery")}
                    className="mb-4 text-blue-600 cursor-pointer text-2xl hover:underline">
                        X Close
                </button>
                <img 
                    src={galleryItem.url} 
                    alt={galleryItem.description} 
                    className="w-full mb-4 rounded"
                />

                {galleryItem.description && <p className="mb-4">{galleryItem.description}</p>}

                <p className="text-sm text-gray-500 mb-4">
                    Published by {galleryItem.author.firstname} {galleryItem.author.lastname} on {new Date(galleryItem.createdAt).toLocaleString()}
                </p>

                <div className="flex justify-between items-center space-x-4">
                    <div className="flex space-x-4">
                        <button 
                            onClick={handleToggleLike} 
                            className="flex items-center"
                        >
                            {liked ? '💖' : '🤍'} {galleryItem.likedBy.length}
                        </button>


                        <div>
                            {(isOwner || user?.role==='admin') && (
                                <button 
                                    onClick={handleDelete} 
                                    className="text-red-600 cursor-pointer hover:underline px-2 py-1">Delete</button>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                        >
                            Report post
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

                </div>
            </div>
        </div>
    );
}

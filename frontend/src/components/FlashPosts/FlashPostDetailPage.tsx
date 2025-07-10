import { useState, useEffect } from "react";
import { getFlashPost, deleteFlashPost, FlashPostDetails } from "../../api/flashPostService";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import CountdownTimer from "./CountdownTimer";
import ReportModal from "../Utils/ReportModal";
import { useTranslation } from "react-i18next";

function FlashPostDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [flashPost, setFlashPost] = useState<FlashPostDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation("FlashPosts/FlashPostDetailPage");
    const { user } = useAuth();
    const [showReportModal, setShowReportModal] = useState<boolean>(false);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                if (id) {
                    const post = await getFlashPost(id);
                    setFlashPost(post);
                } else {
                    setError("Invalid ID")
                }
            } catch {
                toast.error(t("toastLoadFlashpostError"));
            } finally {
                setIsLoading(false);
            }
        };
        load()
    }, [id, t]);

    if (isLoading) {
        return <p className="p-6">
            {t("loading")}
        </p>
    }

    if (error) {
        return <p className="p-6 text-red-500">
            {error}
        </p>
    }

    if (!flashPost) {
        return null;
    }

    const isAuthor = user && flashPost && user.id === flashPost.author.id;
    const isAdminorModerator = user && (user.role === "admin" || user.role === "moderator");

    const handleDelete = async () => {
        const confirmed = window.confirm(t("confirmAlert"));
        if (!confirmed) {
            return;
        }

        try {
            await deleteFlashPost(id!);
            toast.success(t("toastFlashpostDeleted"));
            navigate("/bulletinsboard");
        } catch {
            toast.error(t("toastFlashpostDeletedError"));
        }
    };

    return (
        <div>
            <div className="p-6 space-y-4 mt-10 w-[20%] mx-auto bg-white rounded-2xl max-sm:w-[95%] max-sm:p-3 max-sm:mt-6 max-sm:space-y-6">
                <button
                    type="button"
                    onClick={() => navigate("/bulletinsboard")}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded transition-colors duration-150 cursor-pointer mb-5 max-sm:w-full max-sm:mb-3 max-sm:h-12"
                >
                    {t("back")}
                </button>

                <h1 className="text-2xl font-bold">
                    {flashPost.title}
                </h1>

                <p className="text-sm text-gray-600">
                    {t("publishedOn")} {new Date(flashPost.createdAt).toLocaleString()} <br />
                    {t("updatedOn")} {' '} {new Date(flashPost.updatedAt).toLocaleString()} <br />
                    {t("by")} {" "}
                    <span
                        onClick={() => navigate(`/profile/${flashPost.author.id}`)}
                        className="text-blue-600 hover:underline cursor-pointer"
                    >
                        {flashPost.author.firstname} {flashPost.author.lastname}
                    </span>
                </p>

                <div className="max-sm:text-center">
                    <CountdownTimer createdAt={flashPost.createdAt} />
                </div>

                <p className="whitespace-pre-wrap max-sm:text-base">
                    {flashPost.description}
                </p>

                {(isAuthor || isAdminorModerator) && (
                    <div className="mt-4 flex gap-2 justify-center max-sm:flex-col max-sm:gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(`/flashposts/${id}/edit`)}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50 cursor-pointer max-sm:py-2 max-sm:w-3/4 max-sm:mx-auto max-sm:h-12"
                        >
                            {t("editPost")}
                        </button>

                        <button
                            type="button"
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50 cursor-pointer max-sm:py-2 max-sm:w-3/4 max-sm:mx-auto max-sm:h-12"
                        >
                            {t("deletePost")}
                        </button>
                    </div>
                )}
            </div>

            {!isAuthor && flashPost.author.role !== "admin" && flashPost.author.role !== "moderator" && (
                <div className="w-[20%] mx-auto flex justify-end max-sm:w-[95%] max-sm:justify-center">
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="mt-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer max-sm:w-full max-sm:text-lg max-sm:py-3"
                    >
                        {t("report")}
                    </button>

                    {showReportModal && (
                        <ReportModal
                            reportedUserId={flashPost.author.id}
                            reportedContentId={flashPost.id}
                            reportedContentType="FLASHPOST"
                            onClose={() => setShowReportModal(false)}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default FlashPostDetailPage;

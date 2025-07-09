import { useState, useEffect } from "react";
import { getPost, deletePost, PostDetails } from "../../api/postService";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import ReportModal from "../Utils/ReportModal";
import { useTranslation } from "react-i18next";

function PostDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<PostDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation("Posts/PostDetailPage");
    const { user } = useAuth();
    const [showReportModal, setShowReportModal] = useState<boolean>(false);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);

            try {
                if (id) {
                    const post = await getPost(id);
                    setPost(post);
                } else {
                    setError("Invalid ID")
                }
            } catch {
                toast.error(t("toastLoadPostError"));
            } finally {
                setIsLoading(false);
            }
        };
        load()
    }, [id, t]);

    if (isLoading) {
        return <p className="p-6">{t("loading")}</p>
    }

    if (error) {
        return <p className="p-6 text-red-500">{error}</p>
    }

    if (!post) {
        return null;
    }

    const isAuthor = user && post && user.id === post.author.id;
    const isAdminorModerator = user && (user.role === "admin" || user.role === "moderator");

    const handleDelete = async () => {
        const confirmed = window.confirm(t("confirmAlert"));
        if (!confirmed) {
            return;
        }

        try {
            await deletePost(id!);
            toast.success(t("toastPostDeleted"));
            navigate("/bulletinsboard");
        } catch {
            toast.error(t("toastPostDeleted"));
        }
    };

    return (
        <div>
            <div className="p-6 space-y-4 mt-10 w-[20%] mx-auto bg-white rounded-2xl max-sm:w-[98%] max-sm:space-y-6 max-sm:mt-3">
                <button
                    type="button"
                    onClick={() => navigate("/bulletinsboard")}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded transition-colors duration-150 cursor-pointer
                        max-sm:text-lg max-sm:w-full max-sm:py-3 max-sm:mb-2"
                >
                    {t("back")}
                </button>

                <h1 className="text-3xl font-bold max-sm:text-2xl">{post.title}</h1>
                <p className="text-sm text-gray-600 max-sm:text-base">
                    {t("publishedOn")} {new Date(post.createdAt).toLocaleString()} <br />
                    {t("updatedOn")} {' '} {new Date(post.updatedAt).toLocaleString()} <br />
                    {t("by")} {" "}
                    <span
                        onClick={() => navigate(`/profile/${post.author.id}`)}
                        className="text-blue-600 hover:underline cursor-pointer"
                    >
                        {post.author.firstname} {post.author.lastname}
                    </span>
                </p>
                <p className="whitespace-pre-wrap max-sm:text-lg">{post.description}</p>

                {(isAuthor || isAdminorModerator) && (
                    <div className="mt-4 flex gap-2 justify-center max-sm:flex-col max-sm:gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(`/posts/${id}/edit`)}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50 cursor-pointer
                                max-sm:text-lg max-sm:w-full max-sm:py-3"
                        >
                            {t("editPost")}
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50 cursor-pointer
                                max-sm:text-lg max-sm:w-full max-sm:py-3"
                        >
                            {t("deletePost")}
                        </button>
                    </div>
                )}
            </div>

            {!isAuthor && post.author.role !== "admin" && post.author.role !== "moderator" && (
                <div className="w-[20%] mx-auto flex justify-end max-sm:w-full max-sm:justify-center">
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="mt-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer max-sm:text-lg max-sm:px-6 max-sm:py-3"
                    >
                        {t("reportPost")}
                    </button>

                    {showReportModal && (
                        <ReportModal
                            reportedUserId={post.author.id}
                            reportedContentId={post.id}
                            reportedContentType="POST"
                            onClose={() => setShowReportModal(false)}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default PostDetailPage;

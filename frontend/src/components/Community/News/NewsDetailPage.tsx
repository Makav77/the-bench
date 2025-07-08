import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { deleteNews, getOneNews, NewsDTO, getNewsLikes, toggleNewsLike, NewsLikesDTO } from "../../../api/newsService";
import { getComments, createComment, updateComment, deleteComment, toggleCommentLike, CommentDTO } from "../../../api/commentService";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import ReportModal from "../../Utils/ReportModal";
import { useTranslation } from "react-i18next";

function NewsDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [news, setNews] = useState<NewsDTO | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation("Community/NewsDetailPage");
    const { user } = useAuth();
    const [likes, setLikes] = useState<NewsLikesDTO>({ totalLikes: 0, liked: false });
    const [modalImage, setModalImage] = useState<string | null>(null);
    const [comments, setComments] = useState<CommentDTO[]>([]);
    const [commentInput, setCommentInput] = useState("");
    const [commentError, setCommentError] = useState<string | null>(null);
    const [commentLoading, setCommentLoading] = useState(false);
    const [editingComment, setEditingComment] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [showReportModal, setShowReportModal] = useState<boolean>(false);

    useEffect(() => {
        async function load() {
            if (!id) {
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const data = await getOneNews(id);
                setNews(data);
                const likesData = await getNewsLikes(id);
                setLikes(likesData);
                const comms = await getComments(id);
                setComments(comms);
            } catch (error) {
                setError("Unable to load article : " + error);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [id]);

    const handleCloseModal = () => setModalImage(null);

    const handleLike = async () => {
        if (!id) {
            return;
        }
        try {
            const response = await toggleNewsLike(id);
            setLikes(response);
        } catch {
            toast.error(t("toastLikeError"));
        }
    };

    if (isLoading) {
        return <div className="text-center p-6">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 p-6">{error}</div>;
    }

    if (!news) {
        return <div className="text-center p-6">No article found.</div>;
    }

    const canEditOrDelete = user && news && (
        user.role === "admin" ||
        user.role === "moderator" ||
        user.id === news.authorId
    );

    const handleDelete = async () => {
        if (!id) {
            return;
        }

        if (!window.confirm("You are about to delete this article. Would you like to confirm?")) {
            return;
        }

        try {
            await deleteNews(id);
            toast.success(t("toastArticleDeleted"));
            navigate("/news");
        } catch {
            toast.error(t("toastArticleDeleted"));
        }
    };

    const handleCommentSend = async () => {
        if (!id || !commentInput.trim()) {
            return;
        }

        setCommentLoading(true);
        try {
            const comment = await createComment(id, commentInput);
            setComments((prev) => [...prev, comment]);
            setCommentInput("");
        } catch (error) {
            setCommentError("Unable to send comment : " + error);
        } finally {
            setCommentLoading(false);
        }
    };

    const handleEditComment = (commentId: string, currentContent: string) => {
        setEditingComment(commentId);
        setEditContent(currentContent);
    };

    const handleUpdateComment = async (commentId: string) => {
        if (!id) {
            return;
        }

        setCommentLoading(true);
        try {
            const updated = await updateComment(id, commentId, editContent);
            setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
            setEditingComment(null);
        } catch (error) {
            setCommentError("Unable to edit comment : " + error);
        } finally {
            setCommentLoading(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!id) {
            return;
        }

        if (!window.confirm("You are about to delete this comment. Would you like to confirm ?")) {
            return;
        }

        setCommentLoading(true);
        try {
            await deleteComment(id, commentId);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
            toast.success(t("toastCommentDeleted"))
        } catch (error) {
            setCommentError(t("toastCommentDeletedError"));
        } finally {
            setCommentLoading(false);
        }
    };

    const handleToggleCommentLike = async (commentId: string) => {
        if (!id) {
            return;
        }

        try {
            const res = await toggleCommentLike(id, commentId);
            setComments((prev) =>
                prev.map((c) =>
                    c.id === commentId
                        ? { ...c, totalLikes: res.totalLikes, likedBy: res.liked ? [...c.likedBy, user?.id ?? ""] : c.likedBy.filter(uid => uid !== user?.id) }
                        : c
                )
            );
        } catch (error) {
            setCommentError("Unable to like this comment : " + error);
        }
    };

    return (
        <div>
            <div className="w-[30%] mx-auto py-5 px-10 bg-white rounded-xl shadow-lg mt-10">
                <button
                    type="button"
                    onClick={() => navigate("/news")}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded transition-colors duration-150 cursor-pointer mb-5"
                >
                    {t("back")}
                </button>

                <h1 className="text-3xl font-bold mb-4 text-center">{news.title}</h1>

                {news.images && news.images.length > 0 && (
                    <div className="flex justify-center mb-6">
                        <img
                            src={news.images[0]}
                            alt="Main article"
                            className="rounded-lg object-cover max-h-72"
                            style={{ maxWidth: "90%", margin: "0 auto" }}
                            onClick={() => setModalImage(news.images[0])}
                        />
                    </div>
                )}

                <div className="text-lg text-gray-800 whitespace-pre-line mb-6 px-2 text-justify break-words">
                    {news.content}
                </div>

                {news.images && news.images.length > 1 && (
                    <div className="flex flex-wrap gap-4 justify-center mb-6">
                        {news.images.slice(1).map((src, i) => (
                            <img
                                key={i}
                                src={src}
                                alt={`Image additionnelle ${i + 2}`}
                                className="w-32 h-32 object-cover rounded-lg cursor-pointer hover:scale-105 transition"
                                onClick={() => setModalImage(src)}
                            />
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-3 mb-2">
                    <button
                        onClick={handleLike}
                        className={`px-3 py-1 rounded cursor-pointer ${likes.liked ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"} hover:bg-blue-600`}
                        disabled={!user}
                    >
                        {likes.liked ? t("unlike") : t("like")} 👍
                    </button>
                    <span>{likes.totalLikes} {t("like")}{likes.totalLikes !== 1 ? "s" : ""}</span>
                </div>

                {canEditOrDelete && (
                    <div className="flex gap-3 mt-10 justify-center">
                        <button
                            onClick={() => navigate(`/news/${news.id}/edit`)}
                            className="px-4 py-2 rounded bg-yellow-400 text-white hover:bg-yellow-500 cursor-pointer"
                        >
                            {t("edit")}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                        >
                            {t("delete")}
                        </button>
                    </div>
                )}

                <div className="mt-10 border-t pt-6">
                    <h2 className="text-xl font-bold mb-3">{t("comments")}</h2>
                    {commentError && <p className="text-red-500">{commentError}</p>}

                    <div className="space-y-4 mb-4">
                        {comments.length === 0 && <p className="text-gray-500">{t("noComment")}</p>}
                        {comments.map((c) => (
                            <div
                                key={c.id}
                                className="bg-gray-50 p-3 rounded shadow-sm flex gap-3"
                            >
                                <img
                                    src={c.authorAvatar ?? "/backend/uploads/profile/default.png"}
                                    alt={c.authorName}
                                    className="w-10 h-10 rounded-full object-cover"
                                />

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{c.authorName}</span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(c.createdAt).toLocaleString()}
                                        </span>
                                    </div>

                                    {editingComment === c.id ? (
                                        <div className="flex flex-col gap-1">
                                            <textarea
                                                value={editContent}
                                                onChange={e => setEditContent(e.target.value)}
                                                className="w-full border rounded px-2 py-1"
                                            />
                                            <div className="flex gap-2 mt-1 justify-center">
                                                <button
                                                    className="bg-green-500 text-white font-semibold border cursor-pointer hover:bg-green-600 px-3 py-1 rounded-2xl"
                                                    onClick={() => handleUpdateComment(c.id)}
                                                >
                                                    {t("validate")}
                                                </button>

                                                <button
                                                    className="bg-red-500 text-white font-semibold border cursor-pointer hover:bg-red-600 px-3 py-1 rounded-2xl"
                                                    onClick={() => setEditingComment(null)}
                                                >
                                                    {t("cancel")}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-800">{c.content}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                        <button
                                            className={`text-sm ${c.likedBy.includes(user?.id ?? "") ? "text-blue-500" : "text-gray-500"} border px-3 py-1 rounded-3xl cursor-pointer`}
                                            onClick={() => handleToggleCommentLike(c.id)}
                                            disabled={!user}
                                        >
                                            {t("like")}
                                        </button>
                                        <span className="flex items-center gap-1 text-gray-700 text-sm">
                                            👍 {c.likedBy.length}
                                        </span>

                                        {(user?.id === c.authorId || user?.role === "admin" || user?.role === "moderator") && (
                                            <>
                                                <button
                                                    className="text-xs text-yellow-600 ml-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                                                    onClick={() => handleEditComment(c.id, c.content)}
                                                >
                                                    {t("edit")}
                                                </button>

                                                <button
                                                    className="text-xs text-red-500 ml-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                                                    onClick={() => handleDeleteComment(c.id)}
                                                >
                                                    {t("delete")}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {user && (
                        <div className="flex items-start gap-2 pt-10">
                            <img
                                src={user.profilePicture ?? "backend/uploads/profile/default.png"}
                                alt={user.firstname}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1 flex flex-col gap-2">
                                <textarea
                                    className="border rounded px-2 py-1 w-full"
                                    value={commentInput}
                                    onChange={e => setCommentInput(e.target.value)}
                                    rows={3}
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleCommentSend}
                                        disabled={commentLoading || !commentInput.trim()}
                                        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 disabled:opacity-80 cursor-pointer"
                                    >
                                        {t("publish")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {modalImage && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                        onClick={handleCloseModal}
                        style={{ cursor: "zoom-out" }}
                    >
                        <div
                            className="relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <img
                                src={modalImage}
                                alt="zoomed image"
                                className="max-w-[90vw] max-h-[90vh] rounded shadow-lg"
                            />
                            <button
                                className="absolute top-2 right-2 text-white bg-black bg-opacity-60 rounded-full p-2 text-2xl hover:bg-opacity-80 cursor-pointer"
                                onClick={handleCloseModal}
                                type="button"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {!canEditOrDelete && (
                <div className="w-[30%] mx-auto flex justify-end">
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="mt-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                    >
                        {t("report")}
                    </button>

                    {showReportModal && (
                        <ReportModal
                            reportedUserId={news.authorId}
                            reportedContentId={news.id}
                            reportedContentType="NEWS"
                            onClose={() => setShowReportModal(false)}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export default NewsDetailPage;

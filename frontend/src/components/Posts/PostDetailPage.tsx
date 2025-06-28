import { useState, useEffect } from "react";
import { getPost, deletePost, PostDetails } from "../../api/postService";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import ReportModal from "../Utils/ReportModal";

function PostDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<PostDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
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
            } catch (error) {
                toast.error("Unable to load post : " + error);
            } finally {
                setIsLoading(false);
            }
        };
        load()
    }, [id]);

    if (isLoading) {
        return <p className="p-6">Loading...</p>
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
        const confirmed = window.confirm("You are about to delete a post. Would you like to confirm?");
        if (!confirmed) {
            return;
        }

        try {
            await deletePost(id!);
            toast.success("Post successfully deleted!");
            navigate("/bulletinsboard");
        } catch (error) {
            toast.error("Unable to delete post : " + error);
        }
    };

    return (
        <>
            <div className="p-6 space-y-4 mt-10 w-[20%] mx-auto bg-white rounded-2xl">
                <button
                    type="button"
                    onClick={() => navigate("/bulletinsboard")}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded transition-colors duration-150 cursor-pointer"
                >
                    ← Back
                </button>

                <h1 className="text-2xl font-bold">{post.title}</h1>
                <p className="text-sm text-gray-600">
                Published on {new Date(post.createdAt).toLocaleString()} (update on{' '}
                    {new Date(post.updatedAt).toLocaleString()}) by{" "}
                    <span
                        onClick={() => navigate(`/profile/${post.author.id}`)}
                        className="text-blue-600 hover:underline cursor-pointer"
                    >
                        {post.author.firstname} {post.author.lastname}
                    </span>
                </p>
                <p className="whitespace-pre-wrap">{post.description}</p>

                {(isAuthor || isAdminorModerator) && (
                    <div className="mt-4 flex gap-2 justify-center">
                        <button
                            type="button"
                            onClick={() => navigate(`/posts/${id}/edit`)}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
                        >
                            Edit post
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
                        >
                            Delete post
                        </button>
                    </div>
                )}
            </div>

            {!isAuthor && post.author.role !== "admin" && post.author.role !== "moderator" && (
                <div className="w-[20%] mx-auto flex justify-end">
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="mt-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                    >
                        Report post
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
        </>
    );
}

export default PostDetailPage;

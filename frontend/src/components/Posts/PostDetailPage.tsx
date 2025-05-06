import { useState, useEffect } from "react";
import { getPost, deletePost, PostDetails } from "../../api/postService";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

function PostDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<PostDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();

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

    const isOwner = user && post && user.id === post.author.id;
    const isAdmin = user && user.role === "admin";

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
        <div className="pp-6 max-w-2xl mx-auto space-y-4">
            <button
                type="button"
                onClick={() => navigate("/bulletinsboard")}
                className="text-blue-600 underline cursor-pointer border rounded px-2 py-1 bg-white"
            >
                ← Back
            </button>

            <h1 className="text-2xl font-bold">{post.title}</h1>
            <p className="text-sm text-gray-600">
            Published on {new Date(post.createdAt).toLocaleString()} (update on{' '}
                {new Date(post.updatedAt).toLocaleString()}) by{' '}
                {post.author.firstname} {post.author.lastname}
            </p>
            <p className="whitespace-pre-wrap">{post.description}</p>

            {(isOwner || isAdmin) && (
                <div className="flex space-x-2">
                    <button
                        type="button"
                        onClick={() => navigate(`/posts/${id}/edit`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}

export default PostDetailPage;

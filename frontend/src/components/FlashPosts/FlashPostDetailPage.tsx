import { useState, useEffect } from "react";
import { getFlashPost, deleteFlashPost, FlashPostDetails } from "../../api/flashPostService";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

function FlashPostDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [flashPost, setFlashPost] = useState<FlashPostDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();

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
            } catch (error) {
                toast.error("Unable to load flash post : " + error);
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

    if (!flashPost) {
        return null;
    }

    const isOwner = user && flashPost && user.id === flashPost.author.id;
    const isAdmin = user && user.role === "admin";

    const handleDelete = async () => {
        const confirmed = window.confirm("You are about to delete a flash post. Would you like to confirm?");
        if (!confirmed) {
            return;
        }

        try {
            await deleteFlashPost(id!);
            toast.success("Flash Post successfully deleted!");
            navigate("/bulletinsboard");
        } catch (error) {
            toast.error("Unable to delete post : " + error);
        }
    };

    return (
        <div className="p-6 space-y-4 border mt-10 w-[20%] mx-auto">
            <button
                type="button"
                onClick={() => navigate("/bulletinsboard")}
                className="text-blue-600 underline cursor-pointer border rounded px-2 py-1 bg-white"
            >
                ← Back
            </button>

            <h1 className="text-2xl font-bold">{flashPost.title}</h1>
            <p className="text-sm text-gray-600">
            Published on {new Date(flashPost.createdAt).toLocaleString()} (update on{' '}
                {new Date(flashPost.updatedAt).toLocaleString()}) by{' '}
                {flashPost.author.firstname} {flashPost.author.lastname}
            </p>
            <p className="whitespace-pre-wrap">{flashPost.description}</p>

            {(isOwner || isAdmin) && (
                <div className="mt-4 flex gap-2 justify-center">
                    <button
                        type="button"
                        onClick={() => navigate(`/flashPosts/${id}/edit`)}
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
    );
}

export default FlashPostDetailPage;

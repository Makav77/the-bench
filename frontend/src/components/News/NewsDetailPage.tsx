import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { deleteNews, getOneNews, NewsDTO } from "../../api/newsService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

function NewsDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [news, setNews] = useState<NewsDTO | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();

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
            } catch (error) {
                setError("Unable to load article : " + error);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [id]);

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
            toast.success("Article deleted.");
            navigate("/news");
        } catch (error) {
            toast.error("Unable to delete this article : " + error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
                ← Back
            </button>

            {news.images && news.images.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-4">
                    {news.images.map((src, i) => (
                        <img
                            key={i}
                            src={src}
                            alt={`Image ${i + 1}`}
                            className="w-44 h-44 object-cover rounded border"
                        />
                    ))}
                </div>
            )}

            <h1 className="text-3xl font-bold mb-2">{news.title}</h1>
            <div className="text-gray-500 text-sm mb-4">
                Published on {new Date(news.createdAt).toLocaleDateString()}
            </div>

            {news.tags && news.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {news.tags.map((tag, i) => (
                        <span
                            key={i}
                            className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            <div className="text-lg text-gray-800 whitespace-pre-line">
                {news.content}
            </div>

            {canEditOrDelete && (
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => navigate(`/news/${news.id}/edit`)}
                        className="px-4 py-2 rounded bg-yellow-400 text-white hover:bg-yellow-500"
                    >
                        Edit
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    )
}

export default NewsDetailPage;

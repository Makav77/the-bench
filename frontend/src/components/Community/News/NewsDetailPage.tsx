import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { deleteNews, getOneNews, NewsDTO, getNewsLikes, toggleNewsLike, NewsLikesDTO } from "../../../api/newsService"; // //commentaire: Ajout des likes ici
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";

function NewsDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [news, setNews] = useState<NewsDTO | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [likes, setLikes] = useState<NewsLikesDTO>({ totalLikes: 0, liked: false });

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
            } catch (error) {
                setError("Unable to load article : " + error);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [id]);

    const handleLike = async () => {
        if (!id) {
            return;
        }
        try {
            const res = await toggleNewsLike(id);
            setLikes(res);
        } catch (error) {
            toast.error("Error while liking the article : " + error);
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
            toast.success("Article deleted.");
            navigate("/news");
        } catch (error) {
            toast.error("Unable to delete this article : " + error);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-5 px-10 bg-white rounded-xl shadow-lg mt-10">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
            >
                ← Back
            </button>

            <h1 className="text-3xl font-bold mb-4 text-center">{news.title}</h1>

            {news.images && news.images.length > 0 && (
                <div className="flex justify-center mb-6">
                    <img
                        src={news.images[0]}
                        alt="Main article"
                        className="rounded-lg object-cover max-h-72"
                        style={{ maxWidth: "90%", margin: "0 auto" }}
                    />
                </div>
            )}

            <div className="text-lg text-gray-800 whitespace-pre-line mb-6 px-2 text-justify">
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
                    {likes.liked ? "Unlike" : "Like"} 👍
                </button>
                <span>{likes.totalLikes} like{likes.totalLikes !== 1 ? "s" : ""}</span>
            </div>

            {canEditOrDelete && (
                <div className="flex gap-3 mt-10 justify-center">
                    <button
                        onClick={() => navigate(`/news/${news.id}/edit`)}
                        className="px-4 py-2 rounded bg-yellow-400 text-white hover:bg-yellow-500  cursor-pointer"
                    >
                        Edit
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600  cursor-pointer"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    )
}

export default NewsDetailPage;

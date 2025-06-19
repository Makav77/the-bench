import { useEffect, useState } from "react";
import { getAllNews, NewsDTO } from "../../../api/newsService";
import { useNavigate } from "react-router-dom";

function NewsPage() {
    const [news, setNews] = useState<NewsDTO[]>([]);
    const [page, setPage] = useState<number>(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);

            try {
                const { data, lastPage } = await getAllNews(page, 5);
                setNews(data);
                setLastPage(lastPage);
            } catch (error) {
                setError("Unable to load articles : " + error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [page]);

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <div className="flex justify-end mb-4 h-10">
                <button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-fit cursor-pointer"
                    onClick={() => navigate("/news/create")}
                >
                    Write an article
                </button>
            </div>

            <h1 className="text-3xl font-bold mb-8 text-center">Neighborhood News</h1>

            {loading && <div className="text-center">Chargement...</div>}
            {error && <div className="text-red-500 text-center mb-4">{error}</div>}

            {!loading && !error && news.length === 0 && (
                <div className="text-center text-gray-500">No articles yet.</div>
            )}

            <ul className="space-y-6">
                {!loading && !error && news.map(article => (
                    <li
                        key={article.id}
                        className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4"
                    >
                        {article.images && article.images.length > 0 && (
                            <img
                                src={article.images[0]}
                                alt="Main image of the article"
                                className="w-32 h-32 object-cover rounded"
                            />
                        )}

                        <div
                            className="flex-1"
                            onClick={() => navigate(`/news/${article.id}`)}
                        >
                            <h2 className="text-xl font-bold text-blue-700 hover:underline">{article.title}</h2>

                            <div className="text-gray-500 text-sm mb-2">
                                Published on {new Date(article.createdAt).toLocaleDateString()}
                            </div>

                            <p className="line-clamp-3 text-gray-800">
                                {article.content.slice(0, 200)}{article.content.length > 20 ? "..." : ""}
                            </p>

                            {article.tags && article.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {article.tags.map((tag, i) => (
                                        <span
                                            key={i}
                                            className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            <div className="flex justify-center items-center mt-6 gap-4">
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                >
                    ← Prev
                </button>

                <span>
                    Page {page} / {lastPage}
                </span>

                <button
                    type="button"
                    disabled={page >= lastPage}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}

export default NewsPage;

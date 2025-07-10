import { useEffect, useState } from "react";
import { getAllNews, NewsDTO } from "../../../api/newsService";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function NewsPage() {
    const [news, setNews] = useState<NewsDTO[]>([]);
    const [page, setPage] = useState<number>(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation("Community/NewsPage");

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
        <div className="w-[30%] mx-auto px-2 max-sm:w-full max-sm:p-6">
            <div className="mt-5 max-sm:mt-0">
                <button
                    type="button"
                    onClick={() => navigate("/community")}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded transition-colors duration-150 cursor-pointer mb-5 w-full sm:w-auto max-sm:h-12 max-sm:text-base max-sm:px-8"
                >
                    {t("back")}
                </button>
            </div>

            <div className="flex justify-end mb-4 h-10 max-sm:h-15">
                <button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 max-sm:px-8 rounded w-fit cursor-pointer"
                    onClick={() => navigate("/news/create")}
                >
                    {t("writeArticle")}
                </button>
            </div>

            <h1 className="text-3xl font-bold mb-5">
                {t("news")}
            </h1>

            {loading && <div className="text-center max-sm:text-lg">{t("loading")}</div>}
            {error && <div className="text-red-500 text-center mb-4">{error}</div>}

            {!loading && !error && news.length === 0 && (
                <div className="text-center text-gray-500">
                    {t("noArticle")}
                </div>
            )}

            <ul className="space-y-6 max-sm:space-y-4">
                {!loading && !error && news.map(article => (
                    <li
                        key={article.id}
                        className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4 cursor-pointer max-sm:gap-2"
                        onClick={() => navigate(`/news/${article.id}`)}
                    >
                        {article.images && article.images.length > 0 && (
                            <img
                                src={article.images[0]}
                                alt="Main image of the article"
                                className="w-32 h-32 object-cover rounded max-sm:w-full max-sm:h-36"
                            />
                        )}

                        <div className="flex-1 overflow-hidden max-sm:whitespace-normal">
                            <h2 className="text-xl font-bold text-blue-700 hover:underline">
                                {article.title}
                            </h2>

                            <div className="text-gray-500 text-sm mb-2">
                                {t("publishedOn")} {new Date(article.createdAt).toLocaleDateString()}
                            </div>

                            <p className="line-clamp-3 text-gray-800 max-sm:line-clamp-2">
                                {article.content}
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

                            <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                                <span role="img" aria-label="like">👍</span>
                                {article.totalLikes ?? 0} Like{article.totalLikes === 1 ? "" : "s"}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="flex justify-center items-center mt-6 gap-4 max-sm:mt-10">
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer max-sm:text-base max-sm:px-5 max-sm:py-3"
                >
                    {t("previous")}
                </button>

                <span className="max-sm:text-sm">
                    {t("page")} {page} / {lastPage}
                </span>

                <button
                    type="button"
                    disabled={page >= lastPage}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer max-sm:text-base max-sm:px-5 max-sm:py-3"
                >
                    {t("next")}
                </button>
            </div>
        </div>
    );
}

export default NewsPage;

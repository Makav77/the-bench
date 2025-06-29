import { useState, useEffect } from "react";
import { getPendingNews, validateNews, NewsSummary } from "../../api/newsService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function DashboardNews() {
    const [pageNews, setPageNews] = useState(1);
    const [lastPageNews, setLastPageNews] = useState(1);
    const [pendingNews, setPendingNews] = useState<NewsSummary[]>([]);
    const [loadingNews, setLoadingNews] = useState<boolean>(false);
    const [updatingNewsId, setUpdatingNewsId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function loadPendings() {
            setLoadingNews(true);
            try {
                const { data, lastPage } = await getPendingNews(pageNews, 5);
                setPendingNews(data);
                setLastPageNews(lastPage);
            } catch (error) {
                toast.error("Unable to load pending news : " + error);
            } finally {
                setLoadingNews(false);
            }
        }
        loadPendings();
    }, [pageNews]);

    const handleValidateNews = async (newsId: string) => {
        setUpdatingNewsId(newsId);
        try {
            await validateNews(newsId, { validated: true });
            toast.success("News validated.");
            setPendingNews((prev) => prev.filter((c) => c.id !== newsId));
        } catch (error) {
            toast.error("Unable to validate news : " + error);
        } finally {
            setUpdatingNewsId(null);
        }
    };

    const handleRejectNews = async (newsId: string) => {
        const reason = window.prompt("Please enter a reason for rejecting this news :", "");
        if (reason === null) {
            return;
        }
        if (reason.trim() === "") {
            toast.error("Rejection reason is required.");
            return;
        }
        setUpdatingNewsId(newsId);
        try {
            await validateNews(newsId, { validated: false, rejectedReason: reason.trim() });
            toast.success("News rejected.");
            setPendingNews((prev) => prev.filter((c) => c.id !== newsId));
        } catch (error) {
            toast.error("Unable to reject news : " + error);
        } finally {
            setUpdatingNewsId(null);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl space-y-8">
            <h2 className="text-2xl font-semibold">Waiting news</h2>
            {loadingNews ? (
                <p className="text-center">Loading news...</p>
            ) : pendingNews.length === 0 ? (
                <p className="text-center text-gray-600">
                    No waiting news
                </p>
            ) : (
                <ul className="space-y-4">
                    {pendingNews.map((news) => (
                        <li
                            key={news.id}
                            className="border rounded-lg p-4 shadow-sm space-y-2"
                        >
                            <div>
                                <p>
                                    <span className="font-semibold">Title :</span> {news.title}
                                </p>
                                <p>
                                    <span className="font-semibold">Author :</span>{" "}
                                    <span
                                        onClick={() => navigate(`/profile/${news.authorId}`)}
                                        className="text-blue-600 hover:underline cursor-pointer"
                                    >
                                        {news.authorFirstname} {news.authorLastname}
                                    </span>
                                </p>
                                <p>
                                    <span className="font-semibold">Date :</span>{" "}
                                    {news.createdAt && new Date(news.createdAt).toLocaleString()}
                                </p>
                                <p>
                                    <span className="font-semibold">Preview :</span>{" "}
                                    {news.content.slice(0, 200)}…
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleValidateNews(news.id)}
                                    disabled={updatingNewsId === news.id}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300 cursor-pointer"
                                >
                                    {updatingNewsId === news.id
                                        ? "Validation…"
                                        : "Validate"}
                                </button>
                                <button
                                    onClick={() => handleRejectNews(news.id)}
                                    disabled={updatingNewsId === news.id}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300 cursor-pointer"
                                >
                                    {updatingNewsId === news.id
                                        ? "Rejection..."
                                        : "Reject"}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex justify-center items-center mt-6 gap-4">
                <button
                    type="button"
                    disabled={pageNews <= 1}
                    onClick={() => setPageNews((p) => p - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                >
                    ← Prev
                </button>
                <span>
                    Page {pageNews} / {lastPageNews}
                </span>
                <button
                    type="button"
                    disabled={pageNews >= lastPageNews}
                    onClick={() => setPageNews((p) => p + 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}

export default DashboardNews;

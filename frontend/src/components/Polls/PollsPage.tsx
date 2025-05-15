import { useState, useEffect } from "react";
import { getAllPolls } from "../../api/pollService";
import { PollSummary } from "../../api/pollService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function PollsPage() {
    const [polls, setPolls] = useState<PollSummary[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            setError(null);

            try {
                const { data, lastPage } = await getAllPolls(page, 10);
                setPolls(data);
                setLastPage(lastPage);
            } catch (error) {
                setError("Unable to load polls : " + error);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [page]);

    return (
        <div className="p-6 w-[50%] mx-auto">
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">Polls list</h1>
                <button
                    onClick={() => navigate("/polls/create")}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Create a poll
                </button>
            </div>

            <ul className="space-y-4">
                {polls.map(p => (
                    <li
                        key={p.id}
                        className="p-4 border rounded hover:shadow cursor:pointer"
                        onClick={() => navigate(`/polls/${p.id}`)}
                    >
                        <strong>{p.question}</strong>
                        Created by {p.author.firstname} {p.author.lastname}
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
    )
}

export default PollsPage;
import { useState, useEffect } from "react";
import { getAllPolls } from "../../api/pollService";
import { PollSummary } from "../../api/pollService";
import { useNavigate } from "react-router-dom";
import PollCountdownTimer from "./PollCountdownTimer";

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

    if (isLoading) {
        return <p>Loading...</p>
    }

    if (error) {
        return <p className="text-red-500">{error}</p>
    }

    if (!polls) {
        return null;
    }

    return (
        <div className="w-[40%] mx-auto">
            <div className="mt-5">
                <button
                    onClick={() => navigate("/community")}
                    className="bg-gray-300 font-bold px-4 py-2 rounded-2xl cursor-pointer hover:bg-gray-200"
                >
                    ← Back to Community
                </button>
            </div>

            <div className="my-5 p-6  border">
                <div className="flex justify-between mb-4">
                    <h1 className="text-2xl font-bold">Polls list</h1>
                    <button
                        onClick={() => navigate("/polls/create")}
                        className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700"
                    >
                        Create a poll
                    </button>
                </div>

                <ul className="grid grid-cols-2 gap-4">
                    {polls.map(p => {
                        const isExpired = !!p.closesAt && new Date(p.closesAt) < new Date();
                        return (
                            <li
                                key={p.id}
                                className="p-4 border-2 rounded hover:shadow cursor-pointer"
                                onClick={() => navigate(`/polls/${p.id}`)}
                            >
                                <strong>{p.question}</strong>

                                <div className="flex justify-between">
                                    <p>{p.votes.length} votes</p>
                                    <p>
                                        {p.manualClosed || isExpired ? (
                                            <span className="text-gray-500 font-semibold text-sm">Closed</span>
                                        ) : p.closesAt ? (
                                            <PollCountdownTimer expiresAt={p.closesAt} />
                                        ) : (
                                            <span className="text-green-600 font-semibold text-sm">Open</span>
                                        )}
                                    </p>
                                </div>

                                <p className="text-sm text-gray-600">
                                    Created by {p.author.firstname} {p.author.lastname}
                                </p>
                            </li>
                        );
                    })}
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
        </div>
    )
}

export default PollsPage;

import { useState, useEffect } from "react";
import { getPoll, votePoll, closePoll, deletePoll } from "../../../api/pollService";
import { useParams, useNavigate } from "react-router-dom";
import { PollDetails } from "../../../api/pollService";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import PollCountdownTimer from "./PollCountdownTimer";
import usePermission from "../../Utils/usePermission";

function PollDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate= useNavigate();

    const { restricted, expiresAt, loading: permLoading } = usePermission("vote_poll");
    const [poll, setPoll] = useState<PollDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            setError(null);

            try {
                if (id) {
                    const poll = await getPoll(id);
                    setPoll(poll);
                }
            } catch (error) {
                console.error(error);
                toast.error("Unable to load poll.");
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [id]);

    if (isLoading) {
        return <p className="p-6">Loading...</p>
    }

    if (error) {
        return <p className="text-red-500">{error}</p>
    }

    if (!poll) {
        return null;
    }

    const isOwner = user && poll && user.id === poll.author.id;
    const isAdminorModerator = user && (user.role === "admin" || user.role === "moderator");
    const isClosed = poll.manualClosed || (!!poll.closesAt && new Date(poll.closesAt) < new Date());
    const hasVoted = poll.votes.some(v => v.voter.id === user?.id);

    const handleVote = async () => {
        try {
            const selected = Array.from(
                document.querySelectorAll<HTMLInputElement>("input[name=\"opt\"]:checked"))
                    .map(el => el.value);
                    const updated = await votePoll(poll.id, selected);
                    setPoll(updated);
                    toast.success("Voted.");
        } catch (error) {
            toast.error("Error : " + error);
        }
    };

    const handleClose = async () => {
        const confirmed = window.confirm("You are about to close the poll. Would you like to confirm?")
        if (!confirmed) {
            return;
        }

        try {
            await closePoll(poll.id);
            setPoll(await getPoll(poll.id));
            toast.success("Poll successfully closed!");
        } catch (error) {
            toast.error("Unable to close poll : " + error);
        }
    }

    const handleDelete = async () => {
        const confirmed = window.confirm("You are about to delete a poll. Would you like to confirm?");
        if (!confirmed) {
            return;
        }

        try {
            await deletePoll(id!);
            toast.success("Poll successfully deleted!");
            navigate("/polls");
        } catch (error) {
            toast.error("Unable to delete poll : " + error);
        }
    }

    if (permLoading) {
        return <p className="p-6">Checking permission...</p>;
    }

    const isExpired = !!poll.closesAt && new Date(poll.closesAt) < new Date();

    return (
        <div className="p-6 w-[30%] mx-auto space-y-4 bg-gray-200 rounded-2xl shadow mt-10">
            <div className="flex justify-between items-center">
                <button
                    type="button"
                    onClick={() => navigate("/polls")}
                    className="border px-3 py-1 rounded-xl cursor-pointer hover:bg-gray-300"
                >
                    ← Back
                </button>

                <div>
                    <p>
                        {poll.manualClosed || isExpired ? (
                            <span className="text-gray-500 font-semibold text-sm">Closed</span>
                        ) : poll.closesAt ? (
                            <PollCountdownTimer expiresAt={poll.closesAt} />
                        ) : (
                            <span className="text-green-600 font-semibold text-sm">Open</span>
                        )}
                    </p>
                </div>
            </div>

            <h1 className="text-2xl font-bold">{poll.question}</h1>

            {!isClosed ? (
                <div>
                    {poll.options.map(o => (
                        <label
                            key={o.id}
                            className="block"
                        >
                            <input
                                type={poll.type === "single" ? "radio":"checkbox"}
                                name="opt"
                                value={o.id}
                                disabled={isClosed || hasVoted}
                            />{" "}
                            {o.label}
                        </label>
                    ))}
                </div>
            ) : (
                <div>
                    <div className="mt-4 p-4 bg-white rounded-2xl shadow w-[60%] mx-auto">
                        <h2 className="text-xl font-semibold mb-2">Results :</h2>
                        {(() => {
                            const totalVotes = poll.options.reduce((sum, o) => sum + o.votesCount, 0);
                            const sorted = [...poll.options].sort((a, b) => b.votesCount - a.votesCount);

                            return sorted.map(o => {
                                const pct = totalVotes > 0
                                ? Math.round((o.votesCount / totalVotes) * 100)
                                : 0;
                        
                                return (
                                    <p key={o.id} className="text-sm">
                                        <div className="flex justify-between items-center">
                                            {o.label} 
                                            <span className="px-1 my-1 bg-blue-400 rounded">{pct}%</span>
                                        </div>
                                        <div className="border-t-1 h-1" />
                                    </p>
                                );
                            });
                        })()}
                    </div>
                </div>
            )}

            <div className="w-[80%] mx-auto flex justify-around mt-8">
                {!isClosed && !hasVoted ? (
                    restricted ? (
                        <p className="text-red-600 font-semibold">
                            You are no longer allowed to vote on this poll until{" "}
                            {new Date(expiresAt!).toLocaleString()}.
                        </p>
                    ) : (
                        <button
                            onClick={handleVote}
                            className="w-[25%] bg-green-600 text-white px-6 py-2 rounded cursor-pointer"
                        >
                            Vote
                        </button>
                    )
                ) : null}

                {(isOwner || isAdminorModerator) && !isClosed && (
                    <button
                        onClick={handleClose}
                        className="w-[25%] bg-yellow-600 text-white px-6 py-1 rounded cursor-pointer"
                    >
                        Close
                    </button>
                )}

                {(isOwner || isAdminorModerator) && (
                    <button
                        onClick={handleDelete}
                        className="w-[25%] bg-red-600 text-white px-6 py-1 rounded cursor-pointer"
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
}

export default PollDetailPage;

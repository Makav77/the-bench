import { useState, useEffect } from "react";
import { getPoll, votePoll, closePoll, deletePoll } from "../../api/pollService";
import { useParams, useNavigate } from "react-router-dom";
import { PollDetails } from "../../api/pollService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

function PollDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate= useNavigate();

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
    const isAdmin = user && user.role === "admin";
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
        await closePoll(poll.id);
        setPoll(await getPoll(poll.id));
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

    return (
        <div className="p-6 w-[50%] mx-auto space-y-4 bbg-white rounded shadow">
            <h1 className="text-xl font-bold">{poll.question}</h1>

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
                        {o.label} ({o.votesCount} votes)
                    </label>
                ))}
            </div>

            {!isClosed && !hasVoted && (
                <button onClick={handleVote} className="bg-green-600 text-white px-4 py-2 rounded">
                    Vote
                </button>
            )}

            {(isOwner || isAdmin) && !isClosed && (
                <button
                    onClick={handleClose}
                    className="bg-yellow-600 text-white px-4 py-2 rounded"
                >
                    Close
                </button>
            )}

            {(isOwner || isAdmin) && (
                <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded"
                >
                    Delete
                </button>
            )}

            {isClosed && <p className="text-gray-500">Poll closed</p>}
        </div>
    );
}

export default PollDetailPage;
import { useState, useEffect } from "react";
import { getChallenge, deleteChallenge, subscribeChallenge, unsubscribeChallenge, ChallengeSummary } from "../../api/challengeService";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

function ChallengeDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [challenge, setChallenge] = useState<ChallengeSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            setError(null);

            try {
                if (id) {
                    const event = await getChallenge(id);
                    setChallenge(event);
                }
            } catch(error) {
                console.error(error);
                toast.error("Unable to load event.");
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [id]);

    if (isLoading) {
        return <p className="p-6">Loading...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (!challenge) {
        return null;
    }

    const isOwner = user && challenge && user.id === challenge.author.id;
    const isAdmin = user && user.role === "admin";
    const isSubscribe = challenge.registrations.some((u) => u.user.id === user?.id);

    const handleSubscribe = async () => {
        try {
            const updated = await subscribeChallenge(id!);
            setChallenge(updated);
            toast.success("Successful registration !");
        } catch (error) {
            toast.error("Error during registration : " + error);
        }
    }

    const handleUnsubscribe = async () => {
        try {
            const updated = await unsubscribeChallenge(id!);
            setChallenge(updated);
            toast.success("Unsubscribe successful !");
        } catch (error) {
            toast.error("Error unsubscribing : " + error);
        }
    }

    const handleDelete = async () => {
        const confirmed = window.confirm("You are about to delete a challenge. Would you like to confirm?");
        if (!confirmed) {
            return;
        }

        try {
            await deleteChallenge(id!);
            toast.success("Challenge successfully deleted!");
            navigate("/challenges");
        } catch (error) {
            toast.error("Unable to delete challenge : " + error);
        }
    }

        return (
        <div className="p-6 w-[50%] mx-auto space-y-4 bg-white rounded shadow">
            <h1 className="text-2xl font-bold">{challenge.title}</h1>
            <p>{challenge.description}</p>
            <p>
                From {new Date(challenge.startDate).toLocaleDateString()} to {new Date(challenge.endDate).toLocaleDateString()}
            </p>
            <p>
                <strong>Success :</strong> {challenge.successCriteria}
            </p>
            <p>
                <strong>Registered :</strong> {challenge.registrations.length}
            </p>
            <p>
                <strong>Completions :</strong> {challenge.completions.filter((c) => c.validated).length}
            </p>

            <div className="flex gap-2">
                {!isSubscribe
                    ? <button
                        onClick={handleSubscribe}
                        className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
                    >
                        Subscribe
                    </button>
                    
                    : <button
                        onClick={handleUnsubscribe}
                        className="bg-yellow-600 text-white px-4 py-2 rounded cursor-pointer"
                    >
                        Unsubscribe
                    </button>
                }

                {(isOwner || isAdmin) &&
                    <button
                        onClick={() => navigate(`/challenges/${id}/edit`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
                    >
                        Edit
                    </button>
                }

                {(isOwner || isAdmin) &&
                    <button
                        onClick={handleDelete}
                        className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
                    >
                        Delete
                    </button>
                }
            </div>
        </div>
    );
}

export default ChallengeDetailPage;

import { useState, useEffect } from "react";
import { getChallenge, deleteChallenge, subscribeChallenge, unsubscribeChallenge, ChallengeSummary } from "../../../api/challengeService";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import usePermission from "../../Utils/usePermission";
import { format } from "date-fns";
import ReportModal from "../../Utils/ReportModal";


function ChallengeDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const { restricted, expiresAt, reason, loading: permLoading } = usePermission("register_challenge");
    const [challenge, setChallenge] = useState<ChallengeSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showReportModal, setShowReportModal] = useState<boolean>(false);

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
    const isAdminorModerator = user && (user.role === "admin" || user.role === "moderator");
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

    if (permLoading) {
        return <p className="p-6">Checking permissions...</p>
    }

    return (
        <div>
            <div className="p-6 w-[30%] mx-auto space-y-4 bg-white rounded-2xl shadow mt-10">
                <button
                        type="button"
                        onClick={() => navigate("/challenges")}
                        className="border px-3 py-1 rounded-xl cursor-pointer hover:bg-gray-300"
                    >
                        ← Back
                </button>

                <h1 className="text-2xl font-bold">{challenge.title}</h1>
                <p>{challenge.description}</p>
                <p className="italic text-sm">
                    From {new Date(challenge.startDate).toLocaleDateString()} to {new Date(challenge.endDate).toLocaleDateString()}
                </p>
                <p>
                    <strong>How to win :</strong> {challenge.successCriteria}
                </p>
                <p>
                    <strong>Registered :</strong> {challenge.registrations.length}
                </p>
                <p>
                    <strong>Completions :</strong> {challenge.completions.filter((c) => c.validated).length}
                </p>

                <div className="flex gap-2">
                    {!isSubscribe ? (
                        restricted ? (
                            <p className="text-red-600 text-l font-semibold text-center">
                                You are no longer allowed to register to a challenge until{" "}
                                {expiresAt
                                    ? format(new Date(expiresAt), "dd/MM/yyyy 'at' HH:mm")
                                    : "unknown date"}.
                                <br />
                                {reason && (
                                    <span>
                                        Reason: {reason}
                                        <br />
                                    </span>
                                )}
                                Contact a moderator or administrator for more information.
                            </p>
                        ) : (
                            <button
                                onClick={handleSubscribe}
                                className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer mx-auto"
                            >
                                Subscribe
                            </button>
                        )
                    ) : ( <button
                            onClick={handleUnsubscribe}
                            className="bg-yellow-600 text-white px-4 py-2 rounded cursor-pointer"
                        >
                            Unsubscribe
                        </button>
                    )}

                    {(isOwner || isAdminorModerator) &&
                        <button
                            onClick={() => navigate(`/challenges/${id}/edit`)}
                            className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
                        >
                            Edit
                        </button>
                    }

                    {(isOwner || isAdminorModerator) &&
                        <button
                            onClick={handleDelete}
                            className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
                        >
                            Delete
                        </button>
                    }
                </div>
            </div>

            <div className="w-[30%] mx-auto flex justify-end">
                <button
                    onClick={() => setShowReportModal(true)}
                    className="mt-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                >
                    Report challenge
                </button>

                {showReportModal && (
                    <ReportModal
                        reportedUserId={challenge.author.id}
                        reportedContentId={challenge.id}
                        reportedContentType="POST"
                        onClose={() => setShowReportModal(false)}
                    />
                )}
            </div>
        </div>
    );
}

export default ChallengeDetailPage;

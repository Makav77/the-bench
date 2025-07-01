import { useState, useEffect } from "react";
import { getPendingChallenges, getPendingCompletions, validateCompletion, PendingCompletion, validateChallenge, ChallengeSummary } from "../../api/challengeService";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

function DashboardChallenges() {
    const [pageChallenge, setPageChallenge] = useState(1);
    const [lastPageCompletion, setLastPageCompletion] = useState(1);
    const [pageCompletion, setPageCompletion] = useState(1);
    const [lastPageChallenge, setLastPageChallenge] = useState(1);
    const [pendingChallenges, setPendingChallenges] = useState<ChallengeSummary[]>([]);
    const [loadingChallenges, setLoadingChallenges] = useState<boolean>(false);
    const [updatingChallengeId, setUpdatingChallengeId] = useState<string | null>(null);
    const [pendingCompletions, setPendingCompletions] = useState<PendingCompletion[]>([]);
    const [loadingCompletions, setLoadingCompletions] = useState<boolean>(false);
    const [updatingCompletionId, setUpdatingCompletionId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function loadPendings() {
            setLoadingChallenges(true);
            try {
                const { data, lastPage } = await getPendingChallenges(pageChallenge, 5);
                setPendingChallenges(data);
                setLastPageChallenge(lastPage);
            } catch (error) {
                toast.error("Unable to load pending challenges : " + error);
            } finally {
                setLoadingChallenges(false);
            }

            setLoadingCompletions(true);
            try {
                const { data, lastPage } = await getPendingCompletions(pageCompletion, 5);
                setPendingCompletions(data);
                setLastPageCompletion(lastPage);
            } catch (error) {
                toast.error("Unable to load pending completions : " + error);
            } finally {
                setLoadingCompletions(false);
            }
        }
        loadPendings();
    }, [pageChallenge, pageCompletion]);

    const handleValidateChallenge = async (challengeId: string) => {
        setUpdatingChallengeId(challengeId);
        try {
            await validateChallenge(challengeId, { validated: true });
            toast.success("Challenge validated.");
            setPendingChallenges((prev) => prev.filter((c) => c.id !== challengeId));
        } catch (error) {
            toast.error("Unable to validate challenge : " + error);
        } finally {
            setUpdatingChallengeId(null);
        }
    };

    const handleRejectChallenge = async (challengeId: string) => {
        const reason = window.prompt("Please enter a reason for rejecting this challenge :", "");
        if (reason === null) {
            return;
        }
        if (reason.trim() === "") {
            toast.error("Rejection reason is required.");
        }
        setUpdatingChallengeId(challengeId);
        try {
            await validateChallenge(challengeId, { validated: false, rejectedReason: reason.trim() });
            toast.success("Challenge rejected.");
            setPendingChallenges((prev) => prev.filter((c) => c.id !== challengeId));
        } catch (error) {
            toast.error("Unable to reject challenge : " + error);
        } finally {
            setUpdatingChallengeId(null);
        }
    };

    const handleValidateCompletion = async (completion: PendingCompletion) => {
        setUpdatingCompletionId(completion.id);
        try {
            await validateCompletion(completion.challenge.id, completion.id, {
                validated: true,
            });
            toast.success("Completion validated.");
            setPendingCompletions((prev) => prev.filter((c) => c.id !== completion.id));
        } catch (error) {
            toast.error("Unable to validate completion : " + error);
        } finally {
            setUpdatingCompletionId(null);
        }
    };

    const handleRejectCompletion = async (completion: PendingCompletion) => {
        const reason = window.prompt("Please enter a reason for rejecting this completion :", "");
        if (reason === null) {
            return;
        }
        if (reason.trim() === "") {
            toast.error("Rejecttion reason needed.");
            return;
        }
        setUpdatingCompletionId(completion.id);
        try {
            await validateCompletion(completion.challenge.id, completion.id, {
                validated: false,
                rejectedReason: reason.trim(),
            });
            toast.success("Completion refused.");
            setPendingCompletions((prev) => prev.filter((c) => c.id !== completion.id));
        } catch (error) {
            toast.error("Unable to reject completion : " + error);
        } finally {
            setUpdatingCompletionId(null);
        }
    };

    if (loadingChallenges) {
        return <p className="p-6 text-center">Loading pending challenges...</p>
    }

    return (
        <div className="bg-white p-6 rounded-2xl space-y-8">
            <h2 className="text-2xl font-semibold">Waiting challenges</h2>
            {loadingChallenges ? (
                <p className="text-center">Loading challenge...</p>
            ) : pendingChallenges.length === 0 ? (
                <p className="text-center text-gray-600">
                    No waiting challenge
                </p>
            ) : (
                <ul className="space-y-4">
                    {pendingChallenges.map((challenge) => (
                        <li
                            key={challenge.id}
                            className="border rounded-lg p-4 shadow-sm space-y-2"
                        >
                            <div>
                                <p>
                                    <span className="font-semibold">Title :</span> {challenge.title}
                                </p>
                                <p>
                                    <span className="font-semibold">Author :</span>{" "}
                                    <span
                                        onClick={() => navigate(`/profile/${challenge.author.id}`)}
                                        className="text-blue-600 hover:underline cursor-pointer"
                                    >
                                        {challenge.author.firstname} {challenge.author.lastname}
                                    </span>
                                </p>
                                <p>
                                <span className="font-semibold">Dates :</span>{" "}
                                    {format(new Date(challenge.startDate), "dd/MM/yyyy")}
                                    {" "}–{" "}
                                    {format(new Date(challenge.endDate), "dd/MM/yyyy")}
                                </p>
                                <p>
                                    <span className="font-semibold">Success Criteria :</span>{" "}
                                    {challenge.successCriteria}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleValidateChallenge(challenge.id)}
                                    disabled={updatingChallengeId === challenge.id}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300 cursor-pointer"
                                >
                                    {updatingChallengeId === challenge.id
                                        ? "Validation…"
                                        : "Validate"}
                                </button>

                                <button
                                    onClick={() => handleRejectChallenge(challenge.id)}
                                    disabled={updatingChallengeId === challenge.id}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300 cursor-pointer"
                                >
                                    {updatingChallengeId === challenge.id
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
                    disabled={pageChallenge <= 1}
                    onClick={() => setPageChallenge((p) => p - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                >
                    ← Prev
                </button>

                <span>
                    Page {pageChallenge} / {lastPageChallenge}
                </span>

                <button
                    type="button"
                    disabled={pageChallenge >= lastPageChallenge}
                    onClick={() => setPageChallenge((p) => p + 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                >
                    Next →
                </button>
            </div>

            <hr className="my-6 border-gray-300" />

            <h2 className="text-2xl font-semibold">Waiting completions validation</h2>
            {loadingCompletions ? (
                <p className="text-center">Loading completions</p>
            ) : pendingCompletions.length === 0 ? (
                <p className="text-center text-gray-600">
                    No completions waiting
                </p>
            ) : (
                <ul className="space-y-4">
                    {pendingCompletions.map((completion) => (
                        <li
                            key={completion.id}
                            className="border rounded-lg p-4 shadow-sm space-y-2"
                        >
                            <div>
                                <p>
                                    <span className="font-semibold">User :</span>{" "}
                                    {completion.user.firstname} {completion.user.lastname}
                                </p>
                                <p>
                                    <span className="font-semibold">Challenge :</span>{" "}
                                    {completion.challenge.title}
                                </p>
                                <p>
                                    <span className="font-semibold">Date :</span>{" "}
                                    {format(new Date(completion.createdAt), "dd/MM/yyyy 'à' HH:mm")}
                                </p>
                                {completion.text && (
                                    <p>
                                        <span className="font-semibold">Proof :</span> {completion.text}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleValidateCompletion(completion)}
                                    disabled={updatingCompletionId === completion.id}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300 cursor-pointer"
                                >
                                    {updatingCompletionId === completion.id
                                        ? "Validation…"
                                        : "Validate"}
                                </button>
                                <button
                                    onClick={() => handleRejectCompletion(completion)}
                                    disabled={updatingCompletionId === completion.id}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300 cursor-pointer"
                                >
                                    {updatingCompletionId === completion.id
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
                    disabled={pageCompletion <= 1}
                    onClick={() => setPageCompletion((p) => p - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                >
                    ← Prev
                </button>

                <span>
                    Page {pageCompletion} / {lastPageCompletion}
                </span>

                <button
                    type="button"
                    disabled={pageCompletion >= lastPageCompletion}
                    onClick={() => setPageCompletion((p) => p + 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}

export default DashboardChallenges;

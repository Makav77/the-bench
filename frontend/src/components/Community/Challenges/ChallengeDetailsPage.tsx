import { useState, useEffect } from "react";
import { getChallenge, deleteChallenge, subscribeChallenge, unsubscribeChallenge, ChallengeSummary } from "../../../api/challengeService";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import usePermission from "../../Utils/usePermission";
import { format } from "date-fns";
import ReportModal from "../../Utils/ReportModal";
import SubmissionModal from "./SubmissionModal";
import { useTranslation } from "react-i18next";

function ChallengeDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation("Community/ChallengeDetailsPage");
    const { restricted, expiresAt, reason, loading: permLoading } = usePermission("register_challenge");
    const [challenge, setChallenge] = useState<ChallengeSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showParticipantModal, setShowParticipantModal] = useState<boolean>(false);
    const [showReportModal, setShowReportModal] = useState<boolean>(false);
    const [showSubmissionModal, setShowSubmissionModal] = useState<boolean>(false);

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            setError(null);
            try {
                if (id) {
                    const event = await getChallenge(id);
                    setChallenge(event);
                }
            } catch {
                toast.error(t("toastLoadChallengeError"));
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [id, t]);

    if (isLoading) {
        return <p className="p-6">
            {t("loading")}
        </p>;
    }

    if (error) {
        return <p className="text-red-500">
            {error}
        </p>;
    }

    if (!challenge) {
        return null;
    }

    const isAuthor = user && challenge && user.id === challenge.author.id;
    const canSubmit = challenge.status === "APPROVED" && user && !isAuthor && challenge.registrations.some((r) => r.user.id === user.id);
    const hasPendingCompletion = user && challenge.completions.some((c) => c.user.id === user.id && c.validated === false);
    const isAdminorModerator = user && (user.role === "admin" || user.role === "moderator");
    const isSubscribe = challenge.registrations.some((u) => u.user.id === user?.id);
    const hasValidatedCompletion = user && challenge && challenge.completions.some((c) => c.user.id === user.id && c.validated === true);

    const handleSubscribe = async () => {
        try {
            const updated = await subscribeChallenge(id!);
            setChallenge(updated);
            toast.success(t("toastSuccessfullRegistration"));
        } catch {
            toast.error(t("toastRegistrationError"));
        }
    }

    const handleUnsubscribe = async () => {
        try {
            const updated = await unsubscribeChallenge(id!);
            setChallenge(updated);
            toast.success(t("toastSuccessfullUnsubscribe"));
        } catch {
            toast.error(t("toastUnsubscribeError"));
        }
    }

    const handleDelete = async () => {
        const confirmed = window.confirm(t("confirmAlert"));
        if (!confirmed) {
            return;
        }

        try {
            await deleteChallenge(id!);
            toast.success(t("toastChallengeDeleted"));
            navigate("/challenges");
        } catch {
            toast.error(t("toastChallengeDeletedError"));
        }
    }

    if (permLoading) {
        return <p className="p-6">
            {t("checkingPermissions")}
        </p>
    }

    if (hasValidatedCompletion) {
        return (
            <div className="p-6 w-full sm:w-[30%] mx-auto space-y-4 bg-white rounded-2xl shadow mt-10">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                    <button
                        type="button"
                        onClick={() => navigate("/challenges")}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded transition-colors duration-150 cursor-pointer h-10 max-sm:h-12"
                    >
                        {t("back")}
                    </button>

                    {(isAuthor || isAdminorModerator) &&
                        <button
                            onClick={() => setShowParticipantModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer w-full sm:w-auto"
                        >
                            {t("participantList")}
                        </button>
                    }
                </div>

                <h1 className="text-2xl font-bold break-words">
                    {challenge.title}
                </h1>

                <p className="whitespace-pre-wrap break-words">
                    {challenge.description}
                </p>

                <p className="italic text-sm">
                    {t("from")} {new Date(challenge.startDate).toLocaleDateString()} {t("to")} {new Date(challenge.endDate).toLocaleDateString()}
                </p>

                <p className="-mt-2">
                    <strong>{t("howToWin")}</strong> {challenge.successCriteria}
                </p>

                <p className="-mt-3">
                    <strong>{t("author")}</strong>{" "}
                    <span
                        onClick={() => navigate(`/profile/${challenge.author.id}`)}
                        className="text-blue-600 hover:underline cursor-pointer"
                    >
                        {challenge.author.firstname} {challenge.author.lastname}
                    </span>
                </p>

                <p className="-mt-3">
                    <strong>{t("registeredLength")}</strong> {challenge.registrations.length}
                </p>

                <p className="-mt-3">
                    <strong>{t("completions")}</strong> {challenge.completions.filter((c) => c.validated).length}
                </p>

                <p className="px-4 py-2 bg-green-200 text-green-800 rounded text-center">
                    {t("congratulations")}
                </p>

                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    {(isAuthor || isAdminorModerator) &&
                        <button
                            onClick={() => navigate(`/challenges/${id}/edit`)}
                            className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer w-full sm:w-auto"
                        >
                            {t("edit")}
                        </button>
                    }

                    {(isAuthor || isAdminorModerator) &&
                        <button
                            onClick={handleDelete}
                            className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer w-full sm:w-auto"
                        >
                            {t("delete")}
                        </button>
                    }
                </div>

                {showParticipantModal && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-start pt-20 z-50">
                        <div className="bg-white rounded p-4 sm:p-6 w-full max-w-xs sm:max-w-md overflow-auto">
                            <h2 className="text-xl font-bold mb-4">
                                {t("registered")} ({challenge.registrations.length})
                            </h2>
                            <ul className="space-y-2">
                                {challenge.registrations.map((registration) => (
                                    <div key={registration.user.id}>
                                        <li className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-1 sm:px-5">
                                            <span>{registration.user.firstname} {registration.user.lastname}</span>
                                            <span className="text-sm text-gray-500">
                                                {t("registeredOn")} {new Date(registration.createdAt).toLocaleDateString()} {t("at")} {new Date(registration.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </li>
                                        <div className="border-t h-px text-black w-3/4 mx-auto" />
                                    </div>
                                ))}
                            </ul>
                            <button
                                onClick={() => setShowParticipantModal(false)}
                                className="mt-8 bg-gray-200 px-3 py-1 rounded hover:bg-gray-400 cursor-pointer block mx-auto"
                            >
                                {t("close")}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
            <div className="p-6 space-y-4 mt-10 w-[20%] mx-auto bg-white rounded-2xl max-sm:w-[98%] max-sm:space-y-6 max-sm:mt-3">
                <div className="flex justify-between gap-4 max-sm:flex-col max-sm:gap-2">
                    <button
                        type="button"
                        onClick={() => navigate("/challenges")}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded transition-colors duration-150 cursor-pointer h-10 max-sm:h-12"
                    >
                        {t("back")}
                    </button>

                    {(isAuthor || isAdminorModerator) &&
                        <button
                            onClick={() => setShowParticipantModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 border rounded cursor-pointer max-sm:text-base max-sm:py-2 max-sm:w-3/4 max-sm:mx-auto max-sm:h-12"
                        >
                            {t("participantList")}
                        </button>
                    }
                </div>

                <h1 className="text-2xl font-bold break-words">
                    {challenge.title}
                </h1>

                <p className="whitespace-pre-wrap break-words">
                    {challenge.description}
                </p>

                <p className="italic text-sm">
                    {t("from")} {new Date(challenge.startDate).toLocaleDateString()} {t("to")} {new Date(challenge.endDate).toLocaleDateString()}
                </p>

                <p className="-mt-2">
                    <strong>{t("howToWin")}</strong> {challenge.successCriteria}
                </p>

                <p className="-mt-3">
                    <strong>{t("author")}</strong>{" "}
                    <span
                        onClick={() => navigate(`/profile/${challenge.author.id}`)}
                        className="text-blue-600 hover:underline cursor-pointer"
                    >
                        {challenge.author.firstname} {challenge.author.lastname}
                    </span>
                </p>

                <p className="-mt-3">
                    <strong>{t("registeredLength")}</strong> {challenge.registrations.length}
                </p>

                <p className="-mt-3">
                    <strong>{t("completions")}</strong> {challenge.completions.filter((c) => c.validated).length}
                </p>

                <div className="flex flex-col sm:flex-row gap-2 mt-10 justify-center">
                    {!isSubscribe && !(user && user.id === challenge.author.id) && !hasValidatedCompletion ? (
                        restricted ? (
                            <p className="text-red-600 text-l font-semibold text-center">
                                {t("restrictionMessage")} {" "}
                                {expiresAt
                                    ? format(new Date(expiresAt), "dd/MM/yyyy 'at' HH:mm")
                                    : "unknown date"}.
                                <br />
                                {reason && (
                                    <span>
                                        {t("reason")} {reason}
                                        <br />
                                    </span>
                                )}
                                {t("contactMessage")}
                            </p>
                        ) : (
                            <button
                                onClick={handleSubscribe}
                                className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer w-full sm:w-auto"
                            >
                                {t("subscribe")}
                            </button>
                        )
                    ) : (
                        isSubscribe && !hasValidatedCompletion && (
                            <button
                                onClick={handleUnsubscribe}
                                className="bg-yellow-600 text-white px-4 py-2 rounded cursor-pointer w-full sm:w-auto"
                            >
                                {t("unsubscribe")}
                            </button>
                        )
                    )}

                    {(isAuthor || isAdminorModerator) &&
                        <button
                            onClick={() => navigate(`/challenges/${id}/edit`)}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50 cursor-pointer max-sm:text-base max-sm:py-2 max-sm:w-3/4 max-sm:mx-auto max-sm:h-12"
                        >
                            {t("edit")}
                        </button>
                    }

                    {(isAuthor || isAdminorModerator) &&
                        <button
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50 cursor-pointer max-sm:text-base max-sm:py-2 max-sm:w-3/4 max-sm:mx-auto max-sm:h-12"
                        >
                            {t("delete")}
                        </button>
                    }

                    {!hasValidatedCompletion && (
                        hasPendingCompletion ? (
                            <p className="px-4 py-2 bg-yellow-200 text-yellow-800 rounded text-center">
                                {t("waitingValidation")}
                            </p>
                        ) : (
                            canSubmit && (
                                <button
                                    onClick={() => setShowSubmissionModal(true)}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer w-full sm:w-auto"
                                >
                                    {t("validateCompletion")}
                                </button>
                            )
                        )
                    )}
                </div>
            </div>

            {!isAuthor && challenge.author.role !== "admin" && challenge.author.role !== "moderator" && (
                <div className="w-full sm:w-[30%] mx-auto flex justify-end">
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="mt-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                    >
                        {t("report")}
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
            )}

            {showSubmissionModal && (
                <SubmissionModal
                    challengeId={challenge.id}
                    onClose={() => setShowSubmissionModal(false)}
                    onSubmitted={async () => {
                        toast.success(t("toastSubmissionSent"));
                        setShowSubmissionModal(false);
                        try {
                            const updated = await getChallenge(id!);
                            setChallenge(updated);
                        } catch (err) {
                            console.error("Erreur rechargement challenge :", err);
                        }
                    }}
                />
            )}

            {showParticipantModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-start pt-20 z-50">
                    <div className="bg-white rounded p-4 sm:p-6 w-full max-w-xs sm:max-w-md overflow-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {t("registered")} ({challenge.registrations.length})
                        </h2>
                        <ul className="space-y-2">
                            {challenge.registrations.map((registration) => (
                                <div key={registration.user.id}>
                                    <li className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-1 sm:px-5">
                                        <span>{registration.user.firstname} {registration.user.lastname}</span>
                                        <span className="text-sm text-gray-500">
                                            {t("registeredOn")} {new Date(registration.createdAt).toLocaleDateString()} {t("at")} {new Date(registration.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </li>
                                    <div className="border-t h-px text-black w-3/4 mx-auto" />
                                </div>
                            ))}
                        </ul>
                        <button
                            onClick={() => setShowParticipantModal(false)}
                            className="mt-8 bg-gray-200 px-3 py-1 rounded hover:bg-gray-400 cursor-pointer block mx-auto"
                        >
                            {t("close")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChallengeDetailPage;

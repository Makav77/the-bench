import { useState, useEffect } from "react";
import { getPendingChallenges, getPendingCompletions, validateCompletion, PendingCompletion, validateChallenge, ChallengeSummary } from "../../api/challengeService";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation("Dashboard/DashboardChallenges");

    useEffect(() => {
        async function loadPendings() {
            setLoadingChallenges(true);
            try {
                const { data, lastPage } = await getPendingChallenges(pageChallenge, 5);
                setPendingChallenges(data);
                setLastPageChallenge(lastPage);
            } catch {
                toast.error(t("toastLoadPendingChallengeError"));
            } finally {
                setLoadingChallenges(false);
            }

            setLoadingCompletions(true);
            try {
                const { data, lastPage } = await getPendingCompletions(pageCompletion, 5);
                setPendingCompletions(data);
                setLastPageCompletion(lastPage);
            } catch {
                toast.error(t("toastLoadPendingCompletionsError"));
            } finally {
                setLoadingCompletions(false);
            }
        }
        loadPendings();
    }, [pageChallenge, pageCompletion, t]);

    const handleValidateChallenge = async (challengeId: string) => {
        setUpdatingChallengeId(challengeId);
        try {
            await validateChallenge(challengeId, { validated: true });
            toast.success(t("toastChallengeValidated"));
            setPendingChallenges((prev) => prev.filter((c) => c.id !== challengeId));
        } catch {
            toast.error(t("toastChallengeValidatedError"));
        } finally {
            setUpdatingChallengeId(null);
        }
    };

    const handleRejectChallenge = async (challengeId: string) => {
        const reason = window.prompt(t("confirmAlertChallenge"), "");
        if (reason === null) {
            return;
        }

        if (reason.trim() === "") {
            toast.error(t("toastRejectedReasonRequired"));
        }

        setUpdatingChallengeId(challengeId);

        try {
            await validateChallenge(challengeId, { validated: false, rejectedReason: reason.trim() });
            toast.success(t("toastChallengeRejected"));
            setPendingChallenges((prev) => prev.filter((c) => c.id !== challengeId));
        } catch {
            toast.error(t("toastChallengeRejectedError"));
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
            toast.success(t("toastCompletionValidated"));
            setPendingCompletions((prev) => prev.filter((c) => c.id !== completion.id));
        } catch {
            toast.error(t("toastCompletionValidatedError"));
        } finally {
            setUpdatingCompletionId(null);
        }
    };

    const handleRejectCompletion = async (completion: PendingCompletion) => {
        const reason = window.prompt(t("confirmAlertCompletion"), "");
        if (reason === null) {
            return;
        }

        if (reason.trim() === "") {
            toast.error(t("toastRejectedReasonRequired"));
            return;
        }

        setUpdatingCompletionId(completion.id);

        try {
            await validateCompletion(completion.challenge.id, completion.id, {
                validated: false,
                rejectedReason: reason.trim(),
            });
            toast.success(t("toastCompletionRefused"));
            setPendingCompletions((prev) => prev.filter((c) => c.id !== completion.id));
        } catch {
            toast.error(t("toastCompletionRefused"));
        } finally {
            setUpdatingCompletionId(null);
        }
    };

    if (loadingChallenges) {
        return <p className="p-6 text-center">
            {t("loadingPending")}
        </p>
    }

    return (
        <div className="bg-white p-6 rounded-2xl space-y-8 max-sm:p-2">
            <h2 className="text-2xl font-semibold max-sm:text-3xl max-sm:text-center">
                {t("waitingChallenges")}
            </h2>

            {loadingChallenges ? (
                <p className="text-center">
                    {t("loadingChallenges")}
                </p>
            ) : pendingChallenges.length === 0 ? (
                <p className="text-center text-gray-600">
                    {t("noWaitingChallenge")}
                </p>
            ) : (
                <ul className="space-y-4">
                    {pendingChallenges.map((challenge) => (
                        <li
                            key={challenge.id}
                            className="border rounded-lg p-4 shadow-sm space-y-2 max-sm:p-2"
                        >
                            <div>
                                <p>
                                    <span className="font-semibold">{t("title")}</span> {challenge.title}
                                </p>
                                <p>
                                    <span className="font-semibold">{t("author")}</span>{" "}
                                    <span
                                        onClick={() => navigate(`/profile/${challenge.author.id}`)}
                                        className="text-blue-600 hover:underline cursor-pointer"
                                    >
                                        {challenge.author.firstname} {challenge.author.lastname}
                                    </span>
                                </p>
                                <p>
                                    <span className="font-semibold">{t("dates")}</span>{" "}
                                    {format(new Date(challenge.startDate), "dd/MM/yyyy")}
                                    {" "}–{" "}
                                    {format(new Date(challenge.endDate), "dd/MM/yyyy")}
                                </p>
                                <p>
                                    <span className="font-semibold">{t("successCriteria")}</span>{" "}
                                    {challenge.successCriteria}
                                </p>
                            </div>

                            <div className="flex gap-2 max-sm:flex-col max-sm:gap-3">
                                <button
                                    onClick={() => handleValidateChallenge(challenge.id)}
                                    disabled={updatingChallengeId === challenge.id}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300 cursor-pointer max-sm:text-lg max-sm:py-2 max-sm:w-3/4 max-sm:mx-auto"
                                >
                                    {updatingChallengeId === challenge.id
                                        ? t("validationChallenge")
                                        : t("validateChallenge")}
                                </button>

                                <button
                                    onClick={() => handleRejectChallenge(challenge.id)}
                                    disabled={updatingChallengeId === challenge.id}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300 cursor-pointer max-sm:text-lg max-sm:py-2 max-sm:w-3/4 max-sm:mx-auto"
                                >
                                    {updatingChallengeId === challenge.id
                                        ? t("rejectionChallenge")
                                        : t("rejectChallenge")}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex justify-center items-center mt-6 gap-4 max-sm:gap-2">
                <button
                    type="button"
                    disabled={pageChallenge <= 1}
                    onClick={() => setPageChallenge((p) => p - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer max-sm:text-base max-sm:py-2 max-sm:px-2"
                >
                    {t("previous")}
                </button>

                <span className="max-sm:text-base">
                    {t("page")} {pageChallenge} / {lastPageChallenge}
                </span>

                <button
                    type="button"
                    disabled={pageChallenge >= lastPageChallenge}
                    onClick={() => setPageChallenge((p) => p + 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer max-sm:text-base max-sm:py-2 max-sm:px-2"
                >
                    {t("next")}
                </button>
            </div>

            <hr className="my-6 border-gray-300 max-sm:my-3" />

            <h2 className="text-2xl font-semibold max-sm:text-3xl max-sm:text-center">
                {t("waitingCompletions")}
            </h2>

            {loadingCompletions ? (
                <p className="text-center">
                    {t("loadingCompletions")}
                </p>
            ) : pendingCompletions.length === 0 ? (
                <p className="text-center text-gray-600">
                    {t("noWaitingCompletion")}
                </p>
            ) : (
                <ul className="space-y-4">
                    {pendingCompletions.map((completion) => (
                        <li
                            key={completion.id}
                            className="border rounded-lg p-4 shadow-sm space-y-2 max-sm:p-2"
                        >
                            <div>
                                <p>
                                    <span className="font-semibold">{t("user")}</span>{" "}
                                    {completion.user.firstname} {completion.user.lastname}
                                </p>

                                <p>
                                    <span className="font-semibold">{t("challenge")}</span>{" "}
                                    {completion.challenge.title}
                                </p>

                                <p>
                                    <span className="font-semibold">{t("date")}</span>{" "}
                                    {format(new Date(completion.createdAt), "dd/MM/yyyy 'à' HH:mm")}
                                </p>

                                {completion.text && (
                                    <p>
                                        <span className="font-semibold">{t("proof")}</span> {completion.text}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2 max-sm:flex-col max-sm:gap-3">
                                <button
                                    onClick={() => handleValidateCompletion(completion)}
                                    disabled={updatingCompletionId === completion.id}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300 cursor-pointer max-sm:text-lg max-sm:py-2 max-sm:w-3/4 max-sm:mx-auto"
                                >
                                    {updatingCompletionId === completion.id
                                        ? t("validationCompletion")
                                        : t("validateCompletion")}
                                </button>

                                <button
                                    onClick={() => handleRejectCompletion(completion)}
                                    disabled={updatingCompletionId === completion.id}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300 cursor-pointer max-sm:text-lg max-sm:py-2 max-sm:w-3/4 max-sm:mx-auto"
                                >
                                    {updatingCompletionId === completion.id
                                        ? t("rejectionCompletion")
                                        : t("rejectCompletion")}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex justify-center items-center mt-6 gap-4 max-sm:gap-2">
                <button
                    type="button"
                    disabled={pageCompletion <= 1}
                    onClick={() => setPageCompletion((p) => p - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer max-sm:text-base max-sm:py-2 max-sm:px-2"
                >
                    {t("previous")}
                </button>

                <span className="max-sm:text-base">
                    {t("page")} {pageCompletion} / {lastPageCompletion}
                </span>

                <button
                    type="button"
                    disabled={pageCompletion >= lastPageCompletion}
                    onClick={() => setPageCompletion((p) => p + 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer max-sm:text-base max-sm:py-2 max-sm:px-2"
                >
                    {t("next")}
                </button>
            </div>
        </div>
    );
}

export default DashboardChallenges;

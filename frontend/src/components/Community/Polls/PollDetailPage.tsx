import { useState, useEffect } from "react";
import { getPoll, votePoll, closePoll, deletePoll } from "../../../api/pollService";
import { useParams, useNavigate } from "react-router-dom";
import { PollDetails } from "../../../api/pollService";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import PollCountdownTimer from "./PollCountdownTimer";
import usePermission from "../../Utils/usePermission";
import { format } from "date-fns";
import ReportModal from "../../Utils/ReportModal";
import { useTranslation } from "react-i18next";

function PollDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate= useNavigate();
    const { t } = useTranslation("Community/PollDetailPage");

    const { restricted, expiresAt, reason, loading: permLoading } = usePermission("vote_poll");
    const [poll, setPoll] = useState<PollDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showReportModal, setShowReportModal] = useState<boolean>(false);

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            setError(null);

            try {
                if (id) {
                    const poll = await getPoll(id);
                    setPoll(poll);
                }
            } catch {
                toast.error(t("toastLoadPollError"));
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [id]);

    if (isLoading) {
        return <p className="p-6">{t("loading")}</p>
    }

    if (error) {
        return <p className="text-red-500">{error}</p>
    }

    if (!poll) {
        return null;
    }

    const isAuthor = user && poll && user.id === poll.author.id;
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
                    toast.success(t("toastVoted"));
        } catch (error) {
            toast.error(t("toastVotedError"));
        }
    };

    const handleClose = async () => {
        const confirmed = window.confirm(t("confirmAlertClose"));
        if (!confirmed) {
            return;
        }

        try {
            await closePoll(poll.id);
            setPoll(await getPoll(poll.id));
            toast.success(t("toastPollClosed"));
        } catch {
            toast.error("toastPollClosedError");
        }
    }

    const handleDelete = async () => {
        const confirmed = window.confirm(t("confirmAlertDelete"));
        if (!confirmed) {
            return;
        }

        try {
            await deletePoll(id!);
            toast.success(t("toastPollDeleted"));
            navigate("/polls");
        } catch {
            toast.error(t("toastPollDeletedError"));
        }
    }

    if (permLoading) {
        return <p className="p-6">{t("checkingPermissons")}</p>;
    }

    const isExpired = !!poll.closesAt && new Date(poll.closesAt) < new Date();

    return (
        <div>
            <div className="p-6 w-[30%] mx-auto space-y-4 bg-white rounded-2xl shadow mt-10">
                <div className="flex justify-between items-center">
                    <button
                        type="button"
                        onClick={() => navigate("/polls")}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded transition-colors duration-150 cursor-pointer"
                    >
                        {t("back")}
                    </button>

                    <div>
                        <p>
                            {poll.manualClosed || isExpired ? (
                                <span className="text-gray-500 font-semibold text-sm">{t("closed")}</span>
                            ) : poll.closesAt ? (
                                <PollCountdownTimer expiresAt={poll.closesAt} />
                            ) : (
                                <span className="text-green-600 font-semibold text-sm">{t("open")}</span>
                            )}
                        </p>
                    </div>
                </div>

                <h1 className="text-2xl font-bold">{poll.question}</h1>

                <p className="text-sm text-gray-500 mb-4 -mt-3">
                    {t("publishedBy")} {" "}
                    <span
                        onClick={() => navigate(`/profile/${poll.author.id}`)}
                        className="text-blue-600 hover:underline cursor-pointer"
                    >
                        {poll.author.firstname} {poll.author.lastname}
                    </span>
                </p>

                {isAdminorModerator && (
                    <p className="text-red-500">
                        {t("adminAndModeratorCantVote")}
                    </p>
                )}

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
                                    disabled={!!(isClosed || hasVoted || isAdminorModerator)}
                                />{" "}
                                {o.label}
                            </label>
                        ))}
                    </div>
                ) : (
                    <div>
                        <div className="mt-4 p-4 bg-white rounded-2xl shadow w-[60%] mx-auto">
                            <h2 className="text-xl font-semibold mb-2">{t("results")}</h2>
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

                <div className={`${restricted ? 'w-[100%]' : 'w-[80%]'} mx-auto flex justify-around mt-8`}>
                    {!isClosed && !hasVoted && user?.role !== "admin" && user?.role !== "moderator" ? (
                        restricted ? (
                            <p className="text-red-600 font-semibold text-center">
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
                                onClick={handleVote}
                                className="w-[25%] bg-green-600 text-white px-6 py-2 rounded cursor-pointer"
                            >
                                {t("vote")}
                            </button>
                        )
                    ) : null}

                    {(isAuthor || isAdminorModerator) && !isClosed && (
                        <button
                            onClick={handleClose}
                            className="w-[25%] bg-yellow-600 text-white px-6 py-1 rounded cursor-pointer"
                        >
                            {t("close")}
                        </button>
                    )}

                    {(isAuthor || isAdminorModerator) && (
                        <button
                            onClick={handleDelete}
                            className="w-[25%] bg-red-600 text-white px-6 py-1 rounded cursor-pointer"
                        >
                            {t("delete")}
                        </button>
                    )}
                </div>
            </div>
            
            {!isAuthor && poll.author.role !== "admin" && poll.author.role !== "moderator" && (
                <div className="w-[30%] mx-auto flex justify-end">
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="mt-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                    >
                        {t("report")}
                    </button>

                    {showReportModal && (
                        <ReportModal
                            reportedUserId={poll.author.id}
                            reportedContentId={poll.id}
                            reportedContentType="POLL"
                            onClose={() => setShowReportModal(false)}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default PollDetailPage;

import { useState, useEffect } from "react";
import { getAllPolls } from "../../../api/pollService";
import { PollSummary } from "../../../api/pollService";
import { useNavigate } from "react-router-dom";
import PollCountdownTimer from "./PollCountdownTimer";
import { useTranslation } from "react-i18next";

function PollsPage() {
    const [polls, setPolls] = useState<PollSummary[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation("Community/PollPage");

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
        return <p>{t("loading")}</p>
    }

    if (error) {
        return <p className="text-red-500">{error}</p>
    }

    if (!polls) {
        return null;
    }

return (
    <div className="w-[40%] mx-auto px-2 max-sm:w-full max-sm:p-6">
        <div className="mt-5 max-sm:mt-0">
            <button
                type="button"
                onClick={() => navigate("/community")}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded transition-colors duration-150 cursor-pointer mb-5 w-full sm:w-auto max-sm:h-12 max-sm:text-base max-sm:px-8"
            >
                {t("back")}
            </button>
        </div>

        <div>
            <div className="flex mb-7 justify-end h-10 max-sm:h-15">
                <button
                    onClick={() => navigate("/polls/create")}
                    className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 max-sm:px-8 max-sm:h-12 max-sm:text-base"
                >
                    {t("createPoll")}
                </button>
            </div>

            <h1 className="text-3xl font-bold mb-5">{t("pollList")}</h1>

            <ul className="grid grid-cols-2 gap-4 max-sm:grid-cols-1 max-sm:gap-2">
                {polls.map(poll => {
                    const isExpired = !!poll.closesAt && new Date(poll.closesAt) < new Date();
                    return (
                        <li
                            key={poll.id}
                            className="p-4 rounded-2xl bg-white hover:shadow cursor-pointer hover:bg-gray-100 max-sm:p-3"
                            onClick={() => navigate(`/polls/${poll.id}`)}
                        >
                            <strong className="text-lg">{poll.question}</strong>

                            <div className="flex justify-between mt-2">
                                <p className="text-sm">{poll.votes.length} {t("votes")}</p>
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

                            <p className="text-sm text-gray-600 mt-1">
                                {t("createdBy")}{" "}
                                <span
                                    onClick={() => navigate(`/profile/${poll.author.id}`)}
                                    className="text-blue-600 hover:underline cursor-pointer"
                                >
                                    {poll.author.firstname} {poll.author.lastname}
                                </span>
                            </p>
                        </li>
                    );
                })}
            </ul>

            <div className="flex justify-center items-center mt-6 gap-4 max-sm:mt-10">
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer max-sm:text-base max-sm:px-5 max-sm:py-3"
                >
                    {t("previous")}
                </button>

                <span className="max-sm:text-sm">
                    {t("page")} {page} / {lastPage}
                </span>

                <button
                    type="button"
                    disabled={page >= lastPage}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer max-sm:text-base max-sm:px-5 max-sm:py-3"
                >
                    {t("next")}
                </button>
            </div>
        </div>
    </div>
)

}

export default PollsPage;

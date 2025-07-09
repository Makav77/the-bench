import { useState, useEffect } from 'react';
import { getChallenges, ChallengeSummary } from '../../../api/challengeService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

function ChallengesPage() {
    const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const navigate = useNavigate();
    const { t } = useTranslation("Community/ChallengesPage")

    useEffect(() => {
        async function load() {
            try {
                const { data, lastPage } = await getChallenges(page, 10);
                setChallenges(data);
                setLastPage(lastPage);
            } catch {
                toast.error(t("toastLoadChallengeError"));
            }
        }
        load();
    }, [page, t]);

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

            <div className="flex justify-end mb-4 h-10 max-sm:h-15">
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 max-sm:px-8 rounded w-fit cursor-pointer"
                    onClick={() => navigate("/challenges/create")}
                >
                    {t("createChallenge")}
                </button>
            </div>

            <h1 className="text-3xl font-bold mb-5 ">{t("challenges")}</h1>

            <ul className="grid grid-cols-2 gap-4 max-sm:grid-cols-1 max-sm:gap-2">
                {challenges.map(challenge => (
                    <li
                        key={challenge.id}
                        className="p-4 rounded-2xl hover:shadow cursor-pointer bg-white hover:bg-gray-100"
                        onClick={() => navigate(`/challenges/${challenge.id}`)}
                    >
                        <h2 className="font-semibold text-lg mb-1">{challenge.title}</h2>
                        <p className="text-sm text-gray-600 mb-1">
                            {t("startFrom")} {new Date(challenge.startDate).toLocaleDateString()} {t("to")} {new Date(challenge.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm mb-1">
                            {t("author")}{" "}
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/profile/${challenge.author.id}`);
                                }}
                                className="text-blue-600 hover:underline cursor-pointer"
                            >
                                {challenge.author.firstname} {challenge.author.lastname}
                            </span>
                        </p>
                        <p className="text-sm">
                            {t("registered")} {challenge.registrations.length} {t("completions")} {challenge.completions.filter((c) => c.validated).length}
                        </p>
                    </li>
                ))}
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
    );
}

export default ChallengesPage;

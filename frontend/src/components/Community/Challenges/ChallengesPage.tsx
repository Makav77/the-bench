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
            } catch (error) {
                toast.error("Unable to load challenges : " + error);
            }
        }
        load();
    }, [page]);

    return (
        <div className="w-[40%] mx-auto">
            <div className="mt-5">
                <button
                    type="button"
                    onClick={() => navigate("/community")}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded transition-colors duration-150 cursor-pointer mb-5"
                >
                    {t("back")}
                </button>
            </div>

            <div className="flex mb-7 justify-end">
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
                    onClick={() => navigate("/challenges/create")}
                >
                    {t("createChallenge")}
                </button>
            </div>

            <h1 className="text-3xl font-bold mb-5">{t("challenges")}</h1>

            <ul className="grid grid-cols-2 gap-4">
                {challenges.map(challenge => (
                    <li
                        key={challenge.id}
                        className="p-4 rounded-2xl hover:shadow cursor-pointer bg-white hover:bg-gray-100"
                        onClick={() => navigate(`/challenges/${challenge.id}`)}
                    >
                        <h2 className="font-semibold">{challenge.title}</h2>
                        <p className="text-sm text-gray-600">
                            {t("startFrom")} {new Date(challenge.startDate).toLocaleDateString()} {t("to")} {new Date(challenge.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm">
                            {t("author")} {" "}
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
                        <p>{t("registered")} {challenge.registrations.length} {t("completions")} {challenge.completions.filter((c) => c.validated).length}</p>
                    </li>
                ))}
            </ul>

            <div className="flex justify-center items-center mt-6 gap-4">
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                >
                    {t("previous")}
                </button>

                <span>
                    {t("page")} {page} / {lastPage}
                </span>

                <button
                    type="button"
                    disabled={page >= lastPage}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                >
                    {t("next")}
                </button>
            </div>
        </div> 
    );
}

export default ChallengesPage;

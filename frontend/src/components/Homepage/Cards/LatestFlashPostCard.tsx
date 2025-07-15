import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFlashPosts, FlashPostSummary } from "../../../api/flashPostService";
import CountdownTimer from "../../FlashPosts/CountdownTimer";
import { useTranslation } from "react-i18next";

function LatestFlashPostCard() {
    const [flashPost, setFlashPost] = useState<FlashPostSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation("Homepage/LatestFlashPostCard");

    useEffect(() => {
        async function load() {
            try {
                const { data } = await getFlashPosts(1, 1);
                if (data.length > 0) {
                    setFlashPost(data[0]);
                } else {
                    setError(t("noPostAvailable"));
                }
            } catch {
                setError(t("loadPostError"));
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    if (isLoading) {
        return <p className="p-6">
            {t("loading")}
        </p>;
    }

    if (error) {
        return <p className="p-6 text-red-500">
            {error}
        </p>
    }

    if (!flashPost) {
        return <p className="p-6">
            {t("noPostAvailable")}
        </p>
    }

    return (
        <div
            onClick={() => navigate(`/flashposts/${flashPost.id}`)}
            className="flex justify-between items-center w-3/4 mx-auto bg-white rounded-2xl shadow hover:bg-gray-100 cursor-pointer transition h-25 px-5 mb-10"
        >
            <div className="pr-4">
                <h4 className="text-lg font-bold">
                    {flashPost.title}
                </h4>

                <p className="text-sm text-gray-500">
                    {t("lastUpdate")} {new Date(flashPost.updatedAt).toLocaleDateString()}
                </p>
            </div>

            <div>
                <p>{t("author")}{" "}
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${flashPost.author.id}`);
                        }}
                        className="text-blue-600 hover:underline cursor-pointer"
                    >
                        {flashPost.author.firstname} {flashPost.author.lastname}
                    </span>
                </p>
                <div className="text-center">
                    <CountdownTimer createdAt={flashPost.updatedAt} />
                </div>
            </div>
        </div>
    );
}

export default LatestFlashPostCard;

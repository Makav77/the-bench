import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RecommendationDTO, getFriendRecommendations } from "../../../api/userService";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";

function SuggestedFriendsCard() {
    const { user } = useAuth();
    const [recommendations, setRecommendations] = useState<RecommendationDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation("Homepage/SuggestedFriendsCard");

    useEffect(() => {
        if (!user) return;
        getFriendRecommendations(user.id)
            .then(setRecommendations)
            .catch(() => setError(t("loadError")))
            .finally(() => setLoading(false));
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-4">
                <p>{t("loading")}</p>
            </div>
        );
    }

    if (error || recommendations.length === 0) {
        return (
            <div className="flex justify-center items-center p-4">
                <p className="text-gray-500 italic">
                    {error || t("noSuggestions")}
                </p>
            </div>
        );
    }

    const topTwo = recommendations.slice(0, 2);

    return (
        <div className="flex flex-col justify-center items-center w-3/4 mx-auto bg-white rounded shadow mb-10 p-4">
            <div className="grid grid-cols-2 gap-4 w-full">
                {topTwo.map((rec) => (
                    <div
                        key={rec.userId}
                        onClick={() => navigate(`/profile/${rec.userId}`)}
                        className="bg-white shadow rounded p-4 flex flex-col items-center cursor-pointer hover:bg-gray-50"
                    >
                        <img
                            src={
                                rec.profilePictureUrl &&
                                rec.profilePictureUrl !== "/uploads/profile/default.png"
                                    ? rec.profilePictureUrl
                                    : "https://the-bench-media.sfo3.cdn.digitaloceanspaces.com/assets/default_pp.jpg"
                            }
                            alt={`${rec.firstname} ${rec.lastname}`}
                            className="w-16 h-16 rounded-full object-cover border mb-2"
                        />
                        <span className="font-medium text-center">
                            {rec.firstname} {rec.lastname}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SuggestedFriendsCard;
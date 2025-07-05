// frontend/src/components/Shop/ShopPage.tsx

import { useEffect, useState } from "react";
import { getAllBadgesWithUserInfo, buyBadge, BadgeDTO } from "../../../api/shopService";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

function ShopPage() {
    const { user, refreshUser } = useAuth();
    const [badges, setBadges] = useState<BadgeDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState<string | null>(null);
    const { t } = useTranslation("Community/ShopPage");

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const data = await getAllBadgesWithUserInfo();
                setBadges(data);
            } catch {
                toast.error(t("toastLoadBadgeError"));
            }
            setLoading(false);
        })();
    }, []);

    const handleBuy = async (badge: BadgeDTO) => {
        if (!user || badge.owned) {
            return;
        }

        if (user.points < badge.cost) {
            toast.error(t("toastNotEnoughPoints")) 
            return;
        }

        setBuying(badge.id);

        try {
            await buyBadge(badge.id);
            toast.success(t("toastBadgePurchased"))
            setBadges(badges =>
                badges.map(b =>
                    b.id === badge.id ? { ...b, owned: true } : b
                )
            );
            refreshUser?.();
        } catch {
            toast.error(t("toastBadgePurchaseError"))
        }
        setBuying(null);
    };

    return (
        <div className="max-w-3xl mx-auto mt-8">
            <h1 className="text-2xl font-bold mb-6 text-center">{t("badgeShop")}</h1>
            <div className="flex justify-between items-center mb-4">
                <span>{t("points")} <b>{user?.points}</b></span>
            </div>
            {loading ? (
                <div>{t("loading")}</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {badges.map(badge => (
                        <div
                            key={badge.id}
                            className={`flex flex-col items-center border rounded-xl p-4 shadow ${
                                badge.owned ? "opacity-40 grayscale" : ""
                            }`}
                        >
                            <img
                                src={badge.imageUrl}
                                alt="badge"
                                className="w-24 h-24 mb-2"
                            />
                            <span className="mb-2">{t("cost")} <b>{badge.cost} {t("points2")}</b></span>
                            <button
                                disabled={badge.owned || buying === badge.id || !badge.available}
                                onClick={() => handleBuy(badge)}
                                className={`px-4 py-1 rounded ${
                                    badge.owned
                                        ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                                        : badge.available
                                            ? "bg-blue-600 text-white hover:bg-blue-700"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                            >
                                {badge.owned
                                    ? t("alreadyPurchased")
                                    : badge.available
                                        ? buying === badge.id
                                            ? t("purchase")
                                            : t("buy")
                                        : t("unavailable") }
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ShopPage;

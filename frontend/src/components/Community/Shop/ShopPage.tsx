import { useEffect, useState } from "react";
import { getAllBadgesWithUserInfo, buyBadge, BadgeDTO, deleteBadge } from "../../../api/shopService";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { AddBadgeModal } from "./CreateBadgeModal";

function ShopPage() {
    const { user, refreshUser } = useAuth();
    const [badges, setBadges] = useState<BadgeDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState<string | null>(null);
    const [showAddBadgeModal, setShowAddBadgeModal] = useState(false);
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
        <div className="max-w-3xl mx-auto mt-8 max-sm:w-3/4 max-sm:px-2">
            <h1 className="text-3xl font-bold mb-6 text-center">{t("badgeShop")}</h1>

            {user?.role === "admin" && (
                <div className="flex justify-end">
                    <button
                        className="bg-green-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 max-sm:px-8 rounded w-fit cursor-pointer"
                        onClick={() => setShowAddBadgeModal(true)}
                    >
                        {t("addBadge")}
                    </button>
                </div>
            )}

            <div className="flex justify-between items-center mb-4 max-sm:flex-col max-sm:items-start max-sm:gap-2">
                <span className="max-sm:text-lg">{t("points")} <b>{user?.points}</b></span>
            </div>

            {loading ? (
                <div className="max-sm:text-lg">{t("loading")}</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-sm:grid-cols-1 max-sm:gap-3">
                    {badges.map(badge => (
                        <div
                            key={badge.id}
                            className={`flex flex-col items-center border rounded-xl p-4 shadow ${
                                badge.owned ? "opacity-40 grayscale" : ""
                            } max-sm:p-3`}
                        >
                            <img
                                src={badge.imageUrl}
                                alt="badge"
                                className="w-16 h-16 mb-2 max-sm:w-20 max-sm:h-20"
                            />

                            <span className="mb-2 max-sm:text-lg">{t("cost")} <b>{badge.cost} {t("points2")}</b></span>

                            <div className="flex flex-row w-full justify-center gap-2 max-sm:flex-col max-sm:gap-2 max-sm:items-center">
                                <button
                                    disabled={badge.owned || buying === badge.id || !badge.available}
                                    onClick={() => handleBuy(badge)}
                                    className={`px-4 py-1 rounded ${
                                        badge.owned
                                            ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                                            : badge.available
                                                ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    } max-sm:w-3/4 max-sm:h-12`}
                                >
                                    {badge.available
                                        ? buying === badge.id
                                            ? t("purchase")
                                            : t("buy")
                                        : t("unavailable") }
                                </button>

                                {user?.role === "admin" && (
                                    <button
                                        className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer max-sm:w-3/4 max-sm:h-12"
                                        onClick={async () => {
                                            if (!window.confirm(t("deleteBadgeAlert"))) {
                                                return;
                                            }

                                            try {
                                                await deleteBadge(badge.id);
                                                setBadges(badges => badges.filter(b => b.id !== badge.id));
                                                toast.success(t("toastBadgeDeleted"));
                                            } catch {
                                                toast.error(t("toastBadgeDeletedError"));
                                            }
                                        }}
                                    >
                                        {t("delete")}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showAddBadgeModal && (
                <AddBadgeModal
                    onClose={() => setShowAddBadgeModal(false)}
                    onBadgeCreated={async () => {
                        setShowAddBadgeModal(false);
                        setLoading(true);
                        try {
                            const data = await getAllBadgesWithUserInfo();
                            setBadges(data);
                        } catch {
                            toast.error(t("toastLoadBadgeError"));
                        }
                        setLoading(false);
                    }}
                />
            )}
        </div>
    );
}

export default ShopPage;

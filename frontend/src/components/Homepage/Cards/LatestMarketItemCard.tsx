import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getItems, MarketItemSummary } from "../../../api/marketService";
import { useTranslation } from "react-i18next";

function LatestMarketItemCard() {
    const [item, setItem] = useState<MarketItemSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation("Homepage/LatestMarketItemCard")

    useEffect(() => {
        async function load() {
            try {
                const { data } = await getItems(1, 1);
                if (data.length > 0) {
                    setItem(data[0]);
                } else {
                    setError(t("noItemAvailable"));
                }
            } catch {
                setError(t("loadItemError"));
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    if (isLoading) {
        return <p className="p-6">{t("loading")}</p>;
    }

    if (error) {
        return <p className="p-6 text-red-500">{error}</p>
    }

    if (!item) {
        return <p className="p-6">{t("noItemAvailable")}</p>
    }

    const picture = item.images?.[0];

    return (
        <div
            onClick={() => navigate(`/market/${item.id}`)}
            className="mb-10 flex justify-between items-center w-3/4 mx-auto bg-white rounded-2xl shadow hover:bg-gray-100 cursor-pointer transition h-25 px-5"
        >
            <div className=" pr-4">
                <h4 className="text-lg font-bold">{item.title}</h4>
                {item.price != null && (
                    <p className="text-gray-600">
                        {t("price")} {item.price} €
                    </p>
                )}
                <p className="text-sm text-gray-500">
                    {t("lastUpdate")} {new Date(item.updatedAt).toLocaleDateString()}
                </p>
            </div>

            {picture && (
                <img
                    src={picture}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded"
                />
            )}
        </div>
    );
}

export default LatestMarketItemCard;

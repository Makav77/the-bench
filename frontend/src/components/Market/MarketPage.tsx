import { useState, useEffect } from "react";
import { getItems, MarketItemSummary } from "../../api/marketService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

function MarketPage() {
    const [items, setItems] = useState<MarketItemSummary[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation("Market/MarketPage");

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            setError(null);
            try {
                const { data, lastPage } = await getItems(page, 10);
                setItems(data);
                setLastPage(lastPage);
            } catch {
                toast.error(t("toastLoadMarketError"));
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [page, t]);

    return (
        <div className="p-6 w-[30%] mx-auto max-sm:w-full">
            <div className="flex justify-end mb-4 h-10 max-sm:h-15">
                <button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 max-sm:px-8 rounded w-fit cursor-pointer"
                    onClick={() => navigate("/market/create")}
                >
                    {t("sellItem")}
                </button>
            </div>

            <h1 className="text-3xl font-bold mb-4">
                {t("market")}
            </h1>

            {error && <p className="text-red-500 max-sm:text-lg">{error}</p>}

            {isLoading ? (
                <p className="max-sm:text-lg">
                    {t("loading")}
                </p>
            ) : items.length === 0 ? (
                <p className="max-sm:text-lg">
                    {t("noItem")}
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-4 max-sm:gap-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="p-4 bg-white rounded-2xl cursor-pointer hover:shadow flex justify-between items-center hover:bg-gray-100
                            max-sm:flex-col max-sm:items-stretch max-sm:gap-4 max-sm:p-4 max-sm:text-lg"
                            onClick={() => navigate(`/market/${item.id}`)}
                        >
                            <div className="flex flex-col flex-1 max-sm:mb-2 max-sm:text-lg">
                                <h2 className="text-lg font-semibold max-sm:text-2xl max-sm:mb-2">
                                    {item.title}
                                </h2>

                                <div className="text-gray-600 text-sm max-sm:text-lg max-sm:mb-2">
                                    {item.price != null && !isNaN(Number(item.price)) && (
                                        <span className="font-semibold">
                                            {t("price")} {Number(item.price).toFixed(2)} €
                                        </span>
                                    )}
                                    <br />
                                    <span className="max-sm:text-base">{t("lastUpdate")} {new Date(item.updatedAt).toLocaleDateString()}</span>
                                </div>

                                <div className="text-gray-600 max-sm:text-base max-sm:mt-1">
                                    {t("sellBy")}{" "}
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/profile/${item.author.id}`);
                                        }}
                                        className="text-blue-600 hover:underline cursor-pointer"
                                    >
                                        {item.author.firstname} {item.author.lastname}
                                    </span>
                                </div>
                            </div>
                            
                            {item.images?.[0] && (
                                <img
                                    src={item.images[0]}
                                    alt={item.title}
                                    className="w-24 h-24 object-cover rounded-2xl max-sm:w-full max-sm:h-44 max-sm:rounded-lg max-sm:mt-2 max-sm:mb-2"
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-center items-center mt-6 gap-4 max-sm:mt-6">
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 cursor-pointer max-sm:w-1/3 max-sm:text-lg"
                >
                    {t("previous")}
                </button>

                <span className="max-sm:text-xl">
                    {t("Page")} {page} / {lastPage}
                </span>

                <button
                    type="button"
                    disabled={page >= lastPage}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 cursor-pointer max-sm:w-1/3 max-sm:text-lg"
                >
                    {t("next")}
                </button>
            </div>
        </div>
    );
}

export default MarketPage;

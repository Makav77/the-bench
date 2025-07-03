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
            } catch (error) {
                setError("Unable to load items : " + error);
                toast.error("Unable to load market");
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [page]);

    return (
        <div className="p-6 w-[30%] mx-auto">
            <div className="flex justify-end mb-4 h-10">
                <button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-fit cursor-pointer"
                    onClick={() => navigate("/market/create")}
                >
                    {t("sellItem")}
                </button>
            </div>

            <h1 className="text-2xl font-bold mb-4">{t("market")}</h1>

            {error && <p className="text-red-500">{error}</p>}

            {isLoading ? (
                <p>{t("loading")}</p>
            ) : items.length === 0 ? (
                <p>{t("noItem")}</p>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="p-4 bg-white rounded-2xl cursor-pointer hover:shadow flex justify-between items-center hover:bg-gray-100"
                            onClick={() => navigate(`/market/${item.id}`)}
                        >
                            <div className="flex flex-col">
                                <h2 className="text-lg font-semibold">{item.title}</h2>

                                <p className="text-gray-600 text-sm">
                                    {item.price != null && !isNaN(Number(item.price)) && (
                                        <p className="font-semibold">
                                            {t("price")} {Number(item.price).toFixed(2)} €
                                        </p>
                                    )}
                                    {t("lastUpdate")} {new Date(item.updatedAt).toLocaleDateString()}
                                </p>

                                <p className="text-gray-600">
                                    {t("sellBy")} {" "}
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/profile/${item.author.id}`);
                                        }}
                                        className="text-blue-600 hover:underline cursor-pointer"
                                    >
                                        {item.author.firstname} {item.author.lastname}
                                    </span>
                                </p>
                            </div>
                            
                            {item.images?.[0] && (
                                <img
                                    src={item.images[0]}
                                    alt={item.title}
                                    className="w-24 h-24 object-cover rounded-2xl"
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}

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
                    {t("Page")} {page} / {lastPage}
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

export default MarketPage;

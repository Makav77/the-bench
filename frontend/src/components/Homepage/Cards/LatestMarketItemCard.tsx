import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getItems, MarketItemSummary } from "../../../api/marketService";

function LatestMarketItemCard() {
    const [item, setItem] = useState<MarketItemSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function load() {
            try {
                const { data } = await getItems(1, 1);
                if (data.length > 0) {
                    setItem(data[0]);
                } else {
                    setError("No items available.");
                }
            } catch (error) {
                setError("Unable to load latest item: " + error);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    if (isLoading) {
        return <p className="p-6">Loading...</p>;
    }

    if (error) {
        return <p className="p-6 text-red-500">{error}</p>
    }

    if (!item) {
        return <p className="p-6">No item available</p>
    }

    return (
        <div
            onClick={() => navigate(`/market/${item.id}`)}
            className="w-2/3 mx-auto bg-white rounded-lg shadow hover:cursor-pointer hover:shadow-md transition h-25 p-2"
        >
            <h4 className="text-lg">{item.title}</h4>
            {item.price != null && (
                <p className="text-gray-600">
                    Price : {item.price} €
                </p>
            )}
            <p className="text-sm text-gray-500">
                Last update {new Date(item.updatedAt).toLocaleDateString()}
            </p>
        </div>
    );
}

export default LatestMarketItemCard;

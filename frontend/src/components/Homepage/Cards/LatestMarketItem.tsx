import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getItems, MarketItemSummary } from "../../../api/marketService";

function LatestMarketItem() {
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

    if (!item) {
        return <p className="p-6">No item available</p>
    }

    return (
        <div
            onClick={() => navigate(`/market/${item.id}`)}
            className="p-4 bg-white rounded-lg shadow hover:cursor-pointer hover:shadow-md transition"
        >
            <h3 className="font-semibold mb-1">Last item on sell</h3>
            <h4 className="text-lg">{item.title}</h4>
            {item.price != null && (
                <p className="text-gray-600">
                    Price : {item.price.toFixed(2)} €
                </p>
            )}
            <p className="text-sm text-gray-500">
                Last update {new Date(item.updatedAt).toLocaleDateString()}
            </p>
        </div>
    );
}

export default LatestMarketItem;

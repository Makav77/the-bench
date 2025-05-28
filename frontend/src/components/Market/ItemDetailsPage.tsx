import { useState, useEffect } from "react";
import { getItem, deleteItem, MarketItemDetails } from "../../api/marketService";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

function ItemDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [item, setItem] = useState<MarketItemDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            setError(null);

            try {
                if (id) {
                    const item = await getItem(id);
                    setItem(item);
                }
            } catch(error) {
                console.error(error);
                toast.error("Unable to load item.");
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [id]);

    if (isLoading) {
        return <p className="p-6">Loading...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>
    }

    if (!item) {
        return null;
    }

    const isOwner = user && item && user.id === item.author.id;
    const isAdminorModerator = user && (user.role === "admin" || user.role === "moderator");

    const handleDelete = async () => {
        const confirmed = window.confirm("You are about to delete an item. Would you like to confirm");
        if (!confirmed) {
            return;
        }

        try {
            await deleteItem(id!);
            toast.success("Item successfully deleted!");
            navigate("/marketplace");
        } catch (error) {
            toast.error("Unable to delete item : " + error);
        }
    };

    return (
        <div className="px-10 py-8 space-y-4 border mt-10 w-[40%] mx-auto">
            <div className="">
                <button
                    onClick={() => navigate("/marketplace")}
                    className="text-blue-600 underline cursor-pointer border rounded px-2 py-1 bg-white mb-8"
                >
                    ← Back to market
                </button>

                <h1 className="text-5xl font-bold mb-4">{item.title}</h1>
                <p className="text-gray-600 text-sm mb-4">
                    Published on {new Date(item.createdAt).toLocaleString()}<br />
                    Last update on {new Date(item.updatedAt).toLocaleString()}
                </p>

                {typeof item.price === "number" && (
                    <p className="text-xl font-semibold">
                        Prix : {item.price.toFixed(2)} €
                    </p>
                )}

                <p className="whitespace-pre-wrap">{item.description}</p>

                {item.images && item.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 my-4">
                        {item.images.map((url, index) => (
                            <img
                                key={index}
                                src={url}
                                alt={`Item image ${index + 1}`}
                                className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80"
                                onClick={() => window.open(url, "_blank")}
                            />
                        ))}
                    </div>
                )}

                <p className="text-gray-700 mt-5">
                    Sell by{" "}
                    <strong>
                        {item.author.firstname} {item.author.lastname}
                    </strong>
                </p>

                <div className="mt-3">
                    {item.contactEmail && (
                        <p>
                            Contact by mail : {item.contactEmail}
                        </p>
                    )}

                    {item.contactPhone && (
                        <p>
                            Contact by phone : {item.contactPhone}
                        </p>
                    )}
                </div>

                {(isOwner || isAdminorModerator) && (
                    <div className="mt-4 flex gap-2 justify-center">
                        <button
                            type="button"
                            onClick={() => navigate(`/market/${id}/edit`)}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
                        >
                            Edit post
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
                        >
                            Delete post
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ItemDetailsPage;

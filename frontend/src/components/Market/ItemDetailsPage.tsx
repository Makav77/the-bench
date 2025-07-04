import { useState, useEffect } from "react";
import { getItem, deleteItem, MarketItemDetails } from "../../api/marketService";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

function ItemDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [item, setItem] = useState<MarketItemDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation("Market/ItemDetailPage");

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
                toast.error(t("toastLoadItemError"));
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [id]);

    if (isLoading) {
        return <p className="p-6">{t("loading")}</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>
    }

    if (!item) {
        return null;
    }

    const isAuthor = user && item && user.id === item.author.id;
    const isAdminorModerator = user && (user.role === "admin" || user.role === "moderator");

    const handleDelete = async () => {
        const confirmed = window.confirm(t("confirmAlert"));
        if (!confirmed) {
            return;
        }

        try {
            await deleteItem(id!);
            toast.success(t("toastItemDeleted"));
            navigate("/marketplace");
        } catch {
            toast.error(t("toastItemDeletedError"));
        }
    };

    return (
        <div className="px-10 py-8 space-y-4 mt-10 w-[30%] mx-auto bg-white rounded-3xl">
            <div className="">
                <button
                    type="button"
                    onClick={() => navigate("/marketplace")}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded transition-colors duration-150 cursor-pointer mb-5"
                >
                    {t("back")}
                </button>

                <h1 className="text-5xl font-bold mb-4">{item.title}</h1>
                <p className="text-gray-600 text-sm mb-4">
                    {t("publishedOn")} {new Date(item.createdAt).toLocaleString()}<br />
                    {t("lastUpdate")} {new Date(item.updatedAt).toLocaleString()}
                </p>

                {item.price != null && !isNaN(Number(item.price)) && (
                    <p className="text-xl font-semibold">
                        {t("price")} {Number(item.price).toFixed(2)} €
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
                                onClick={() => {
                                    setSelectedImage(url);
                                    setShowImageModal(true);
                                }}
                            />
                        ))}
                    </div>
                )}

                <p className="text-gray-700 mt-5">
                    {t("sellBy")}{" "}
                    <span
                        onClick={() => navigate(`/profile/${item.author.id}`)}
                        className="text-blue-600 hover:underline cursor-pointer"
                    >
                        {item.author.firstname} {item.author.lastname}
                    </span>
                </p>

                <div className="mt-3">
                    {item.contactEmail && (
                        <p>
                            {t("contactMail")} {item.contactEmail}
                        </p>
                    )}

                    {item.contactPhone && (
                        <p>
                            {t("contactPhone")} {item.contactPhone}
                        </p>
                    )}
                </div>

                {(isAuthor || isAdminorModerator) && (
                    <div className="mt-4 flex gap-2 justify-center">
                        <button
                            type="button"
                            onClick={() => navigate(`/market/${id}/edit`)}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
                        >
                            {t("editPost")}
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
                        >
                            {t("deletePost")}
                        </button>
                    </div>
                )}
            </div>

            {showImageModal && selectedImage && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-20 z-50">
                    <div className="bg-white rounded p-6 max-w-3xl w-[80%] max-h-[80vh] overflow-auto relative">
                        <button
                            onClick={() => setShowImageModal(false)}
                            className="absolute top-2 right-5 text-gray-600 hover:text-black text-2xl cursor-pointer"
                        >
                            ✕
                        </button>

                        <img
                            src={selectedImage}
                            alt="Selected item"
                            className="w-full h-auto rounded-lg object-contain mt-8"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default ItemDetailsPage;

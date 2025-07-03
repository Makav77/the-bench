import { useState, useEffect } from "react";
import { getEvents, EventSummary, subscribeEvent } from "../../api/eventService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import usePermission from "../Utils/usePermission";
import { useTranslation } from "react-i18next";

function EventsPage() {
    const { restricted, expiresAt, loading: permLoading } = usePermission("register_event");
    const [events, setEvents] = useState<EventSummary[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation("Events/EventsPage");
    const { user } = useAuth();

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            setError(null);

            try {
                const { data, lastPage } = await getEvents(page, 5);
                setEvents(data);
                setLastPage(lastPage);
            } catch(error) {
                setError("Unable to load events : " + error);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [page]);

    const handleSubscribe = async (eventId: string) => {
        try {
            const updated = await subscribeEvent(eventId);
            setEvents((ev) =>
                ev.map((e) => (e.id === eventId ? { ...e, participantsList: updated.participantsList } : e))
            );
            toast.success("Succesful registration");
        } catch (error) {
            console.error(error);
            toast.error("Error during registration");
        }
    }

    return (
        <div className="p-6 w-[30%] mx-auto">
            <div className="flex justify-end mb-4 h-10">
                <button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-fit cursor-pointer"
                    onClick={() => navigate("/events/create")}
                >
                    {t("createEvent")}
                </button>
            </div>

            <h1 className="text-2xl font-bold mb-4">{t("upcomingEvent")}</h1>

            {permLoading ? (
                <p>{t("checkingPermissions")}</p>
            ) : restricted ? (
                <p className="text-red-600">
                    {t("restrictionMessage")} {" "}
                    {new Date(expiresAt!).toLocaleDateString()}.
                </p>
            ) : (
                <div>
                    {isLoading && <p>{t("loading")}</p>}
                    {error && <p className="text-red-500">{error}</p>}

                    <div className="grid grid-cols-1 gap-4">
                        {events.map((event) => {
                            const isSubscribed = event.participantsList.some((u) => u.id === user?.id);
                            const isAuthor = user && user.id === event.author.id;
                            const isFull =
                                typeof event.maxNumberOfParticipants === "number"
                                && event.maxNumberOfParticipants > 0
                                && event.participantsList.length >= event.maxNumberOfParticipants
                                && !isSubscribed;

                            return (
                                <div
                                    key={event.id}
                                    className="p-4 cursor-pointer hover:shadow flex justify-between items-center bg-white rounded-2xl hover:bg-gray-100"
                                    onClick={() => navigate(`/events/${event.id}`)}
                                >
                                    <div className="flex flex-col">
                                        <h2 className="text-lg font-semibold">{event.name}</h2>
                                        <p>{new Date(event.startDate).toLocaleString()}</p>
                                    </div>

                                    {isAuthor ? (
                                        <span className="text-purple-700 font-semibold">{t("yourEvent")}</span>
                                    ) : isSubscribed ? (
                                        <p className="text-blue-600 font-semibold">{t("alreadyRegistered")}</p>
                                    ) : (
                                        <>
                                            {(typeof event.maxNumberOfParticipants !== "number" || event.maxNumberOfParticipants <= 0) ? (
                                                <span className="text-green-700 font-semibold">{t("openEvent")}</span>
                                            ) : isFull ? (
                                                <span className="text-red-500 font-semibold">{t("eventFull")}</span>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSubscribe(event.id);
                                                    }}
                                                    className="bg-green-600 text-white px-4 h-10 border rounded hover:bg-green-700 cursor-pointer"
                                                >
                                                    {t("register")}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
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
                    {t("page")} {page} / {lastPage}
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
    )
}

export default EventsPage;

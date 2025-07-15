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
            } catch {
                setError(t("toastLoadEventError"));
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [page, t]);

    const handleSubscribe = async (eventId: string) => {
        try {
            const updated = await subscribeEvent(eventId);
            setEvents((ev) =>
                ev.map((e) => (e.id === eventId ? { ...e, participantsList: updated.participantsList } : e))
            );
            toast.success("Succesful registration");
        } catch {
            toast.error("Error during registration");
        }
    }

    return (
        <div className="p-6 w-[30%] mx-auto max-sm:w-full max-sm:p-6">
            <div className="flex justify-end mb-4 h-10 max-sm:h-15">
                <button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 max-sm:px-8 rounded w-fit cursor-pointer"
                    onClick={() => navigate("/events/create")}
                >
                    {t("createEvent")}
                </button>
            </div>

            <h1 className="text-3xl font-bold mb-4">
                {t("upcomingEvent")}
            </h1>

            {permLoading ? (
                <p className="max-sm:text-lg">
                    {t("checkingPermissions")}
                </p>
            ) : restricted ? (
                <p className="text-red-600 max-sm:text-lg">
                    {t("restrictionMessage")} {" "}
                    {new Date(expiresAt!).toLocaleDateString()}.
                </p>
            ) : (
                <div>
                    {isLoading && <p className="max-sm:text-lg">
                        {t("loading")}
                    </p>}

                    {error && <p className="text-red-500 max-sm:text-lg">{error}</p>}

                    <div className="grid grid-cols-1 gap-4 max-sm:gap-2">
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
                                    className="p-4 cursor-pointer hover:shadow flex justify-between items-center bg-white rounded-2xl hover:bg-gray-100 max-sm:p-2 max-sm:pr-4"
                                    onClick={() => navigate(`/events/${event.id}`)}
                                >
                                    <div className="flex flex-col max-sm:gap-1 max-sm:p-3">
                                        <h2 className="text-lg font-semibold max-sm:text-base">
                                            {event.name}
                                        </h2>

                                        <p className="max-sm:text-sm">
                                            {new Date(event.startDate).toLocaleString()}
                                        </p>
                                    </div>

                                    {isAuthor ? (
                                        <span className="text-purple-700 font-semibold max-sm:text-sm">
                                            {t("yourEvent")}
                                        </span>
                                    ) : isSubscribed ? (
                                        <p className="text-blue-600 font-semibold max-sm:text-sm">
                                            {t("alreadyRegistered")}
                                        </p>
                                    ) : (
                                        <>
                                            {(typeof event.maxNumberOfParticipants !== "number" || event.maxNumberOfParticipants <= 0) ? (
                                                <span className="text-green-700 font-semibold max-sm:text-sm">
                                                    {t("openEvent")}
                                                </span>
                                            ) : isFull ? (
                                                <span className="text-red-500 font-semibold max-sm:text-sm">
                                                    {t("eventFull")}
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSubscribe(event.id);
                                                    }}
                                                    className="bg-green-600 text-white px-4 h-10 border rounded hover:bg-green-700 cursor-pointer max-sm:text-base max-sm:h-12"
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

            <div className="flex justify-center items-center mt-6 gap-4 max-sm:mt-10">
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer max-sm:text-base max-sm:px-5 max-sm:py-3"
                >
                    {t("previous")}
                </button>

                <span className="max-sm:text-sm">
                    {t("page")} {page} / {lastPage}
                </span>

                <button
                    type="button"
                    disabled={page >= lastPage}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer max-sm:text-base max-sm:px-5 max-sm:py-3"
                >
                    {t("next")}
                </button>
            </div>
        </div>
    );
}

export default EventsPage;

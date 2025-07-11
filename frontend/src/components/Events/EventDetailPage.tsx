import { useState, useEffect } from "react";
import { getEvent, EventDetails, deleteEvent, subscribeEvent, unsubscribeEvent } from "../../api/eventService";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { removeParticipant } from "../../api/eventService";
import usePermission from "../Utils/usePermission";
import ReportModal from "../Utils/ReportModal";
import { useTranslation } from "react-i18next";

function EventDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation("Events/EventDetailPage");
    const { restricted, expiresAt, loading: permLoading } = usePermission("register_event");
    const [event, setEvent] = useState<EventDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showParticipantModal, setShowParticipantModal] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [showReportModal, setShowReportModal] = useState<boolean>(false);

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            setError(null);

            try {
                if (id) {
                    const event = await getEvent(id);
                    setEvent(event);
                }
            } catch {
                toast.error(t("toastLoadEventError"));
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [id, t]);

    if (isLoading) {
        return <p className="p-6">
            {t("loading")}
        </p>;
    }

    if (error) {
        return <p className="p-6 text-red-500">
            {error}
        </p>
    }

    if (!event) {
        return null;
    }

    const isAuthor = user && event && user.id === event.author.id;
    const isAdminorModerator = user && (user.role === "admin" || user.role === "moderator");
    const isSubscribe = event.participantsList.some((u) => u.id === user?.id);
    const isFull =
        typeof event.maxNumberOfParticipants === "number"
        && event.maxNumberOfParticipants > 0
        && event.participantsList.length >= event.maxNumberOfParticipants
        && !isSubscribe;

    const handleSubscribe = async () => {
        try {
            const updated = await subscribeEvent(id!);
            setEvent(updated);
            toast.success(t("toastSuccessfullRegistration"));
        } catch {
            toast.error(t("toastRegistrationError"));
        }
    };

    const handleUnsubscribe = async () => {
        try {
            const updated = await unsubscribeEvent(id!);
            setEvent(updated);
            toast.success(t("toastSuccessfullUnsubscribe"));
        } catch {
            toast.error(t("toastUnsubscribeError"));
        }
    }

    const handleDelete = async () => {
        const confirmed = window.confirm(t("confirmAlert"));
        if (!confirmed) {
            return;
        }

        try {
            await deleteEvent(id!);
            toast.success(t("toastEventDeleted"))
            navigate("/events");
        } catch {
            toast.error(t("toastEventDeletedError"));
        }
    };

    if (permLoading) {
        return <p>
            {t("checkingPermissions")}
        </p>;
    }

    return (
        <div>
            <div className="p-6 space-y-4 mt-10 w-[20%] mx-auto bg-white rounded-2xl max-sm:w-[98%] max-sm:space-y-6 max-sm:mt-3">
                <div className="flex justify-between gap-4 max-sm:flex-col max-sm:gap-2">
                    <button
                        type="button"
                        onClick={() => navigate("/events")}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded transition-colors duration-150 cursor-pointer h-10 max-sm:h-12"
                    >
                        {t("back")}
                    </button>

                    <div className="flex flex-col gap-2 max-sm:gap-2 max-sm:w-full">
                        {!isAuthor && (
                            event.maxNumberOfParticipants == null ? (
                                <p className="text-green-600 text-l font-semibold max-sm:text-base">
                                    {t("openEvent")}
                                </p>
                            ) : (
                                isSubscribe ? (
                                    <button
                                        onClick={handleUnsubscribe}
                                        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 cursor-pointer border max-sm:text-base max-sm:py-2 max-sm:w-3/4 max-sm:mx-auto max-sm:h-12"
                                    >
                                        {t("unsubscribe")}
                                    </button>
                                ) : isFull ? (
                                    <p className="text-gray-500 text-l font-semibold max-sm:text-base">
                                        {t("eventFull")}
                                    </p>
                                ) : restricted ? (
                                    <p className="text-red-600 text-l font-semibold max-sm:text-base">
                                        {t("restrictionMessage")} {" "}
                                        {new Date(expiresAt!).toLocaleDateString()}.
                                    </p>
                                ) : (
                                    <button
                                        onClick={handleSubscribe}
                                        className="bg-green-600 text-white px-4 py-2 border rounded hover:bg-green-700 cursor-pointer  max-sm:text-base max-sm:py-2 max-sm:w-3/4 max-sm:mx-auto max-sm:h-12"
                                    >
                                        {t("subscribe")}
                                    </button>
                                )
                            )
                        )}

                        {event.maxNumberOfParticipants != null && (isAuthor || isAdminorModerator) && (
                            <button
                                onClick={() => setShowParticipantModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 border rounded cursor-pointer max-sm:text-base max-sm:py-2 max-sm:w-3/4 max-sm:mx-auto max-sm:h-12"
                            >
                                {t("participantList")}
                            </button>
                        )}
                    </div>
                </div>

                <h1 className="text-3xl font-bold max-sm:text-2xl">
                    {event.name}
                </h1>

                <p className="-mt-4 max-sm:-mt-2">
                    <strong>{t("author")}</strong>{" "}
                    <span
                        onClick={() => navigate(`/profile/${event.author.id}`)}
                        className="text-blue-600 hover:underline cursor-pointer"
                    >
                        {event.author.firstname} {event.author.lastname}
                    </span>
                </p>

                <strong>{t("description")}</strong>
                <p className="whitespace-pre-wrap max-sm:text-base">
                    {event.description}
                </p>

                <strong>{t("place")}</strong>
                <p className="whitespace-pre-wrap max-sm:text-base">
                    {event.place}
                </p>

                <p>
                    <strong>{t("start")}</strong>{" "}
                    {new Date(event.startDate).toLocaleString()}
                </p>

                <p className="-mt-4 max-sm:-mt-2">
                    <strong className="mr-2">
                        {t("end")}
                    </strong>
                    {" "}
                    {new Date(event.endDate).toLocaleString()}
                </p>

                {typeof event.maxNumberOfParticipants === "number" && event.maxNumberOfParticipants > 0 && (
                    <>
                        <strong>{t("maxPlaces")}</strong> {event.maxNumberOfParticipants} <br />
                        <strong>{t("remainingPlaces")}</strong> {event.maxNumberOfParticipants - event.participantsList.length}
                    </>
                )}

                {(isAuthor || isAdminorModerator) && (
                    <div className="mt-4 flex gap-2 justify-center max-sm:flex-col max-sm:gap-2">
                        <button
                            onClick={() => navigate(`/events/${id}/edit`)}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50 cursor-pointer max-sm:text-base max-sm:py-2 max-sm:w-3/4 max-sm:mx-auto max-sm:h-12"
                        >
                            {t("editEvent")}
                        </button>

                        <button
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50 cursor-pointer max-sm:text-base max-sm:py-2 max-sm:w-3/4 max-sm:mx-auto max-sm:h-12"
                        >
                            {t("deleteEvent")}
                        </button>
                    </div>
                )}

                {showParticipantModal && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-start pt-20 max-sm:items-center max-sm:pt-0">
                        <div className="bg-white rounded p-6 w-96 max-h-[70vh] overflow-auto max-sm:w-[98vw] max-sm:p-2">
                            {typeof event.maxNumberOfParticipants === "number" && event.maxNumberOfParticipants > 0 && (
                                <h2 className="text-xl font-bold mb-4 max-sm:text-lg">
                                    {t("registered")} ({event.participantsList.length} / {event.maxNumberOfParticipants})
                                </h2>
                            )}

                            <ul className="space-y-2">
                                {event.participantsList.map(user => (
                                    <li
                                        key={user.id}
                                        className="flex justify-between items-center px-5 max-sm:px-0"
                                    >
                                        <span className="max-sm:text-base">
                                            {user.firstname} {user.lastname}
                                        </span>

                                        <button
                                            disabled={removingId === user.id}
                                            onClick={async () => {
                                                setRemovingId(user.id);
                                                try {
                                                    const updated = await removeParticipant(id!, user.id);
                                                    setEvent(updated);
                                                    toast.success(t("toastUserDeleted"));
                                                } catch {
                                                    toast.error(t("toastUserDeletedError"));
                                                } finally {
                                                    setRemovingId(null);
                                                }
                                            }}
                                            className="text-red-600 hover:underline disabled:opacity-50 cursor-pointer underline max-sm:text-base"
                                        >
                                            {t("unsubscribe")}
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => setShowParticipantModal(false)}
                                className="mt-8 bg-gray-200 px-3 py-1 rounded hover:bg-gray-400 cursor-pointer block mx-auto max-sm:w-full max-sm:text-base max-sm:py-3"
                            >
                                {t("close")}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {!isAuthor && event.author.role !== "admin" && event.author.role !== "moderator" && (
                <div className="w-[20%] mx-auto flex justify-end max-sm:w-full max-sm:justify-center">
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="mt-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer max-sm:w-full max-sm:text-base max-sm:py-3"
                    >
                        {t("report")}
                    </button>

                    {showReportModal && (
                        <ReportModal
                            reportedUserId={event.author.id}
                            reportedContentId={event.id}
                            reportedContentType="EVENT"
                            onClose={() => setShowReportModal(false)}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default EventDetailPage;

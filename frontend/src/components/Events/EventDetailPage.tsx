import { useState, useEffect } from "react";
import { getEvent, EventDetails, deleteEvent, subscribeEvent, unsubscribeEvent } from "../../api/eventService";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { removeParticipant } from "../../api/eventService";
import usePermission from "../Utils/usePermission";
import ReportModal from "../Utils/ReportModal";

function EventDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const { restricted, expiresAt, loading: permLoading } = usePermission("register_event");
    const [event, setEvent] = useState<EventDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
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
            } catch(error) {
                console.error(error);
                toast.error("Unable to load event.");
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
        return <p className="p-6 text-red-500">{error}</p>
    }

    if (!event) {
        return null;
    }

    const isOwner = user && event && user.id === event.author.id;
    const isAdminorModerator = user && (user.role === "admin" || user.role === "moderator");
    const isSubscribe = event.participantsList.some((u) => u.id === user?.id);
    const isFull = event.maxNumberOfParticipants !== undefined
        && event.participantsList.length >= event.maxNumberOfParticipants
        && !isSubscribe;

    const handleSubscribe = async () => {
        try {
            const updated = await subscribeEvent(id!);
            setEvent(updated);
            toast.success("Successful registration !");
        } catch(error) {
            toast.error("Error during registration : " + error);
        }
    };

    const handleUnsubscribe = async () => {
        try {
            const updated = await unsubscribeEvent(id!);
            setEvent(updated);
            toast.success("Unsubscribe successful !");
        } catch (error) {
            toast.error("Error unsubscribing : " + error);
        }
    }

    const handleDelete = async () => {
        const confirmed = window.confirm("You are about to delete an event. Would you like to confirm?");
        if (!confirmed) {
            return;
        }

        try {
            await deleteEvent(id!);
            toast.success("Event successfully deleted!")
            navigate("/events");
        } catch (error) {
            toast.error("Unable to delete event : " + error);
        }
    };

    if (permLoading) {
        return <p>Checking permissions…</p>;
    }

    return (
        <div>
            <div className="p-6 space-y-4 border mt-10 w-[20%] mx-auto">
                <div className="flex justify-between gap-4">
                    <button
                        onClick={() => navigate("/events")}
                        className="text-blue-600 underline cursor-pointer border rounded px-2 py-1 bg-white h-10"
                    >
                        ← Back
                    </button>

                    <div className="flex flex-col gap-2">
                        {event.maxNumberOfParticipants == null ? (
                            <p className="text-green-600 text-l font-semibold">Open event</p>
                        ) : (
                            isSubscribe ? (
                                <button
                                    onClick={handleUnsubscribe}
                                    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 cursor-pointer border"
                                >
                                    Unsubscribe
                                </button>
                            ) : isFull ? (
                                <p className="text-gray-500 text-l font-semibold">Event full</p>
                            ) : restricted ? (
                                <p className="text-red-600 text-l font-semibold">
                                    You are no longer allowed to register for this event until{" "}
                                    {new Date(expiresAt!).toLocaleDateString()}.
                                </p>
                            ) : (
                                <button
                                    onClick={handleSubscribe}
                                    className="bg-green-600 text-white px-4 py-2 border rounded hover:bg-green-700 cursor-pointer"
                                >
                                    Subscribe
                                </button>
                            )
                        )}

                        {event.maxNumberOfParticipants != null && (isOwner || isAdminorModerator) && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 border rounded cursor-pointer"
                            >
                                Participant list
                            </button>
                        )}
                    </div>
                </div>

                <h1 className="text-2xl font-bold">{event.name}</h1>
                <p>
                    <strong>Start :</strong>{" "}
                    {new Date(event.startDate).toLocaleString()}
                </p>

                <p>
                    <strong>End :</strong>{" "}
                    {new Date(event.endDate).toLocaleString()}
                </p>

                <p>
                    <strong>Place :</strong> {event.place}
                </p>

                {event.maxNumberOfParticipants && (
                    <p>
                        <strong>Max places :</strong> {event.maxNumberOfParticipants}
                    </p>
                )}

                <p>
                    <strong>Description :</strong>
                </p>
                <p className="whitespace-pre-wrap">{event.description}</p>

                <p>
                    <strong>Author :</strong> {event.author.firstname}{" "}
                    {event.author.lastname}
                </p>

                <p>
                    <strong>Participants :</strong> {event.participantsList.length}
                </p>

                {(isOwner || isAdminorModerator) && (
                    <div className="mt-4 flex gap-2 justify-center">
                        <button
                            onClick={() => navigate(`/events/${id}/edit`)}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
                        >
                            Edit event
                        </button>
                        
                        <button
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
                        >
                            Delete event
                        </button>
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-20">
                        <div className="bg-white rounded p-6 w-96 max-h-[70vh] overflow-auto">
                            {event.maxNumberOfParticipants && (
                                <h2 className="text-xl font-bold mb-4">Registered ({event.participantsList.length} / {event.maxNumberOfParticipants})</h2>
                            )}
                            <ul className="space-y-2">
                                {event.participantsList.map(user => (
                                    <li
                                        key={user.id}
                                        className="flex justify-between items-center px-5"
                                    >
                                        <span>{user.firstname} {user.lastname}</span>
                                        <button
                                            disabled={removingId === user.id}
                                            onClick={async () => {
                                                setRemovingId(user.id);
                                                try {
                                                    const updated = await removeParticipant(id!, user.id);
                                                    setEvent(updated);
                                                    toast.success("User deleted.");
                                                } catch (error) {
                                                    toast.error("Error : " + error);
                                                } finally {
                                                    setRemovingId(null);
                                                }
                                            }}
                                            className="text-red-600 hover:underline disabled:opacity-50 cursor-pointer underline"
                                        >
                                            Unsubscribe
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => setShowModal(false)}
                                className="mt-8 bg-gray-200 px-3 py-1 rounded hover:bg-gray-400 cursor-pointer block mx-auto"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="w-[20%] mx-auto flex justify-end">
                <button
                    onClick={() => setShowReportModal(true)}
                    className="mt-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                >
                    Report event
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
        </div>
    );
}

export default EventDetailPage;

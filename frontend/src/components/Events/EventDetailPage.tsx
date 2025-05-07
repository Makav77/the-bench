import { useState, useEffect } from "react";
import { getEvent, EventDetails, deleteEvent, subscribeEvent, unsubscribeEvent } from "../../api/eventService";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

function EventDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [event, setEvent] = useState<EventDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
    const isAdmin = user && user.role === "admin";
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

    return (
        <div className="p-6 space-y-4 border mt-10 w-[20%] mx-auto">
            <div className="flex justify-between gap-4">
                <button
                    onClick={() => navigate("/events")}
                    className="text-blue-600 underline cursor-pointer border rounded px-2 py-1 bg-white"
                >
                    ← Back
                </button>

                {isSubscribe ? (
                    <button
                        onClick={handleUnsubscribe}
                        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                    >
                        Unsubscribe
                    </button>
                ) : isFull ? (
                    <p className="text-gray-500 text-l font-semibold">
                        Event full
                    </p>
                ) : (
                    <button
                        onClick={handleSubscribe}
                        className="bg-green-600 text-white px-4 py-2 border rounded hover:bg-green-700"
                    >
                        Subscribe
                    </button>
                )}
            </div>

            <h1 className="text-2xl font-bold">{event.name}</h1>
            <p>
                <strong>Début :</strong>{" "}
                {new Date(event.startDate).toLocaleString()}
            </p>

            <p>
                <strong>Fin :</strong>{" "}
                {new Date(event.endDate).toLocaleString()}
            </p>

            <p>
                <strong>Lieu :</strong> {event.place}
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
                <strong>Auteur :</strong> {event.author.firstname}{" "}
                {event.author.lastname}
            </p>

            <p>
                <strong>Participants :</strong> {event.participantsList.length}
            </p>

            {(isOwner || isAdmin) && (
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
        </div>
    );
}

export default EventDetailPage;

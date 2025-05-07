import { useState, useEffect } from "react";
import { getEvents, EventSummary, subscribeEvent } from "../../api/eventService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

function EventsPage() {
    const [events, setEvents] = useState<EventSummary[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
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
        <div className="p-6 w-[40%] mx-auto">
            <div className="flex justify-end mb-4 h-10">
                <button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-fit cursor-pointer"
                    onClick={() => navigate("/events/create")}
                >
                    Create event
                </button>
            </div>

            <h1 className="text-2xl font-bold mb-4">Upcoming Events</h1>

            {isLoading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <div className="grid grid-cols-1 gap-4">
                {events.map((event) => (
                    <div
                        key={event.id}
                        className="p-4 border rounded cursor-pointer hover:shadow flex justify-between items-center"
                        onClick={() => navigate(`/events/${event.id}`)}
                    >
                        <div className="flex flex-col">
                            <h2 className="text-lg font-semibold">{event.name}</h2>
                            <p>{new Date(event.startDate).toLocaleString()}</p>
                        </div>

                        {(() => {
                            const isSubscribed = event.participantsList.some((u) => u.id === user?.id);
                            const isFull = event.maxNumberOfParticipants !== undefined
                                && event.participantsList.length >= event.maxNumberOfParticipants
                                && !isSubscribed;

                            if (isSubscribed) {
                                return <p className="text-blue-600 font-semibold">You are registered</p>
                            }

                            return (
                                <>
                                    {event.maxNumberOfParticipants === null || event.maxNumberOfParticipants === undefined ? (
                                        <span className="text-green-700 font-semibold">Open event</span>
                                    ) : isFull ? (
                                        <span className="text-red-500 font-semibold">Event full</span>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                            e.stopPropagation();
                                            handleSubscribe(event.id);
                                            }}
                                            className="bg-green-600 text-white px-4 h-10 border rounded hover:bg-green-700"
                                        >
                                            Register
                                        </button>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                ))}
            </div>

            <div className="flex justify-center items-center mt-6 gap-4">
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    ← Prev
                </button>

                <span>
                    Page {page} / {lastPage}
                </span>

                <button
                    type="button"
                    disabled={page >= lastPage}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    Next →
                </button>
            </div>
        </div>
    )
}

export default EventsPage;

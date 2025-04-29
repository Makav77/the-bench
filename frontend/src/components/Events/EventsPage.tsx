import { useState, useEffect } from "react";
import { getEvents, EventSummary } from "../../api/eventService";
import { useNavigate } from "react-router-dom";

function EventsPage() {
    const [events, setEvents] = useState<EventSummary[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            setError(null);

            try {
                const { data, lastPage } = await getEvents(page, 5);
                setEvents(data);
                setLastPage(lastPage);
            } catch(error) {
                setError("Impossible de charger les événements : " + error);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [page]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Upcoming Events</h1>

            {isLoading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <div className="grid grid-cols-1 gap-4">
                {events.map((event) => (
                    <div
                        key={event.id}
                        className="p-4 border rounded cursor-pointer hover:shadow"
                        onClick={() => navigate(`/events/${event.id}`)}
                    >
                        <h2 className="text-lg font-semibold">{event.name}</h2>
                        <p>{new Date(event.startDate).toLocaleString()}</p>
                    </div>
                ))}
            </div>

            <div className="flex justify-center items-center mt-6 gap-4">
                <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    ← Back
                </button>

                <span>
                    Page {page} / {lastPage}
                </span>

                <button
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

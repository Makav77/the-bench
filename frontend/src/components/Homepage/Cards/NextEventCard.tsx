import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEvents, EventSummary } from "../../../api/eventService";

function NextEventCard() {
    const [event, setEvent] = useState<EventSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function load() {
            try {
                const { data } = await getEvents(1, 5);
                const futureEvents = data
                    .filter(event => new Date(event.startDate) > new Date())
                    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

                if (futureEvents.length > 0) {
                    setEvent(futureEvents[0]);
                } else {
                    setError("No future event.");
                }
            } catch (error) {
                setError("Unable to load next event : " + error);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    if (isLoading) {
        return <p className="p-6">Loading...</p>;
    }

    if (error) {
        return <p className="p-6 text-red-500">{error}</p>
    }

    if (!event) {
        return <p className="p-6">No item available</p>
    }

    return (
        <div
            onClick={() => navigate(`/events/${event.id}`)}
            className="mb-10 flex justify-between items-center w-3/4 mx-auto bg-white rounded-lg shadow hover:cursor-pointer hover:shadow-md transition h-25 px-5"
        >
            <div className="pr-4">
                <h4 className="text-lg font-bold">{event.name}</h4>
                <p className="text-sm text-gray-500">
                    Start on {new Date(event.startDate).toLocaleDateString()} at {new Date(event.startDate).toLocaleTimeString()}
                </p>
            </div>

            <div>
                Organized by {event.author.firstname} {event.author.lastname}
            </div>
        </div>
    )


}

export default NextEventCard;

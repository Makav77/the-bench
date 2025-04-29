import { useState, useEffect } from "react";
import { getEvent, EventDetails } from "../../api/eventService";
import { useParams, useNavigate } from "react-router-dom";

function EventDetailPage() {
    const { id } = useParams<{ id: string }>();
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
                } else {
                    setError("ID invalide");
                }
            } catch(error) {
                setError("Impossible de charger l'événement : " + error);
            } finally {
                setIsLoading(false);
            }
        }
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

    return (
        <div className="p-6 space-y-4 border mt-10 w-[20%] mx-auto">
            <button
                onClick={() => navigate("/events")}
                className="text-blue-600 underline"
            >
                ← Back
            </button>

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
        </div>
    );
}

export default EventDetailPage;

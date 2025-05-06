import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EventForm, { EventFormData } from "./EventForm";
import { getEvent, updateEvent } from "../../api/eventService";
import { EventDetails } from "../../api/eventService";

export default function EditEventPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string}>();
    const [event, setEvent] = useState<EventDetails | null>(null);

    useEffect(() => {
        const fetch = async () => {
            if (id) {
                const event = await getEvent(id);
                setEvent(event);
            }
        };
        fetch();
    }, [id]);

    const handleSubmit = async (data: EventFormData) => {
        if (!id) return;
        const updated = await updateEvent(id, data);
        navigate(`/events/${updated.id}`);
    }

    if (!event) {
        return <p>Loading...</p>
    }

    return(
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Edit event</h1>
            <EventForm defaultValues={event} onSubmit={handleSubmit} />
        </div>
    );
}

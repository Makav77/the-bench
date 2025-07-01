import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EventForm, { EventFormData } from "./EventForm";
import { getEvent, updateEvent } from "../../api/eventService";
import { EventDetails } from "../../api/eventService";
import { toast } from "react-toastify";

function EditEventPage() {
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

        const toSend: EventFormData = {
            name: data.name,
            startDate: data.startDate,
            endDate: data.endDate,
            place: data.place,
            description: data.description,
            maxNumberOfParticipants:
                (data.maxNumberOfParticipants === undefined || data.maxNumberOfParticipants === null || data.maxNumberOfParticipants <= 0)
                    ? null
                    : data.maxNumberOfParticipants
        };

        const updated = await updateEvent(id, toSend);
        toast.success("Event updated !");
        navigate(`/events/${updated.id}`);
    };

    if (!event) {
        return <p>Loading...</p>
    }

    return (
        <div className="p-6">
            <h1 className="w-[28%] mx-auto text-4xl font-semibold mb-4 pl-2">Edit event</h1>
            <EventForm defaultValues={event} onSubmit={handleSubmit} />
        </div>
    );
}

export default EditEventPage;

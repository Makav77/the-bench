import { useNavigate } from "react-router-dom";
import EventForm, { EventFormData } from "./EventForm";
import { createEvent } from "../../api/eventService";


export default function CreateEventPage() {
    const navigate = useNavigate();

    const handleSubmit = async (data: EventFormData) => {
        const event = await createEvent(data);
        navigate(`/events/${event.id}`);
    };

    return (
        <div className="p-6">
            <h1 className="w-[28%] mx-auto text-4xl font-semibold mb-4 pl-2">Create an event</h1>
            <EventForm onSubmit={handleSubmit} />
        </div>
    );
}

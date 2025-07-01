import { useNavigate } from "react-router-dom";
import EventForm, { EventFormData } from "./EventForm";
import { createEvent } from "../../api/eventService";
import usePermission from "../Utils/usePermission";
import { toast } from "react-toastify";
import { format } from "date-fns";

function CreateEventPage() {
    const navigate = useNavigate();

    const { restricted, expiresAt, reason } = usePermission("create_event");
    if (restricted === null) {
        return <p className="p-6 text-center">Checking permissions ...</p>;
    }

    if (restricted) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">
                    You are no longer allowed to create an event until{" "}
                    {expiresAt
                        ? format(expiresAt, "dd/MM/yyyy 'at' HH:mm")
                        : "unknow date"}.
                    {reason && (
                        <span>
                            <br />
                        Reason: {reason}
                        <br />
                        </span>
                    )}
                    Contact a moderator or administrator for more information.
                </p>
            </div>
        );
    }

    const handleSubmit = async (data: EventFormData) => {
        const event = await createEvent(data);
        toast.success("Event created !");
        navigate(`/events/${event.id}`);
    };

    return (
        <div className="p-6">
            <h1 className="w-[28%] mx-auto text-4xl font-semibold mb-4 pl-2">Create an event</h1>
            <EventForm onSubmit={handleSubmit} />
        </div>
    );
}

export default CreateEventPage;

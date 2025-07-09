import { useNavigate } from "react-router-dom";
import EventForm, { EventFormData } from "./EventForm";
import { createEvent } from "../../api/eventService";
import usePermission from "../Utils/usePermission";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

function CreateEventPage() {
    const navigate = useNavigate();
    const { t } = useTranslation("Events/CreateEventPage");

    const { restricted, expiresAt, reason } = usePermission("create_event");
    if (restricted === null) {
        return <p className="p-6 text-center">{t("checkingPermissions")}</p>;
    }

    if (restricted) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">
                    {t("restrictionMessage")} {" "}
                    {expiresAt
                        ? format(expiresAt, "dd/MM/yyyy 'at' HH:mm")
                        : "unknow date"}.
                    {reason && (
                        <span>
                            <br />
                        {t("reason")} {reason}
                        <br />
                        </span>
                    )}
                    {t("contactMessage")}
                </p>
            </div>
        );
    }

    const handleSubmit = async (data: EventFormData) => {
        const event = await createEvent(data);
        toast.success(t("toastEventCreated"));
        navigate(`/events/${event.id}`);
    };

    return (
        <div className="p-6">
            <h1 className="w-[28%] mx-auto text-4xl font-semibold mb-4 pl-2 max-sm:w-full">{t("createEvent")}</h1>
            <EventForm onSubmit={handleSubmit} />
        </div>
    );
}

export default CreateEventPage;

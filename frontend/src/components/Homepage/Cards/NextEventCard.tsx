import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEvents, EventSummary } from "../../../api/eventService";
import { useTranslation } from "react-i18next";

function NextEventCard() {
    const [event, setEvent] = useState<EventSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation("Homepage/NextEventCard");

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
                    setError(t("noEventAvailable"));
                }
            } catch {
                setError(t("loadPostError"));
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    if (isLoading) {
        return <p className="p-6">{t("loading")}</p>;
    }

    if (error) {
        return <p className="p-6 text-red-500">{error}</p>
    }

    if (!event) {
        return <p className="p-6">{t("noEventAvailable")}</p>
    }

    return (
        <div
            onClick={() => navigate(`/events/${event.id}`)}
            className="mb-10 flex justify-between items-center w-3/4 mx-auto bg-white rounded-2xl shadow hover:bg-gray-100 cursor-pointer transition h-25 px-5"
        >
            <div className="pr-4">
                <h4 className="text-lg font-bold">{event.name}</h4>
                <p className="text-sm text-gray-500">
                    {t("startOn")} {new Date(event.startDate).toLocaleDateString()} {t("at")} {new Date(event.startDate).toLocaleTimeString()}
                </p>
            </div>

            <div>
                {t("organizedBy")}{" "}
                <span
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${event.author.id}`);
                    }}
                    className="text-blue-600 hover:underline cursor-pointer"
                >
                    {event.author.firstname} {event.author.lastname}
                </span>
            </div>
        </div>
    )
}

export default NextEventCard;

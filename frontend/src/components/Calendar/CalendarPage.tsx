import { useState, useEffect } from "react";
import YearCalendar, { YearEvent } from "./YearCalendar";
import { getEvents, EventSummary } from "../../api/eventService";

function CalendarPage() {
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [events, setEvents] = useState<YearEvent[]>([]);

    useEffect(() => {
        (async () => {
            const { data } = await getEvents(1, 1000);
            const evs: YearEvent[] = data
                .filter((e: EventSummary) => {
                    const start = new Date(e.startDate).getFullYear();
                    const end = new Date(e.endDate).getFullYear();
                    return start === year || end === year;
                })
                .map((e: EventSummary) => ({
                    id: e.id,
                    title: e.name,
                    start: new Date(e.startDate),
                    end: new Date(e.endDate),
                }));
            setEvents(evs);
        })();
    }, [year]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <button
                    className="bg-gray-200 px-3 py-1 rounded"
                    onClick={() => setYear(y => y - 1)}
                >
                    ← {year - 1}
                </button>

                <h2 className="text-xl font-bold">{year}</h2>

                <button
                    className="bg-gray-200 px-3 py-1 rounded"
                    onClick={() => setYear(y => y + 1)}
                >
                    {year + 1} →
                </button>
            </div>
            <YearCalendar events={events} year={year} />
        </div>
    );
}

export default CalendarPage;

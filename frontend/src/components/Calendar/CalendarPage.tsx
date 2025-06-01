import { useState, useEffect } from "react";
import YearCalendar, { YearItem } from "./YearCalendar";
import { getEvents, EventSummary } from "../../api/eventService";
import { ChallengeSummary, getChallenges } from "../../api/challengeService";

function CalendarPage() {
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [items, setItems] = useState<YearItem[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const [eventsRes, challengesRes] = await Promise.all([
                    getEvents(1, 1000),
                    getChallenges(1, 1000),
                ]);

                const eventsData = eventsRes.data as EventSummary[];
                const challengesData = challengesRes.data as ChallengeSummary[];

                const evs: YearItem[] = eventsData
                    .filter(e => {
                        const start = new Date(e.startDate).getFullYear();
                        const end = new Date(e.endDate).getFullYear();
                        return start === year || end === year;
                    })
                    .map(e => ({
                        id: e.id,
                        title: e.name,
                        start: new Date(e.startDate),
                        end: new Date(e.endDate),
                        type: "event",
                    }));

                const challs: YearItem[] = challengesData
                    .filter(c => {
                        const start = new Date(c.startDate).getFullYear();
                        const end = new Date(c.endDate).getFullYear();
                        return start === year || end === year;
                    })
                    .map(c => ({
                        id: c.id,
                        title: c.title,
                        start: new Date(c.startDate),
                        end: new Date(c.endDate),
                        type: "challenge",
                    }));

                setItems([...evs, ...challs]);
            } catch (error) {
                console.error("Unable to load events ou challenges : " + error);
            }
        })();
    }, [year]);


    return (
        <div className="p-6 w-[80%] mx-auto">
            <div className="flex justify-between items-center mb-4">
                <button
                    className="bg-gray-200 px-3 py-1 rounded cursor-pointer hover:bg-gray-300"
                    onClick={() => setYear(y => y - 1)}
                >
                    ← {year - 1}
                </button>

                <h2 className="text-3xl font-bold">{year}</h2>

                <button
                    className="bg-gray-200 px-3 py-1 rounded cursor-pointer hover:bg-gray-300"
                    onClick={() => setYear(y => y + 1)}
                >
                    {year + 1} →
                </button>
            </div>
            <YearCalendar items={items} year={year} setYear={setYear} />
        </div>
    );
}

export default CalendarPage;

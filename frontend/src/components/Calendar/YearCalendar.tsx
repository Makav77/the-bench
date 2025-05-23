import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en": require("date-fns/locale/en") };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export interface YearEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
}

interface YearCalendarProps {
    events: YearEvent[];
    year: number;
}

export default function YearCalendar({ events, year }: YearCalendarProps) {
    return (
        <Calendar
            localizer={localizer}
            events={events}
            defaultView={[Views.MONTH]}
            views={[Views.MONTH]}
            date={new Date(year, 0, 1)}
            onNavigate={() => {}}
            onSelectEvent={event => {
                window.location.href = `/events/${(event.id)}`;
            }}
            style={{ height: 700 }}
        />
    );
}

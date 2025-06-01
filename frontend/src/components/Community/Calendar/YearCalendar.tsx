import { Calendar, Views, dateFnsLocalizer, View, ToolbarProps } from "react-big-calendar";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

const locales = { en: enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export interface YearItem {
    id: string;
    title: string;
    start: Date;
    end: Date;
    type: "event" | "challenge";
}

interface YearCalendarProps {
    items: YearItem[];
    year: number;
    setYear: Dispatch<SetStateAction<number>>;
}

function CustomToolbar({date, onNavigate, setYear }: ToolbarProps<YearItem, object> & { setYear: React.Dispatch<React.SetStateAction<number>> }) {
    const today = new Date();
    const goToBack = () => onNavigate("PREV");
    const goToNext = () => onNavigate("NEXT");
    const goToToday = () => {
        onNavigate("DATE", today);
        setYear(today.getFullYear());
    }

    const monthLabel = format(date, "LLLL", { locale: enUS });

    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2 items-center w-[30%]">
                <button
                    onClick={goToBack}
                    className="px-3 py-1 bg-gray-200 rounded cursor-pointer hover:bg-gray-300 w-[50%]"
                >
                    Previous month
                </button>

                <button
                    onClick={goToToday}
                    className="px-3 py-1 bg-gray-200 rounded cursor-pointer hover:bg-gray-300 w-[50%]"
                >
                    Today
                </button>

                <button
                    onClick={goToNext}
                    className="px-3 py-1 bg-gray-200 rounded cursor-pointer hover:bg-gray-300 w-[50%]"
                >
                    Next month
                </button>
            </div>

            <div>
                <p className="font-bold text-xl">{monthLabel}</p>
            </div>
            <div style={{ width: 445 }} />
        </div>
    );
}

function YearCalendar({ items, year, setYear }: YearCalendarProps) {
    const navigate = useNavigate();
    const today = new Date();
    const isCurrentYear = today.getFullYear() === year;
    const [date, setDate] = useState<Date>(isCurrentYear ? today : new Date(year, 0, 1));

    useEffect(() => {
        setDate(isCurrentYear ? today : new Date(year, 0, 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year]);

    const dayPropGetter = (dateCell: Date) => {
        if (
            dateCell.getFullYear() === today.getFullYear() &&
            dateCell.getMonth() === today.getMonth() &&
            dateCell.getDate() === today.getDate()
        ) {
            return {
                style: {
                    backgroundColor: "#76CD26",
                    fontWeight: "bold",
                },
            };
        }
        return {};
    }

    const eventStyleGetter = (item: YearItem) => {
        return {
            style: {
                backgroundColor: item.type === "event" ? "#3b82f6" : "#d124b1",
                borderRadius: "4px",
                color: "white",
                border: "none",
                padding: "2px 4px",
            },
        };
    };

    return (
        <Calendar
            localizer={localizer}
            events={items}
            defaultView={Views.MONTH as View}
            views={[Views.MONTH]}
            date={date}
            onNavigate={(newDate) => setDate(newDate)}
            components={{ toolbar: (toolbarProps: any) => (
                <CustomToolbar
                    {...toolbarProps}
                    setYear={setYear}
                />
            )}}
            onSelectEvent={(item: YearItem) => {
                if (item.type === "event") navigate(`/events/${item.id}`);
                else navigate(`/challenges/${item.id}`);
            }}
            dayPropGetter={dayPropGetter}
            eventPropGetter={eventStyleGetter}
            style={{ height: 700 }}
        />
    );
}

export default YearCalendar;

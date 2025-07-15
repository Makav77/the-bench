import { Calendar, Views, dateFnsLocalizer, View, ToolbarProps } from "react-big-calendar";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { enUS, fr } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Locale } from "date-fns";

const locales: { [lng: string]: Locale } = {
    en: enUS,
    fr: fr,
};

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
    const { t, i18n } = useTranslation("Community/YearCalendar");
    const currentLocale = locales[i18n.language] ?? enUS;
    const rawMonth = format(date, "LLLL", { locale: currentLocale });
    const monthLabel = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);

    return (
        <div className="flex items-center justify-between mb-4 max-sm:flex-col max-sm:gap-3 max-sm:mb-2 max-sm:mt-5">
            <div className="flex space-x-2 items-center w-[30%] max-sm:w-1/1">
                <button
                    onClick={goToBack}
                    className="px-3 py-1 bg-gray-200 rounded cursor-pointer hover:bg-gray-300 w-[50%] max-sm:w-full max-sm:text-base max-sm:h-15"
                >
                    {t("previousMonth")}
                </button>

                <button
                    onClick={goToToday}
                    className="px-3 py-1 bg-gray-200 rounded cursor-pointer hover:bg-gray-300 w-[50%] max-sm:w-full max-sm:text-base max-sm:h-15"
                >
                    {t("today")}
                </button>

                <button
                    onClick={goToNext}
                    className="px-3 py-1 bg-gray-200 rounded cursor-pointer hover:bg-gray-300 w-[50%] max-sm:w-full max-sm:text-base max-sm:h-15"
                >
                    {t("nextMonth")}
                </button>
            </div>
            <div className="mr-12 max-sm:mr-0">
                <p className="font-bold text-xl text-center max-sm:text-lg max-sm:mt-3">
                    {monthLabel}
                </p>
            </div>

            <div
                className="max-sm:hidden" 
                style={{ width: 445 }}
            />
        </div>
    );
}

function YearCalendar({ items, year, setYear }: YearCalendarProps) {
    const navigate = useNavigate();
    const { i18n } = useTranslation("Community/YearCalendar")
    const today = new Date();
    const isCurrentYear = today.getFullYear() === year;
    const [date, setDate] = useState<Date>(isCurrentYear ? today : new Date(year, 0, 1));

    useEffect(() => {
        setDate(isCurrentYear ? today : new Date(year, 0, 1));
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
            culture={i18n.language}
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
            style={{ height: 700, width: "100%" }}
            className="max-sm:text-[12px] max-sm:h-[420px]"
        />
    );
}

export default YearCalendar;

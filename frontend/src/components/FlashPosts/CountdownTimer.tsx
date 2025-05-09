import { useState, useEffect } from "react";
import { addHours, differenceInMinutes } from "date-fns";

interface CountdownTimerProps {
    createdAt: string;
}

function CountdownTimer({ createdAt }: CountdownTimerProps) {
    const [remainingMinutes, setRemainingMinutes] = useState<number>(() => {
        const expire = addHours(new Date(createdAt), 24);
        return Math.max(0, differenceInMinutes(expire, new Date()));
    });

    useEffect(() => {
        const timer = setInterval(() => {
            const expire = addHours(new Date(createdAt), 24);
            const mins = Math.max(0, differenceInMinutes(expire, new Date()));
            setRemainingMinutes(mins);
        }, 60_000);

        return () =>clearInterval(timer);
    }, [createdAt]);

    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;

    return (
        <p className="text-sm text-red-500">
            End in {hours}h{minutes.toString().padStart(2, "0")}
        </p>
    );
}

export default CountdownTimer;

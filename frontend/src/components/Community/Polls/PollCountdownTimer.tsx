import { useState, useEffect } from "react";
import { differenceInMinutes } from "date-fns";

interface PollCountdownTimerProps {
    expiresAt: string;
}

export default function PollCountdownTimer({ expiresAt }: PollCountdownTimerProps) {
    const [remainingMinutes, setRemainingMinutes] = useState<number>(() => {
        const mins = Math.max(0, differenceInMinutes(new Date(expiresAt), new Date()));
        return mins;
    });

    useEffect(() => {
        const updateRemaining = () => {
            const mins = Math.max(0, differenceInMinutes(new Date(expiresAt), new Date()));
            setRemainingMinutes(mins);
        };

        updateRemaining();
        const timer = setInterval(updateRemaining, 60_000);
        return () => clearInterval(timer);
    }, [expiresAt]);

    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;

    return (
        <p className="text-red-500 font-semibold text-sm">
            Expired in {hours}h{minutes.toString().padStart(2, "0")}m
        </p>
    );
}

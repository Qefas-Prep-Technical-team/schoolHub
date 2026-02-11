'use client';

import { useState, useEffect } from 'react';
import TimerUnit from './ui/TimerUnit';
import { CountdownData } from './types';

interface CountdownTimerProps {
    targetDate: Date;
    onComplete?: () => void;
}

export default function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
    const [countdown, setCountdown] = useState<CountdownData>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            if (distance < 0) {
                clearInterval(interval);
                onComplete?.();
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setCountdown({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate, onComplete]);

    return (
        <div className="flex gap-4">
            <TimerUnit value={countdown.days} label="Days" />
            <TimerUnit value={countdown.hours} label="Hours" />
            <TimerUnit value={countdown.minutes} label="Minutes" />
            <TimerUnit value={countdown.seconds} label="Seconds" />
        </div>
    );
}
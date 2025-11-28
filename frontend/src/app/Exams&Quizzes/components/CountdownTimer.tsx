'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
    targetTime: string; // ISO string or timestamp
    onComplete?: () => void;
}

export default function CountdownTimer({ targetTime, onComplete }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetTime).getTime() - new Date().getTime();

            if (difference <= 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                onComplete?.();
                return;
            }

            setTimeLeft({
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetTime, onComplete]);

    return timeLeft;
}
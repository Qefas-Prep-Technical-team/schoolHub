'use client';

import { useEffect, useState } from 'react';
import { Card } from './ui/Card';
import { Clock } from 'lucide-react';

interface TimerProps {
    duration: number; // in minutes
    onTimeUp?: () => void;
}

export default function Timer({ duration, onTimeUp }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert to seconds

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp?.();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onTimeUp]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Card className="p-6">
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-lg font-medium text-gray-500 dark:text-gray-400">
                    <Clock className="w-5 h-5" />
                    <span>Time Remaining</span>
                </div>
                <p className="mt-1 text-4xl font-bold tracking-tighter">
                    {formatTime(timeLeft)}
                </p>
            </div>
        </Card>
    );
}
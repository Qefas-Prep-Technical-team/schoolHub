'use client';

import { useState, useEffect } from 'react';

interface Props {
  dueDate: string; // ISO string recommended
  onTimeUp?: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({ dueDate, onTimeUp }: Props) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(dueDate);
    if (isNaN(target.getTime())) return;

    const tick = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (onTimeUp) onTimeUp();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    tick(); // Update immediately on mount
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [dueDate, onTimeUp]);

  const isTimeUp =
    timeRemaining.days + timeRemaining.hours + timeRemaining.minutes + timeRemaining.seconds <= 0;

  return (
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-orange-500">schedule</span>
      <div className="flex items-center gap-1 text-sm font-medium">
        {timeRemaining.days > 0 && (
          <>
            <span className="text-[#0e121b] dark:text-white">{timeRemaining.days}d</span>
            <span className="text-gray-400">:</span>
          </>
        )}
        <span className="text-[#0e121b] dark:text-white">
          {timeRemaining.hours.toString().padStart(2, '0')}h
        </span>
        <span className="text-gray-400">:</span>
        <span className="text-[#0e121b] dark:text-white">
          {timeRemaining.minutes.toString().padStart(2, '0')}m
        </span>
        <span className="text-gray-400">:</span>
        <span className="text-[#0e121b] dark:text-white">
          {timeRemaining.seconds.toString().padStart(2, '0')}s
        </span>
        <span className="text-gray-500 dark:text-gray-400 ml-2">
          {isTimeUp ? 'Submission closed' : 'remaining'}
        </span>
      </div>
    </div>
  );
}

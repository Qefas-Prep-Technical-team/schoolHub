// src/components/Dashboard/CountdownTimer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { CountdownTime } from './types';

const CountdownTimer: React.FC = () => {
    const [time, setTime] = useState<CountdownTime>({
        days: '01',
        hours: '10',
        minutes: '35',
        seconds: '22'
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setTime((prevTime) => {
                let days = parseInt(prevTime.days);
                let hours = parseInt(prevTime.hours);
                let minutes = parseInt(prevTime.minutes);
                let seconds = parseInt(prevTime.seconds);

                if (seconds > 0) {
                    seconds--;
                } else {
                    seconds = 59;
                    if (minutes > 0) {
                        minutes--;
                    } else {
                        minutes = 59;
                        if (hours > 0) {
                            hours--;
                        } else {
                            hours = 23;
                            if (days > 0) {
                                days--;
                            }
                        }
                    }
                }

                return {
                    days: days.toString().padStart(2, '0'),
                    hours: hours.toString().padStart(2, '0'),
                    minutes: minutes.toString().padStart(2, '0'),
                    seconds: seconds.toString().padStart(2, '0')
                };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const timeUnits = [
        { value: time.days, label: 'DAYS' },
        { value: time.hours, label: 'HOURS' },
        { value: time.minutes, label: 'MINS' },
        { value: time.seconds, label: 'SECS' }
    ];

    return (
        <div className="rounded-2xl border border-warning/50 bg-warning/10 p-6 text-center shadow-sm">
            <h3 className="text-base font-semibold text-amber-800 dark:text-warning">
                Quiz Starts In
            </h3>
            <div className="mt-2 flex items-center justify-center gap-4 text-4xl font-bold text-gray-800 dark:text-white">
                {timeUnits.map((unit, index) => (
                    <React.Fragment key={unit.label}>
                        <div>
                            <span className="font-mono">{unit.value}</span>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {unit.label}
                            </p>
                        </div>
                        {index < timeUnits.length - 1 && <span>:</span>}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default CountdownTimer;
'use client';

import { useState, useEffect } from 'react';
import CountdownTimer from './CountdownTimer';
import Button from './ui/Button';

interface CountdownCardProps {
    title: string;
    date: string;
    subject: string;
    image: string;
    initialCountdown?: {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    };
}

export default function CountdownCard({
    title,
    date,
    subject,
    image,
    initialCountdown = { days: 2, hours: 3, minutes: 45, seconds: 12 },
}: CountdownCardProps) {
    const [targetDate] = useState(() => {
        // Create a future date for the countdown
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + initialCountdown.days);
        futureDate.setHours(futureDate.getHours() + initialCountdown.hours);
        futureDate.setMinutes(futureDate.getMinutes() + initialCountdown.minutes);
        futureDate.setSeconds(futureDate.getSeconds() + initialCountdown.seconds);
        return futureDate;
    });

    const handleCountdownComplete = () => {
        console.log('Countdown complete!');
        // You could trigger a notification or update UI here
    };

    const handleViewDetails = () => {
        console.log('View details clicked for:', title);
        // Navigate to assessment details page
    };

    return (
        <section className="mb-10">
            <h2 className="mb-3 text-[22px] font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:text-gray-50">
                Next Up
            </h2>
            <div className="flex flex-col items-stretch justify-start overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/50 lg:flex-row">
                {/* Background Image */}
                <div
                    className="min-h-[200px] w-full bg-cover bg-center bg-no-repeat lg:min-h-full lg:w-2/5 xl:w-1/3"
                    style={{ backgroundImage: `url(${image})` }}
                    aria-label={`Abstract image representing ${subject}`}
                />

                {/* Content */}
                <div className="flex w-full flex-col p-6">
                    <p className="mb-1 text-sm font-medium leading-normal text-primary">
                        Countdown to your next assessment
                    </p>
                    <p className="mb-2 text-2xl font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:text-gray-50">
                        {title}
                    </p>
                    <p className="mb-6 text-base font-normal leading-normal text-gray-500 dark:text-gray-400">
                        {date}
                    </p>

                    {/* Timer */}
                    <CountdownTimer
                        targetDate={targetDate}
                        onComplete={handleCountdownComplete}
                    />

                    {/* Action Button */}
                    <div className="mt-6">
                        <Button onClick={handleViewDetails}>
                            View Preparation Materials
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
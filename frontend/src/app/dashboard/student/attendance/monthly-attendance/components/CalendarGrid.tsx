// src/components/Calendar/CalendarGrid.tsx
import React from 'react';
import CalendarDay from './CalendarDay';
import { DayData } from './types';

const CalendarGrid: React.FC = () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const calendarData: DayData[] = [
        { date: 1, status: 'present' },
        { date: 2, status: 'present' },
        {
            date: 3,
            status: 'absent',
            tooltip: {
                title: 'Absent - Math 101',
                description: 'Teacher\'s Comment: "Felt unwell during the second half."'
            }
        },
        { date: 4, status: 'present' },
        { date: 5, status: 'no-class' },
        { date: 6, status: 'no-class' },
        { date: 7, status: 'present' },
        { date: 8, status: 'present' },
        { date: 9, status: 'present' },
        { date: 10, status: 'present' },
        { date: 11, status: 'present' },
        { date: 12, status: 'no-class' },
        { date: 13, status: 'no-class' },
        { date: 14, status: 'present' },
        {
            date: 15,
            status: 'late',
            tooltip: {
                title: 'Late - History',
                description: 'Teacher\'s Comment: "Arrived 10 minutes late."'
            }
        },
        { date: 16, status: 'present' },
        { date: 17, status: 'present' },
        { date: 18, status: 'present' },
        { date: 19, status: 'no-class' },
        { date: 20, status: 'no-class' },
        { date: 21, status: 'present' },
        { date: 22, status: 'present' },
        { date: 23, status: 'today' },
        { date: 24, status: 'future' },
        { date: 25, status: 'future' },
        { date: 26, status: 'no-class' },
        { date: 27, status: 'no-class' },
        { date: 28, status: 'future' },
        { date: 29, status: 'future' },
        { date: 30, status: 'future' },
        { date: 31, status: 'future' },
    ];

    return (
        <div className="bg-card-light dark:bg-card-dark p-4 sm:p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
            <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map((day) => (
                    <p key={day} className="text-text-light-secondary dark:text-text-dark-secondary text-sm font-bold pb-4">
                        {day}
                    </p>
                ))}

                {/* Empty days before the 1st */}
                <div className="col-start-3"></div>

                {calendarData.map((day) => (
                    <CalendarDay key={day.date} {...day} />
                ))}
            </div>
        </div>
    );
};

export default CalendarGrid;
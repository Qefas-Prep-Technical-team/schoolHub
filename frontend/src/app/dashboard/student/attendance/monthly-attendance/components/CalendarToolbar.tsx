// src/components/Calendar/CalendarToolbar.tsx
import React from 'react';
import Button from './ui/Button';

const CalendarToolbar: React.FC = () => {
    return (
        <div className="flex items-center gap-2 bg-card-light dark:bg-card-dark p-1 rounded-lg border border-border-light dark:border-border-dark">
            <Button variant="ghost" size="sm" icon="chevron_left">
                {/* Empty children for icon-only button */}
            </Button>
            <Button variant="ghost" size="sm" icon="calendar_today">
                October 2024
            </Button>
            <Button variant="ghost" size="sm" icon="chevron_right">
                {/* Empty children for icon-only button */}
            </Button>
        </div>
    );
};

export default CalendarToolbar;
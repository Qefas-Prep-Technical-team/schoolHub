// src/components/Header/Header.tsx
import React from 'react';
import CalendarToolbar from './CalendarToolbar';

const Header: React.FC = () => {
    return (
        <header className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h1 className="text-4xl font-black tracking-tighter">Monthly Attendance</h1>
            <CalendarToolbar />
        </header>
    );
};

export default Header;
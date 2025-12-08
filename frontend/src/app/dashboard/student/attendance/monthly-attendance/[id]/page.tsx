// src/app/page.tsx
import React from 'react';
import Header from '../components/Header';
import CalendarGrid from '../components/CalendarGrid';
import Legend from "../components/Legend"


export default function Home() {
    return (
        <div className="flex min-h-screen w-full">
            <main className="flex-1 p-6 lg:p-10">
                <div className="max-w-7xl mx-auto">
                    <Header />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <CalendarGrid />
                        </div>
                        <div className="lg:col-span-1">
                            <Legend />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
// src/app/page.tsx
import React from 'react';
import PageHeader from '../components/PageHeader';
import ClassBreakdown from '../components/ClassBreakdown';
import AbsenceDetails from '../components/AbsenceDetails';

export default function Home() {
    return (
        <div className="relative flex min-h-screen w-full">
            <main className="flex-1 p-6 lg:p-10">
                <div className="mx-auto max-w-4xl">
                    <PageHeader />

                    <div className="flex flex-col gap-6">
                        <ClassBreakdown />
                        <AbsenceDetails />
                    </div>
                </div>
            </main>
        </div>
    );
}
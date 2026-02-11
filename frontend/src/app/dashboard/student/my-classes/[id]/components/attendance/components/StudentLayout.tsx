'use client';

import { ReactNode } from 'react';
import StudentHeader from './StudentHeader';

interface StudentLayoutProps {
    children: ReactNode;
    user: {
        name: string;
        avatarUrl: string;
        studentId?: string;
    };
}

export default function StudentLayout({ children, user }: StudentLayoutProps) {
    return (
        <div className="flex flex-1 py-5">
            <div className="layout-content-container flex flex-col w-full flex-1">

                <main className="flex flex-col gap-6 p-4 md:p-8 w-full">
                    {children}
                </main>
            </div>
        </div>

    );
}

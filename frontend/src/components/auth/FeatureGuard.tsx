'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTeacherProfile } from '@/lib/api/hooks/useTeacher';

interface FeatureGuardProps {
    role?: string;
    children: ReactNode;
}

export default function FeatureGuard({ role, children }: FeatureGuardProps) {
    const router = useRouter();
    const { data: profile, isLoading } = useTeacherProfile();

    useEffect(() => {
        if (role === 'teacher' && !isLoading) {
            const hasSchool = !!(profile?.activeSchoolId || profile?.primarySchoolId);
            if (!hasSchool) {
                router.replace('/unauthorized');
            }
        }
    }, [isLoading, profile, role, router]);

    // While profile is loading, show a full-screen skeleton
    if (role === 'teacher' && isLoading) {
        return (
            <div className="flex flex-col gap-4 p-6 animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
                <div className="grid grid-cols-3 gap-4 mt-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

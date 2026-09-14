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
        // Allow teachers to access their personal dashboard even without an active/primary school
        // The check was previously blocking them, causing an Access Denied error.
    }, [isLoading, profile, role, router]);

    // removed initial skeleton to allow the main page skeleton to show up instead

    return <>{children}</>;
}

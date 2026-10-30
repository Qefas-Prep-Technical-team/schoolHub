'use client';

import React, { ReactNode, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useGlobalFeatures } from '@/lib/api/hooks/useGlobalFeatures';
import { usePublicPlatformSettings } from '@/lib/api/hooks/usePlatformGovernance';
import { 
  TEACHER_PAGES_MANIFEST, 
  STUDENT_PAGES_MANIFEST, 
  PARENT_PAGES_MANIFEST 
} from '@/app/(internal-console)/console/features/components/rolePagesManifest';
import { ADMIN_PAGES_MANIFEST } from '@/app/(internal-console)/console/features/components/adminPagesManifest';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureGuardProps {
    role?: 'teacher' | 'student' | 'parent' | 'admin' | string;
    children: ReactNode;
}

export default function FeatureGuard({ role, children }: FeatureGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const normalizedRole = (role || '').toLowerCase() as 'teacher' | 'student' | 'parent' | 'admin';

    // Fetch dynamic role features
    const { data: dynamicFeatures, isLoading: isFeaturesLoading } = useGlobalFeatures(
        ['teacher', 'student', 'parent', 'admin'].includes(normalizedRole) ? normalizedRole : 'teacher'
    );

    // Fetch platform settings for fallback visibility maps
    const { data: platformSettings, isLoading: isSettingsLoading } = usePublicPlatformSettings();

    // Find the featureKey corresponding to the current pathname
    const currentFeature = useMemo(() => {
        if (!pathname) return null;

        let manifestList: readonly { featureKey: string; href: string; label: string }[] = [];
        if (normalizedRole === 'teacher') manifestList = TEACHER_PAGES_MANIFEST;
        else if (normalizedRole === 'student') manifestList = STUDENT_PAGES_MANIFEST;
        else if (normalizedRole === 'parent') manifestList = PARENT_PAGES_MANIFEST;
        else if (normalizedRole === 'admin') manifestList = ADMIN_PAGES_MANIFEST;

        // Match exact or startsWith if sub-route (e.g. /dashboard/teacher/assignments/create)
        return manifestList.find(item => {
            if (pathname === item.href) return true;
            if (item.href !== `/dashboard/${normalizedRole}` && pathname.startsWith(`${item.href}/`)) return true;
            return false;
        });
    }, [pathname, normalizedRole]);

    // Check if the current feature is disabled
    const isFeatureDisabled = useMemo(() => {
        if (!currentFeature) return false;
        const key = currentFeature.featureKey;

        // 1. Check dynamic features map first
        if (dynamicFeatures && dynamicFeatures[key] !== undefined) {
            return dynamicFeatures[key] === false;
        }

        // 2. Check platformSettings JSON fallback
        const settingKey = `${normalizedRole}_pages_visibility`;
        const rawSetting = platformSettings ? (platformSettings as Record<string, unknown>)[settingKey] : undefined;
        if (typeof rawSetting === 'string') {
            try {
                const parsed = JSON.parse(rawSetting);
                if (parsed[key] !== undefined) {
                    return parsed[key] === false;
                }
            } catch {
                // Ignore parse error
            }
        }

        return false;
    }, [currentFeature, dynamicFeatures, platformSettings, normalizedRole]);

    // If disabled, render access restricted UI
    if (isFeatureDisabled && currentFeature) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in duration-300">
                <div className="size-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-6 shadow-xl shadow-rose-500/10">
                    <ShieldAlert size={36} />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {currentFeature.label} Unavailable
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mt-2 text-sm leading-relaxed">
                    This section has been temporarily disabled or is not accessible for this account by platform administration.
                </p>
                <div className="mt-8 flex items-center gap-4">
                    <Button 
                        onClick={() => router.push(`/dashboard/${normalizedRole}`)}
                        className="rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-black text-xs uppercase tracking-wider px-6 py-6 shadow-lg gap-2"
                    >
                        <ArrowLeft size={16} /> Return to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

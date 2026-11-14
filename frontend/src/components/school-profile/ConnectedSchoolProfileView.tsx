'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Building2, ArrowRight, ShieldAlert } from 'lucide-react';
import {
  useSchoolProfile,
  useSchoolSettings,
  useSchoolStats,
} from '@/lib/api/hooks/useSchool';
import SchoolProfileHero, {
  SchoolProfileData,
} from '@/app/dashboard/admin/school-profile/components/SchoolProfileHero';
import SchoolProfileOverviewColumn from '@/app/dashboard/admin/school-profile/components/SchoolProfileOverviewColumn';
import SchoolProfileAcademicColumn from '@/app/dashboard/admin/school-profile/components/SchoolProfileAcademicColumn';
import SchoolProfileSidebar from '@/app/dashboard/admin/school-profile/components/SchoolProfileSidebar';
import SchoolProfileLoading from '@/app/dashboard/admin/school-profile/loading';
import TeacherAssignedSubjectsCard from './TeacherAssignedSubjectsCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ConnectedSchoolProfileRole = 'teacher' | 'student' | 'parent';

export interface ConnectedSchoolProfileViewProps {
  schoolId?: string | null;
  isContextLoading?: boolean;
  role: ConnectedSchoolProfileRole;
  contextBanner?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
}

const ROLE_STYLES: Record<
  ConnectedSchoolProfileRole,
  {
    accentColor: string;
    iconBg: string;
    buttonBg: string;
  }
> = {
  teacher: {
    accentColor: '#059669',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-800/60',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  student: {
    accentColor: '#ec4899',
    iconBg: 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border-pink-200/70 dark:border-pink-800/60',
    buttonBg: 'bg-pink-600 hover:bg-pink-700 text-white',
  },
  parent: {
    accentColor: '#f97316',
    iconBg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200/70 dark:border-orange-800/60',
    buttonBg: 'bg-orange-600 hover:bg-orange-700 text-white',
  },
};

export default function ConnectedSchoolProfileView({
  schoolId,
  isContextLoading = false,
  role,
  contextBanner,
  emptyTitle = 'No Connected School Found',
  emptyDescription = 'Connect to a school to view its official institutional profile, leadership, academic levels, and grading system.',
  emptyActionHref,
  emptyActionLabel = 'Go to Linking Hub',
}: ConnectedSchoolProfileViewProps) {
  const effectiveSchoolId =
    schoolId && schoolId !== 'personal' && schoolId !== 'default-tenant-id'
      ? schoolId
      : '';

  const {
    data: rawSchool,
    isLoading: isLoadingProfile,
    isError: isProfileError,
  } = useSchoolProfile(effectiveSchoolId);
  const {
    data: rawSettings,
    isLoading: isLoadingSettings,
  } = useSchoolSettings(effectiveSchoolId);
  const { data: stats } = useSchoolStats(effectiveSchoolId);

  const school = (rawSchool || null) as SchoolProfileData | null;
  const settings = (rawSettings || null) as
    | { primaryColor?: string; verified?: boolean }
    | null;

  const roleStyle = ROLE_STYLES[role];

  const primaryColor = useMemo(() => {
    const schoolWithColor = school as (SchoolProfileData & { primaryColor?: string }) | null;
    return settings?.primaryColor || schoolWithColor?.primaryColor || roleStyle.accentColor;
  }, [settings?.primaryColor, school, roleStyle.accentColor]);

  const parsedSocialLinks = useMemo<Record<string, string> | null>(() => {
    if (!school?.socialLinks) return null;
    if (typeof school.socialLinks === 'string') {
      try {
        const parsed: unknown = JSON.parse(school.socialLinks);
        return parsed && typeof parsed === 'object'
          ? (parsed as Record<string, string>)
          : null;
      } catch {
        return null;
      }
    }
    return typeof school.socialLinks === 'object'
      ? (school.socialLinks as Record<string, string>)
      : null;
  }, [school?.socialLinks]);

  const isVerified = useMemo(() => {
    const schoolWithFlags = school as (SchoolProfileData & { verified?: boolean }) | null;
    return Boolean(
      schoolWithFlags?.verified ||
        settings?.verified ||
        (school?.admins && school.admins.some((a) => a.admin?.verified)),
    );
  }, [school, settings?.verified]);

  if (
    isContextLoading ||
    (!!effectiveSchoolId && (isLoadingProfile || isLoadingSettings))
  ) {
    return (
      <div className="space-y-4">
        {contextBanner && (
          <div className="w-[95%] max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 pt-2">
            {contextBanner}
          </div>
        )}
        <SchoolProfileLoading />
      </div>
    );
  }

  if (!effectiveSchoolId) {
    return (
      <div className="min-h-[70vh] w-[95%] max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
        {contextBanner}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[340px]">
          <div
            className={cn(
              'size-16 rounded-2xl border flex items-center justify-center mb-5 shadow-xs',
              roleStyle.iconBg,
            )}
          >
            <Building2 size={30} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {emptyTitle}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
            {emptyDescription}
          </p>
          {emptyActionHref && (
            <Button
              asChild
              className={cn('mt-6 h-10 px-5 rounded-xl font-semibold text-xs', roleStyle.buttonBg)}
            >
              <Link href={emptyActionHref}>
                <span>{emptyActionLabel}</span>
                <ArrowRight size={14} className="ml-2" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (isProfileError || !school) {
    return (
      <div className="min-h-[70vh] w-[95%] max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
        {contextBanner}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[320px]">
          <div className="size-16 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50 text-rose-500 flex items-center justify-center mb-5">
            <ShieldAlert size={30} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Unable to Load School Profile
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
            We could not retrieve details for the selected institution right now, or your active connection may have changed.
          </p>
          {emptyActionHref && (
            <Button
              asChild
              variant="outline"
              className="mt-6 h-10 px-5 rounded-xl font-semibold text-xs"
            >
              <Link href={emptyActionHref}>{emptyActionLabel}</Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-20 animate-in fade-in duration-300">
      {contextBanner && (
        <div className="w-[95%] max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 pt-2">
          {contextBanner}
        </div>
      )}

      <SchoolProfileHero
        school={school}
        stats={stats || null}
        primaryColor={primaryColor}
        canEditProfile={false}
        isEditingProfile={false}
        onEditProfile={() => {}}
      />

      <main className="w-[95%] max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {role === 'teacher' && effectiveSchoolId && (
            <TeacherAssignedSubjectsCard
              schoolId={effectiveSchoolId}
              primaryColor={primaryColor}
            />
          )}
          <SchoolProfileOverviewColumn
            school={school}
            primaryColor={primaryColor}
            socialLinks={parsedSocialLinks}
          />
          <SchoolProfileAcademicColumn school={school} />
        </div>

        <SchoolProfileSidebar
          school={school}
          stats={stats || null}
          primaryColor={primaryColor}
          isVerified={isVerified}
          socialLinks={parsedSocialLinks}
        />
      </main>
    </div>
  );
}


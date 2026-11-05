'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import {
  useSchoolProfile,
  useSchoolStats,
  useSchoolSettings,
} from '@/lib/api/hooks/useSchool';
import {
  AdminRole,
  canAdminRoleAccessFeature,
} from '../components/adminFeatureFlags';
import SchoolProfileLoading from './loading';
import SchoolProfileHero, {
  SchoolProfileData,
  SchoolProfileAdminRecord,
} from './components/SchoolProfileHero';
import SchoolProfileOverviewColumn from './components/SchoolProfileOverviewColumn';
import SchoolProfileAcademicColumn from './components/SchoolProfileAcademicColumn';
import SchoolProfileSidebar from './components/SchoolProfileSidebar';

export default function SchoolProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const adminRole = (user?.adminRole || user?.role) as AdminRole | undefined;
  const canEditProfile = canAdminRoleAccessFeature(adminRole, 'schoolProfile');

  const {
    data: rawSchool,
    isLoading: schoolLoading,
    isError: schoolError,
    refetch,
  } = useSchoolProfile(schoolId);
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useSchoolStats(schoolId);
  const { data: settings } = useSchoolSettings(schoolId);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const school = rawSchool as SchoolProfileData | null | undefined;
  const primaryColor = settings?.themeColor || '#2563eb';
  const isVerified =
    school?.admins?.some((sa: SchoolProfileAdminRecord) => sa.admin?.verified) ??
    false;

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    router.push('/dashboard/admin/school-profile/edit');
  };

  const socialLinks = useMemo<Record<string, string> | null>(() => {
    if (!school?.socialLinks) return null;
    try {
      return typeof school.socialLinks === 'string'
        ? (JSON.parse(school.socialLinks) as Record<string, string>)
        : school.socialLinks;
    } catch {
      return null;
    }
  }, [school?.socialLinks]);

  if (schoolLoading || statsLoading) {
    return <SchoolProfileLoading />;
  }

  if (schoolError || statsError) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          <div className="size-16 rounded-2xl bg-rose-50 dark:bg-rose-900/10 flex items-center justify-center mx-auto text-rose-500 mb-2">
            <Info size={32} />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Profile Sync Failed
          </h2>
          <p className="text-sm text-slate-500">
            We couldn&apos;t retrieve your institutional data. Please check your
            connection.
          </p>
          <Button
            onClick={() => refetch()}
            className="w-full mt-4 h-12 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: primaryColor }}
          >
            Retry Synchronization
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-20">
      <SchoolProfileHero
        school={school}
        stats={stats}
        primaryColor={primaryColor}
        canEditProfile={canEditProfile}
        isEditingProfile={isEditingProfile}
        onEditProfile={handleEditProfile}
      />

      <main className="w-[95%] max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SchoolProfileOverviewColumn
            school={school}
            primaryColor={primaryColor}
            socialLinks={socialLinks}
          />
          <SchoolProfileAcademicColumn school={school} />
        </div>

        <SchoolProfileSidebar
          school={school}
          stats={stats}
          primaryColor={primaryColor}
          isVerified={isVerified}
          socialLinks={socialLinks}
        />
      </main>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Info, ChevronLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import {
  useSchoolProfile,
  useUpdateSchoolProfile,
} from '@/lib/api/hooks/useSchool';
import PreviewPanel from './components/PreviewPanel';
import FormActionBar from './components/FormActionBar';
import EditIdentityConnectivitySection, {
  EditableSchoolFormState,
} from './components/EditIdentityConnectivitySection';
import EditGovernanceAcademicSection from './components/EditGovernanceAcademicSection';

export default function EditSchoolProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';

  const { data: school, isLoading } = useSchoolProfile(schoolId);
  const updateMutation = useUpdateSchoolProfile();

  const [schoolData, setSchoolData] = useState<EditableSchoolFormState | null>(
    null,
  );
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (school) {
      setSchoolData({
        id: school.id,
        name: school.name || '',
        motto: school.motto || '',
        description: school.description || '',
        logo: school.logo || '',
        bannerImage: school.bannerImage || '',
        favicon: school.favicon || '',
        schoolEmail: school.schoolEmail || '',
        phone: school.phone || '',
        website: school.website || '',
        address: school.address || '',
        foundedYear: school.foundedYear || new Date().getFullYear(),
        principal: school.principal || '',
        schoolType: school.schoolType || 'Private',
        socialLinks:
          typeof school.socialLinks === 'string'
            ? JSON.parse(school.socialLinks)
            : school.socialLinks || {
                facebook: '',
                twitter: '',
                instagram: '',
                linkedin: '',
                youtube: '',
              },
        operatingHours:
          school.operatingHours || 'Mon - Fri: 8:00 AM - 4:00 PM',
        mapLocation: school.mapLocation || '',
        levels: school.levels || [],
        gradingSystem: school.gradingSystem || [],
      });
    }
  }, [school]);

  const handleChange = (field: string, value: unknown) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSchoolData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof EditableSchoolFormState] as Record<
              string,
              unknown
            >),
            [child]: value,
          },
        };
      });
    } else {
      setSchoolData((prev) => (prev ? { ...prev, [field]: value } : prev));
    }
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!schoolData) return;
    try {
      const sanitizedGrading = Array.isArray(schoolData.gradingSystem)
        ? schoolData.gradingSystem
            .filter(
              (t) =>
                t && (t.grade || t.min !== undefined || t.max !== undefined),
            )
            .map((t) => {
              const val1 = Number(t.min ?? 0);
              const val2 = Number(t.max ?? 0);
              return {
                grade: String(t.grade || '')
                  .trim()
                  .toUpperCase(),
                min: Math.min(val1, val2),
                max: Math.max(val1, val2),
              };
            })
        : schoolData.gradingSystem;

      await updateMutation.mutateAsync({
        schoolId,
        data: {
          ...schoolData,
          gradingSystem: sanitizedGrading,
          profileCompleted: true,
        },
      });
      toast.success('Institutional profile updated successfully');
      setHasChanges(false);
      router.push('/dashboard/admin/school-profile');
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to save changes');
    }
  };

  if (isLoading || !schoolData) {
    return (
      <div className="p-8 space-y-6 animate-pulse bg-transparent">
        <div className="h-10 w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-96 w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl" />
            <div className="h-96 w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl" />
          </div>
          <div className="h-[500px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-6 lg:p-8 pb-24">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Minimal Header */}
        <header className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => router.push('/dashboard/admin/school-profile')}
            className="w-fit flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2"
          >
            <ChevronLeft size={16} /> Back to Profile
          </button>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <CheckCircle2 size={14} /> School Configuration
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Edit Profile
          </h1>
          <p className="text-sm text-slate-500 font-medium max-w-md">
            Manage your school&apos;s digital identity and public-facing
            metadata.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Editing Area (Stacked Cards) */}
          <div className="lg:col-span-2 space-y-6">
            <EditIdentityConnectivitySection
              schoolData={schoolData}
              schoolId={schoolId}
              onChange={handleChange}
            />
            <EditGovernanceAcademicSection
              schoolData={schoolData}
              onChange={handleChange}
            />
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                <Info size={120} />
              </div>
              <h3 className="text-base font-semibold mb-2 relative z-10 flex items-center gap-2 text-slate-800 dark:text-white">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                Live Synchronization
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed relative z-10 font-medium">
                Witness real-time updates as you refine your institution&apos;s
                identity. Changes are only permanent once published.
              </p>
            </div>

            <PreviewPanel schoolData={schoolData} />
          </div>
        </div>

        <FormActionBar
          onSave={handleSave}
          onReset={() => router.push('/dashboard/admin/school-profile')}
          isSaving={updateMutation.isPending}
          hasChanges={hasChanges}
          variant="floating"
        />
      </div>
    </div>
  );
}

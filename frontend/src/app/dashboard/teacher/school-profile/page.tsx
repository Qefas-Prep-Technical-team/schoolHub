'use client';

import React, { useMemo } from 'react';
import { School } from 'lucide-react';
import {
  useTeacherLinkedSchools,
  useTeacherProfile,
} from '@/lib/api/hooks/useTeacher';
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import ConnectedSchoolProfileView from '@/components/school-profile/ConnectedSchoolProfileView';
import { cn } from '@/lib/utils';

interface LinkedSchoolItem {
  id: string;
  name: string;
  logo?: string;
  schoolCode?: string;
}

interface TeacherProfileFallback {
  school?: { id?: string; name?: string };
  currentSchool?: { id?: string; name?: string };
}

export default function TeacherSchoolProfilePage() {
  const { user } = useAuthStore();
  const { selectedSchoolId, setSelectedSchoolId } = useDashboardStore();
  const { data: linkedSchoolsRaw, isLoading: isLoadingSchools } =
    useTeacherLinkedSchools();
  const { data: rawTeacherProfile, isLoading: isLoadingTeacher } =
    useTeacherProfile();

  const linkedSchools = useMemo<LinkedSchoolItem[]>(() => {
    return Array.isArray(linkedSchoolsRaw)
      ? (linkedSchoolsRaw as LinkedSchoolItem[])
      : [];
  }, [linkedSchoolsRaw]);

  const teacherProfile = rawTeacherProfile as
    | TeacherProfileFallback
    | undefined;

  const isPersonalMode =
    selectedSchoolId === 'personal' ||
    (!!user?.id && selectedSchoolId === user.id);

  const activeSchoolId = useMemo<string | null>(() => {
    if (isPersonalMode) {
      return null;
    }

    if (selectedSchoolId) {
      if (
        linkedSchools.length === 0 ||
        linkedSchools.some((s) => s.id === selectedSchoolId)
      ) {
        return selectedSchoolId;
      }
      return linkedSchools[0].id;
    }

    if (linkedSchools.length > 0) {
      return linkedSchools[0].id;
    }

    return (
      teacherProfile?.school?.id ||
      teacherProfile?.currentSchool?.id ||
      null
    );
  }, [
    isPersonalMode,
    selectedSchoolId,
    linkedSchools,
    teacherProfile?.school?.id,
    teacherProfile?.currentSchool?.id,
  ]);

  const contextBanner =
    linkedSchools.length > 0 ? (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <School size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="uppercase tracking-wider text-[10px] font-black text-slate-400">
            Selected School:
          </span>
          <span className="font-bold text-slate-900 dark:text-white">
            {isPersonalMode
              ? 'Personal Dashboard (Independent Mode)'
              : linkedSchools.find((s) => s.id === activeSchoolId)?.name ||
                'Connected School'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {linkedSchools.map((s) => {
            const isSelected = !isPersonalMode && activeSchoolId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSchoolId(s.id, s.name)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95',
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700',
                )}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>
    ) : null;

  return (
    <ConnectedSchoolProfileView
      role="teacher"
      schoolId={activeSchoolId}
      isContextLoading={isLoadingSchools || (!activeSchoolId && isLoadingTeacher)}
      contextBanner={contextBanner}
      emptyTitle={
        isPersonalMode && linkedSchools.length > 0
          ? 'Personal Dashboard Active'
          : 'No Connected School Found'
      }
      emptyDescription={
        isPersonalMode && linkedSchools.length > 0
          ? 'You are currently viewing your Personal Dashboard. Select one of your connected schools above or in the header switcher to view its official institutional profile.'
          : 'You are currently operating independently. Link your account with an institution in the Linking Hub to view its profile, leadership, and grading configuration.'
      }
      emptyActionHref="/dashboard/teacher/linking"
      emptyActionLabel="Go to Linking Hub"
    />
  );
}

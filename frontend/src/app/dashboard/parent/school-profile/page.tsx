'use client';

import React, { useEffect, useMemo } from 'react';
import { GraduationCap } from 'lucide-react';
import {
  useParentChildren,
  useChildDetails,
} from '@/lib/api/hooks/useParentChildren';
import { useParentStore } from '@/lib/api/hooks/useParentStore';
import ConnectedSchoolProfileView from '@/components/school-profile/ConnectedSchoolProfileView';
import { cn } from '@/lib/utils';

export default function ParentSchoolProfilePage() {
  const { data: children = [], isLoading: isLoadingChildren } =
    useParentChildren();
  const { selectedChildId, setSelectedChildId } = useParentStore();

  const effectiveChildId = useMemo(() => {
    if (selectedChildId && children.some((c) => c.id === selectedChildId)) {
      return selectedChildId;
    }
    return children[0]?.id || null;
  }, [children, selectedChildId]);

  useEffect(() => {
    if (effectiveChildId && effectiveChildId !== selectedChildId) {
      setSelectedChildId(effectiveChildId);
    }
  }, [effectiveChildId, selectedChildId, setSelectedChildId]);

  const { data: childDetails, isLoading: isLoadingChildDetails } =
    useChildDetails(effectiveChildId);

  const selectedChild = useMemo(
    () => children.find((c) => c.id === effectiveChildId) || null,
    [children, effectiveChildId],
  );

  const childSchoolId = useMemo<string | null>(() => {
    if (selectedChild?.school?.id) return selectedChild.school.id;
    if (childDetails?.school?.id) return childDetails.school.id;
    const detailsWithSchoolId = childDetails as
      | { schoolId?: string }
      | null
      | undefined;
    return detailsWithSchoolId?.schoolId || null;
  }, [selectedChild?.school?.id, childDetails]);

  const contextBanner = selectedChild ? (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
          <GraduationCap size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">
            Selected Student
          </p>
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
            {selectedChild.name}
            {selectedChild.currentClass?.name
              ? ` • ${selectedChild.currentClass.name}${
                  selectedChild.currentClass.section
                    ? ` ${selectedChild.currentClass.section}`
                    : ''
                }`
              : ''}
            {selectedChild.studentCode ? ` (${selectedChild.studentCode})` : ''}
          </p>
        </div>
      </div>

      {children.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {children.map((c) => {
            const isSelected = effectiveChildId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedChildId(c.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95',
                  isSelected
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700',
                )}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  ) : null;

  const emptyTitle =
    children.length === 0
      ? 'No Linked Children Found'
      : `${selectedChild?.name || 'Selected Student'} Is Not Connected to a School`;

  const emptyDescription =
    children.length === 0
      ? 'Link a student account in My Children to view your child’s connected school profile, leadership, and grading configuration.'
      : `${
          selectedChild?.name || 'This student'
        } is currently not linked to any institution. Once connected to a school, its official profile will appear here.`;

  const emptyActionHref = '/dashboard/parent/my-children';
  const emptyActionLabel = 'Go to My Children';

  return (
    <ConnectedSchoolProfileView
      role="parent"
      schoolId={childSchoolId}
      isContextLoading={
        isLoadingChildren || (!!effectiveChildId && !childSchoolId && isLoadingChildDetails)
      }
      contextBanner={contextBanner}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyActionHref={emptyActionHref}
      emptyActionLabel={emptyActionLabel}
    />
  );
}

'use client';

import { ClassData } from './types';
import ClassCard from './ClassCard';
import EmptyState from './EmptyState';

interface ClassGridProps {
  classes: ClassData[];
  onViewClass?: (id: string) => void;
  onEditClass?: (id: string) => void;
  onDeleteClass?: (id: string) => void;
  onCreateClass?: () => void;
  isLoading?: boolean;
}

export default function ClassGrid({
  classes,
  onViewClass,
  onEditClass,
  onDeleteClass,
  onCreateClass,
  isLoading = false,
}: ClassGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm h-[335px] flex flex-col animate-pulse">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                <div className="h-5 w-24 bg-slate-100 dark:bg-slate-800 rounded-md" />
              </div>
              <div className="flex gap-2">
                <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800" />
                <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
            <div className="flex-1">
              <div className="h-6 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-md mb-2" />
              <div className="h-3 w-1/4 bg-slate-100 dark:bg-slate-800 rounded-md mb-6" />
              <div className="h-[76px] rounded-2xl bg-slate-50 dark:bg-slate-800/50 mb-6 flex items-center p-3 gap-3">
                 <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                 <div className="space-y-2 flex-1">
                    <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-700 rounded-md" />
                    <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded-md" />
                 </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
               <div className="flex justify-between">
                  <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                  <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg" />
               </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <EmptyState
        onAction={onCreateClass}
        showAction={!!onCreateClass}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {classes.map((classItem, idx) => (
        <ClassCard
          key={classItem.id || idx}
          classData={classItem}
          onView={onViewClass}
          onEdit={onEditClass}
          onDelete={onDeleteClass}
        />
      ))}
    </div>
  );
}


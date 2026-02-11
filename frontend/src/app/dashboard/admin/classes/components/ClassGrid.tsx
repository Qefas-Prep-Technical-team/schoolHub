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
          <div
            key={i}
            className="rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse h-[200px]"
          />
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
      {classes.map((classItem) => (
        <ClassCard
          key={classItem.id}
          classData={classItem}
          onView={onViewClass}
          onEdit={onEditClass}
          onDelete={onDeleteClass}
        />
      ))}
    </div>
  );
}
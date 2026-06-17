import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const TableSkeletonRow: React.FC = () => {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-800/50">
      {/* Number */}
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-6" />
      </td>
      {/* Student */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </td>
      
      {/* Assessment */}
      <td className="px-6 py-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </td>

      {/* Score */}
      <td className="px-6 py-4 text-center">
        <div className="flex flex-col items-center gap-1.5">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-2 w-10" />
        </div>
      </td>

      {/* Percentage */}
      <td className="px-6 py-4 text-center">
        <div className="flex justify-center">
          <Skeleton className="h-8 w-12 rounded-lg" />
        </div>
      </td>

      {/* Grade */}
      <td className="px-6 py-4 text-center">
        <div className="flex justify-center">
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4 text-center">
        <div className="flex justify-center">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </td>
    </tr>
  );
};

export const TableSkeletonBody: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableSkeletonRow key={i} />
      ))}
    </>
  );
};

export default TableSkeletonRow;

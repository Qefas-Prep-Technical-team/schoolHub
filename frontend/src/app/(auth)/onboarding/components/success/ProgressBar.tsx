'use client';
import React from 'react';

export default function ProgressBar({ step, total }: { step: number; total: number }) {
  const percentage = (step / total) * 100;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-normal">
          Step {step} of {total}
        </p>
      </div>
      <div className="rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

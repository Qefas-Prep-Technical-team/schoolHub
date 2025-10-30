'use client';
import React from 'react';

export default function LogoTitle() {
  return (
    <div className="mb-6 flex flex-col items-center justify-center text-center">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
          <span className="material-symbols-outlined text-2xl">school</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">SchoolHub</h2>
      </div>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Account Setup</p>
    </div>
  );
}

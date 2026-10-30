'use client';

import React from 'react';

/* ─── Design tokens — Student = Rose ─── */
export const ROSE = '#be123c'; // rose-700
export const ROSE_DARK = '#881337'; // rose-900
export const ROSE_LITE = '#ffe4e6'; // rose-100
export const ROSE_MID = '#e11d48'; // rose-600

export function inputCls(hasError: boolean) {
  return [
    'w-full h-11 px-4 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500',
    'bg-slate-50 dark:bg-slate-800 outline-none border transition-all',
    hasError
      ? 'border-red-400 dark:border-red-500 ring-1 ring-red-300 dark:ring-red-800'
      : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500/50',
  ].join(' ');
}

export function Field({
  label,
  icon,
  error,
  children,
}: {
  label: React.ReactNode;
  icon: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[15px]">{icon}</span>
        {label}
      </label>
      {children}
      {error && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

export function EyeBtn({ show, toggle }: { show: boolean; toggle: () => void }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={toggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
    >
      <span className="material-symbols-outlined text-[18px]">
        {show ? 'visibility_off' : 'visibility'}
      </span>
    </button>
  );
}

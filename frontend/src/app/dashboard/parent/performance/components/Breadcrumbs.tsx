"use client";

import Link from 'next/link';
import { ChevronRight, Home, Activity } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export default function Breadcrumbs({
  items = [
    { label: 'Parent Portal', href: '/dashboard/parent' },
    { label: 'Academic Performance', href: '#' },
  ],
}: BreadcrumbsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
      <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Link
          href="/dashboard/parent"
          className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors p-1 -ml-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Parent Dashboard"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Portal</span>
        </Link>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <div key={index} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors truncate max-w-[150px] sm:max-w-none"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-900 dark:text-white font-bold truncate max-w-[180px] sm:max-w-none">
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Real-time Indicator Pill */}
      <div className="hidden sm:inline-flex items-center gap-1.5 self-start sm:self-auto px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-900/40 text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 shadow-xs">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
        </span>
        <Activity className="w-3 h-3" />
        <span>Live Performance Telemetry</span>
      </div>
    </div>
  );
}

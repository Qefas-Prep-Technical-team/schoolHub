'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home, FileSpreadsheet } from 'lucide-react';
import OfflineGradesDashboard from './components/OfflineGradesDashboard';

export default function OfflineGradesPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 p-3.5 sm:p-6 lg:p-8 w-full sm:w-[95%] mx-auto">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
        <ol className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-wrap">
          <li className="flex items-center gap-1.5">
            <Link
              href="/dashboard/admin"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1"
            >
              <Home size={13} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <ChevronRight size={13} className="text-slate-400" />
          </li>
          <li>
            <span className="text-slate-500 dark:text-slate-400">Academics</span>
          </li>
          <li>
            <ChevronRight size={13} className="text-slate-400" />
          </li>
          <li className="text-slate-900 dark:text-white font-bold flex items-center gap-1">
            <FileSpreadsheet size={13} className="text-indigo-600 dark:text-indigo-400" />
            <span>Offline Grades</span>
          </li>
        </ol>
      </nav>

      {/* Main Dashboard Workspace */}
      <main>
        <OfflineGradesDashboard />
      </main>
    </div>
  );
}

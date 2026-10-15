'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, BookOpen, User } from 'lucide-react';

export interface ClassItem {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  room: string;
  progress: number;
  assignmentsDue: number;
  nextSession: string;
  days: string[];
  description: string;
  color: string;
}

interface ClassTableProps {
  isLoading: boolean;
  filteredClasses: ClassItem[];
}

export function ClassTable({ isLoading, filteredClasses }: ClassTableProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-zinc-950/80 rounded-3xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-slate-100 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 font-semibold bg-slate-50/50 dark:bg-zinc-900/40">
              <tr>
                <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Class Name</th>
                <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Subject</th>
                <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Teacher</th>
                <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Schedule</th>
                <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {[1, 2, 3].map((i) => (
                <tr key={i}>
                  <td className="px-5 py-4"><Skeleton className="h-5 w-36 rounded-lg" /></td>
                  <td className="px-5 py-4"><Skeleton className="h-5 w-24 rounded-lg" /></td>
                  <td className="px-5 py-4"><Skeleton className="h-5 w-32 rounded-lg" /></td>
                  <td className="px-5 py-4"><Skeleton className="h-5 w-24 rounded-lg" /></td>
                  <td className="px-5 py-4 text-right"><Skeleton className="h-9 w-28 ml-auto rounded-xl" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-zinc-950/80 rounded-3xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="border-b border-slate-100 dark:border-zinc-800 text-slate-400 dark:text-zinc-400 font-bold bg-slate-50/60 dark:bg-zinc-900/40">
            <tr>
              <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Class Cohort</th>
              <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Subject Area</th>
              <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Teacher</th>
              <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Schedule</th>
              <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
            {filteredClasses.map((cls) => (
              <tr 
                key={cls.id} 
                className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
                      style={{ backgroundColor: cls.color || '#ec4899' }}
                    >
                      {cls.title.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white block">
                        {cls.title}
                      </span>
                      {cls.room && (
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
                          {cls.room}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-500/20">
                    <BookOpen className="w-3 h-3" />
                    {cls.subject}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-600 dark:text-zinc-300">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-xs sm:text-sm">{cls.teacher}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs font-medium text-slate-500 dark:text-zinc-400">
                  {cls.days.join(', ')}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link href={`/dashboard/student/my-classes/${cls.id}`}>
                    <Button className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-0 h-9 rounded-xl transition-all shadow-sm">
                      View Details
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

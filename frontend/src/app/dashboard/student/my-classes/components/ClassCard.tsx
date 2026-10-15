'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, User, Calendar, ArrowRight, MapPin } from 'lucide-react';
import { ClassItem } from './ClassTable';

interface ClassCardProps {
  cls: ClassItem;
}

export function ClassCard({ cls }: ClassCardProps) {
  const subjects = cls.description ? cls.description.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="bg-white dark:bg-zinc-950/80 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-pink-500/30 dark:hover:border-pink-500/30">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-sm"
            style={{ backgroundColor: cls.color || '#ec4899' }}
          >
            <BookOpen className="w-3 h-3" />
            {cls.subject}
          </span>
          {cls.room && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-900 px-2.5 py-0.5 rounded-lg">
              <MapPin className="w-3 h-3" />
              {cls.room}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors mb-2">
          {cls.title}
        </h3>

        {/* Teacher */}
        <div className="flex items-center gap-2.5 mb-4 text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-slate-500 dark:text-zinc-400">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium truncate">{cls.teacher}</span>
        </div>

        {/* Subject Curriculum Tags */}
        {subjects.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider mb-2">Curriculum Modules</p>
            <div className="flex flex-wrap gap-1.5">
              {subjects.slice(0, 4).map((sub, i) => (
                <span 
                  key={i}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border border-slate-200/50 dark:border-zinc-800"
                >
                  {sub}
                </span>
              ))}
              {subjects.length > 4 && (
                <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400 px-1.5 py-0.5">
                  +{subjects.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 mt-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500">
          <Calendar className="w-3.5 h-3.5 text-pink-500 shrink-0" />
          <span className="font-medium">{cls.days.join(', ')}</span>
        </div>

        <Link href={`/dashboard/student/my-classes/${cls.id}`} className="shrink-0">
          <button className="inline-flex items-center gap-1.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm group-hover:shadow-md">
            View Class
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>
    </div>
  );
}

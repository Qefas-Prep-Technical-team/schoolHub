'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CalendarCheck, Building, Copy, Check, RotateCw } from 'lucide-react';
import { HeaderTooltip } from '@/app/dashboard/parent/components/dashboard/HeaderTooltip';
import { toast } from 'react-toastify';

interface StudentProfileProps {
  student: {
    name: string;
    grade: string;
    studentId: string;
    imageUrl?: string;
    schoolName?: string;
  };
  lastUpdated: string;
  onRefresh?: () => void;
}

export default function StudentProfile({ student, lastUpdated, onRefresh }: StudentProfileProps) {
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);

  const fallbackUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name || 'Student')}&backgroundColor=ea580c&fontFamily=Arial&fontSize=40&fontWeight=900`;
  const displayImage = (!imgError && student.imageUrl && student.imageUrl !== "null" && student.imageUrl !== "")
    ? student.imageUrl
    : fallbackUrl;

  const handleCopyCode = () => {
    if (!student.studentId || student.studentId === 'N/A') return;
    navigator.clipboard.writeText(student.studentId);
    setCopied(true);
    toast.success("Student Access Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-orange-50/20 to-amber-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/20 border border-slate-200/80 dark:border-slate-800 rounded-[24px] p-6 sm:p-8 shadow-sm">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 size-72 rounded-full bg-gradient-to-bl from-orange-400/10 via-amber-400/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="relative size-16 sm:size-20 shrink-0 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-md bg-orange-100 dark:bg-orange-950/40">
            <Image
              src={displayImage}
              alt={student.name}
              fill
              unoptimized
              onError={() => setImgError(true)}
              className="object-cover"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
                <CalendarCheck size={13} />
                Attendance Hub
              </span>

              {student.schoolName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                  <Building size={12} className="text-slate-400" />
                  {student.schoolName}
                </span>
              )}

              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/30">
                {student.grade}
              </span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {student.name}&apos;s Attendance
              </h1>
              <HeaderTooltip
                content="Comprehensive record of your child's classroom attendance consistency. Track real-time daily roll-call records, monitor monthly presence trends, inspect excused versus unexcused absences, and submit advance absence notices directly to homeroom teachers."
                size={18}
              />
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 hover:text-orange-600 transition-colors cursor-pointer group"
                title="Click to copy student ID"
              >
                <span>Student ID:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 group-hover:text-orange-600">
                  {student.studentId}
                </span>
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="text-slate-400 group-hover:text-orange-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sync Status & Refresh */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">
              Last Synced
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
              {lastUpdated}
            </span>
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-600 hover:border-orange-500/40 transition-all shadow-xs"
            >
              <RotateCw size={12} />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

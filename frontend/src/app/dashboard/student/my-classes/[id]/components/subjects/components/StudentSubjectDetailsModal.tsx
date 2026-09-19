'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { X, BookOpen, Hash, User, FileText, Clock, CalendarDays, BookOpenCheck, CheckCircle2 } from 'lucide-react';
import { Subject } from '@/app/dashboard/admin/classes/[id]/components/subjects/components/types';
import { useClassTimetable } from '@/lib/api/hooks/useClasses';
import { useQuery } from '@tanstack/react-query';
import { subjectService } from '@/app/dashboard/admin/subjects/services/subjectService';
import { cn } from '@/lib/utils';

interface StudentSubjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
}

export default function StudentSubjectDetailsModal({ isOpen, onClose, subject }: StudentSubjectDetailsModalProps) {
  const params = useParams();
  const classId = params.id as string;
  
  // Fetch timetable data for the class
  const { data: timetableData } = useClassTimetable(classId);

  // Fetch curriculum for the subject
  const { data: curriculum = [], isLoading: isLoadingCurriculum } = useQuery({
    queryKey: ['subject-curriculum', subject?.id],
    queryFn: () => subject?.id ? subjectService.getScheme(subject.id) : Promise.resolve([]),
    enabled: isOpen && !!subject?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });

  if (!isOpen || !subject) return null;

  // Filter timetable periods for this specific subject
  const periods = timetableData?.data?.periods || [];
  const subjectTimetable = periods.filter((p: any) => p.subjectId === subject.id && !p.isBreak);

  // Sort periods by day of week, then start time
  const dayOrder: Record<string, number> = {
    "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 7
  };

  subjectTimetable.sort((a: any, b: any) => {
    const dayA = dayOrder[a.day] || 99;
    const dayB = dayOrder[b.day] || 99;
    if (dayA !== dayB) return dayA - dayB;
    return (a.startTime || '').localeCompare(b.startTime || '');
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Dialog container - Made larger as requested */}
      <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-950 p-6 md:p-8 shadow-2xl border border-slate-100 dark:border-white/10 animate-in zoom-in-95 duration-200 z-10 custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header Profile Section */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left pb-6 border-b border-slate-100 dark:border-white/5">
          {subject.icon ? (
            <img
              src={subject.icon}
              alt={subject.name}
              className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover ring-4 ring-primary/10"
            />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center ring-4 ring-primary/5">
              <BookOpen size={40} className="text-primary" />
            </div>
          )}

          <div className="flex-1 mt-2 md:mt-0">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight uppercase">
              {subject.name}
            </h3>
            <p className="text-sm font-bold text-primary mb-3">
              Course Details & Class Schedule
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <Hash size={14} />
                <span className="uppercase">{subject.code}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <User size={14} />
                <span>{subject.teacherName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout for larger modal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Left Column: Description & Timetable */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Subject Description */}
            {subject.description && (
              <div className="pb-6 border-b border-slate-100 dark:border-white/5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  Description
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
                  {subject.description}
                </p>
              </div>
            )}

            {/* Timetable Schedule Section */}
            <div className="pb-6">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                <CalendarDays size={16} className="text-primary" />
                Class Schedule
              </h4>
              
              {subjectTimetable.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {subjectTimetable.map((period: any) => (
                    <div 
                      key={period.id} 
                      className="flex flex-col p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300">
                          {period.day}
                        </span>
                        {period.room && (
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Room: {period.room}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <Clock size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
                        <span>{period.startTime} - {period.endTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-center">
                  <CalendarDays className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    No classes scheduled for this subject yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Curriculum Roadmap */}
          <div className="lg:col-span-7">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <BookOpenCheck size={16} className="text-primary" />
              Curriculum Roadmap
            </h4>

            {isLoadingCurriculum ? (
              <div className="flex flex-col gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : curriculum.length > 0 ? (
              <div className="flex flex-col gap-4">
                {curriculum.map((week) => (
                  <div 
                    key={week.id} 
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "size-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold shadow-inner",
                        week.isCompleted 
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      )}>
                        W{week.week}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h5 className="font-bold text-slate-900 dark:text-white truncate">
                            {week.topic}
                          </h5>
                          {week.isCompleted && (
                            <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                        {week.objectives && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {week.objectives}
                          </p>
                        )}
                        {week.resources && (
                          <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800">
                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">Resources</span>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {week.resources}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-center">
                <BookOpenCheck className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h4 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">
                  No Curriculum Available
                </h4>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-[250px]">
                  The teacher has not uploaded the curriculum roadmap for this subject yet.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}


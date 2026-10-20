"use client";

import React from 'react';
import { BookOpen, User, FileText, CheckCircle2 } from 'lucide-react';

export interface SubjectItem {
  id?: string;
  subject?: {
    id: string;
    name: string;
    code?: string;
    description?: string;
    teacher?: {
      name?: string;
      email?: string;
      phone?: string;
    };
    _count?: {
      subjectExamPapers?: number;
    };
  };
  name?: string;
  code?: string;
  description?: string;
  teacher?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  _count?: {
    subjectExamPapers?: number;
  };
}

interface ParentClassSubjectsProps {
  classSubjects: SubjectItem[];
}

const getSubjectTheme = (name: string = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("math")) {
    return {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-100 dark:border-blue-900/30",
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    };
  }
  if (lower.includes("sci") || lower.includes("bio") || lower.includes("chem") || lower.includes("phy")) {
    return {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-100 dark:border-emerald-900/30",
      badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    };
  }
  if (lower.includes("eng") || lower.includes("lit") || lower.includes("lang") || lower.includes("gram")) {
    return {
      bg: "bg-indigo-50 dark:bg-indigo-950/30",
      text: "text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-100 dark:border-indigo-900/30",
      badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    };
  }
  if (lower.includes("hist") || lower.includes("geo") || lower.includes("social") || lower.includes("civic")) {
    return {
      bg: "bg-amber-50 dark:bg-amber-950/30",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-100 dark:border-amber-900/30",
      badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    };
  }
  if (lower.includes("art") || lower.includes("music") || lower.includes("drama") || lower.includes("craft")) {
    return {
      bg: "bg-purple-50 dark:bg-purple-950/30",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-100 dark:border-purple-900/30",
      badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    };
  }
  return {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-100 dark:border-orange-900/30",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  };
};

export default function ParentClassSubjects({ classSubjects }: ParentClassSubjectsProps) {
  if (!classSubjects || classSubjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 sm:p-16 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200/80 dark:border-slate-800 text-center shadow-sm">
        <div className="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4 text-orange-500">
          <BookOpen size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Curriculum Subjects Found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-md leading-relaxed">
          There are currently no formal subjects assigned to this classroom syllabus. Once the school administration assigns courses and syllabi to the cohort, they will appear here with instructor details.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Class Subjects & Curriculum
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {classSubjects.length} accredited course{classSubjects.length === 1 ? '' : 's'} assigned to this classroom cohort
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {classSubjects.map((cs, idx) => {
          const subject = cs.subject || cs;
          const subjectName = subject.name || "Subject";
          const subjectCode = subject.code || `SUB-${idx + 1}`;
          const teacherName = subject.teacher?.name || "Subject Specialist";
          const theme = getSubjectTheme(subjectName);
          const examPapersCount = subject._count?.subjectExamPapers;

          return (
            <div 
              key={cs.id || subject.id || idx} 
              className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 flex flex-col justify-between hover:shadow-md hover:border-orange-500/40 dark:hover:border-orange-500/40 transition-all duration-300 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className={`size-12 rounded-2xl ${theme.bg} ${theme.text} flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 duration-300`}>
                    <BookOpen size={22} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${theme.badge}`}>
                    {subjectCode}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {subjectName}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
                  {subject.description || "Core academic subject following official curriculum guidelines and continuous assessments."}
                </p>
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                    <User size={13} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Instructor</p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {teacherName}
                    </p>
                  </div>
                </div>

                {typeof examPapersCount === 'number' && examPapersCount > 0 ? (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-lg">
                    <FileText size={12} className="text-orange-500" />
                    <span>{examPapersCount} Assessment Paper{examPapersCount === 1 ? '' : 's'}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-lg">
                    <CheckCircle2 size={12} />
                    <span>Curriculum Active</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

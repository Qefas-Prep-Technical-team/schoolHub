'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Info,
  ArrowRight,
  GraduationCap,
  Layers,
  Calculator,
  FlaskConical,
  Atom,
  BookText,
  Globe2,
  Laptop,
  Leaf,
  History as HistoryIcon,
  Palette,
  Music,
  Dumbbell,
} from 'lucide-react';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTeacherSubjects } from '@/lib/api/hooks/useTeacher';

interface AssignedSubjectDepartment {
  departmentId?: string;
  department?: {
    id?: string;
    name?: string | null;
  } | null;
}

interface AssignedSubjectClass {
  classId?: string;
  class?: {
    id?: string;
    name?: string | null;
    section?: string | null;
    level?: string | null;
  } | null;
}

export interface AssignedTeacherSubjectItem {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  scope?: string | null;
  classesCount?: number;
  departments?: AssignedSubjectDepartment[];
  classes?: AssignedSubjectClass[];
}

interface TeacherAssignedSubjectsCardProps {
  schoolId: string;
  primaryColor: string;
}

function getSubjectIcon(name: string, code?: string | null) {
  const normalized = `${name} ${code || ''}`.toUpperCase();
  if (normalized.includes('MATH') || normalized.includes('CALC')) {
    return <Calculator size={18} />;
  }
  if (normalized.includes('BIO') || normalized.includes('AGRI')) {
    return <Leaf size={18} />;
  }
  if (normalized.includes('CHEM') || normalized.includes('SCI')) {
    return <FlaskConical size={18} />;
  }
  if (normalized.includes('PHY')) {
    return <Atom size={18} />;
  }
  if (normalized.includes('HIS')) {
    return <HistoryIcon size={18} />;
  }
  if (normalized.includes('ART')) {
    return <Palette size={18} />;
  }
  if (normalized.includes('LIT') || normalized.includes('ENG')) {
    return <BookText size={18} />;
  }
  if (normalized.includes('GEO')) {
    return <Globe2 size={18} />;
  }
  if (
    normalized.includes('COMP') ||
    normalized.includes('ICT') ||
    normalized.includes('INFO')
  ) {
    return <Laptop size={18} />;
  }
  if (normalized.includes('MUS')) {
    return <Music size={18} />;
  }
  if (
    normalized.includes('PHYSICAL') ||
    normalized.includes('P.E') ||
    normalized.includes('SPORT')
  ) {
    return <Dumbbell size={18} />;
  }

  return <BookOpen size={18} />;
}

export default function TeacherAssignedSubjectsCard({
  schoolId,
  primaryColor,
}: TeacherAssignedSubjectsCardProps) {
  const { data: subjectsRaw, isLoading } = useTeacherSubjects(schoolId);

  const subjects = useMemo<AssignedTeacherSubjectItem[]>(() => {
    if (Array.isArray(subjectsRaw)) {
      return subjectsRaw as AssignedTeacherSubjectItem[];
    }
    const wrapped = subjectsRaw as
      | { data?: AssignedTeacherSubjectItem[] }
      | undefined;
    return Array.isArray(wrapped?.data) ? wrapped.data : [];
  }, [subjectsRaw]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">
            Assigned Subjects
          </h2>
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="About assigned subjects"
                  className="text-slate-400 hover:text-primary transition-colors focus:outline-none"
                >
                  <Info size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl"
              >
                Lists all academic subjects currently assigned to you within
                this selected institution, along with their course codes,
                linked departments, and active classroom cohorts.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-xl px-2.5 py-0.5 text-[11px] font-semibold"
          >
            {isLoading ? '...' : `${subjects.length} Assigned`}
          </Badge>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            <Link href="/dashboard/teacher/subjects">
              <span>View All</span>
              <ArrowRight size={13} className="ml-1" />
            </Link>
          </Button>
        </div>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
        Subjects you are assigned to teach in the selected school.
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 animate-pulse space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
              <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 p-8 text-center flex flex-col items-center justify-center">
          <div
            className="size-12 rounded-2xl flex items-center justify-center mb-3"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
          >
            <BookOpen size={22} />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            No Subjects Assigned Yet
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            No academic subjects have been assigned to you for this school yet.
            Contact your school administrator if you expect to see subjects here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {subjects.map((subject) => {
            const deptNames = (subject.departments || [])
              .map((d) => d.department?.name?.trim())
              .filter((name): name is string => Boolean(name));

            const classLabels = (subject.classes || [])
              .map((c) => {
                if (!c.class?.name) return null;
                return c.class.section
                  ? `${c.class.name} (${c.class.section})`
                  : c.class.name;
              })
              .filter((label): label is string => Boolean(label));

            const fallbackClassCount =
              subject.classesCount ?? classLabels.length;

            return (
              <Link
                key={subject.id}
                href={`/dashboard/teacher/subjects/${subject.id}`}
                className="group p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 transition-all shadow-2xs flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="size-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: `${primaryColor}15`,
                        color: primaryColor,
                      }}
                    >
                      {getSubjectIcon(subject.name, subject.code)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                          {subject.name}
                        </h3>
                        {subject.code && (
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                            {subject.code}
                          </span>
                        )}
                      </div>
                      {subject.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                          {subject.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <ArrowRight
                    size={15}
                    className="text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  {deptNames.length > 0 &&
                    deptNames.slice(0, 2).map((dept) => (
                      <span
                        key={dept}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                      >
                        <Layers size={11} className="text-slate-400" />
                        {dept}
                      </span>
                    ))}
                  {deptNames.length > 2 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      +{deptNames.length - 2} dept
                    </span>
                  )}

                  {classLabels.length > 0 ? (
                    <>
                      {classLabels.slice(0, 2).map((classLabel) => (
                        <span
                          key={classLabel}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300"
                        >
                          <GraduationCap size={11} />
                          {classLabel}
                        </span>
                      ))}
                      {classLabels.length > 2 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                          +{classLabels.length - 2} classes
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      <GraduationCap size={11} />
                      {fallbackClassCount}{' '}
                      {fallbackClassCount === 1 ? 'Class' : 'Classes'}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}


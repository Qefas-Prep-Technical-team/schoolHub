"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Download, 
  Calendar, 
  GraduationCap, 
  School, 
  Hash, 
  BookOpen, 
  FileText,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useChildExams } from '@/lib/api/hooks/useChildExams';
import { useParentChildren } from '@/lib/api/hooks/useParentChildren';
import { useParentStore } from '@/lib/api/hooks/useParentStore';
import { Skeleton } from '@/components/ui/skeleton';
import { HeaderTooltip } from '@/app/dashboard/parent/components/dashboard/HeaderTooltip';
import { cn } from '@/lib/utils';
import { generatePDF } from '@/utils/pdfGenerator';
import { assertSchoolPayingPlan } from '@/utils/subscriptionPlanCheck';

function getGradeLetter(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

function getPerformanceTier(score: number): string {
  if (score >= 80) return 'Mastery';
  if (score >= 70) return 'Proficient';
  if (score >= 60) return 'Developing';
  return 'Needs Support';
}

export default function ProfileHeader() {
  const { selectedChildId, setSelectedChildId } = useParentStore();
  const { data: children = [] } = useParentChildren();
  const { data: student, isLoading } = useChildExams(selectedChildId);
  const [imgError, setImgError] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Auto-select first child if none is active
  useEffect(() => {
    if (!selectedChildId && children.length > 0) {
      setSelectedChildId(children[0].id);
    }
  }, [selectedChildId, children, setSelectedChildId]);

  const handleExportPDF = async () => {
    if (!student) return;

    // Verify school is on a paying plan (apart from FREE)
    if (!assertSchoolPayingPlan(student.school)) {
      return;
    }

    setIsExporting(true);
    const toastId = toast.loading("Generating Academic Performance Dossier...", { autoClose: false });

    try {
      const deptSubjects = student.department?.subjects || [];
      const grades = student.grades || [];

      // Build subject map
      const subjectsMap = new Map<string, {
        name: string;
        teacher: string;
        totalScore: number;
        totalMaxMarks: number;
        count: number;
      }>();

      if (deptSubjects.length > 0) {
        for (const ds of deptSubjects) {
          if (ds.subject?.name) {
            subjectsMap.set(ds.subject.name.toLowerCase(), {
              name: ds.subject.name,
              teacher: 'Department Instructor',
              totalScore: 0,
              totalMaxMarks: 0,
              count: 0
            });
          }
        }
      }

      for (const g of grades) {
        const subName = g.subject || g.subjectPaper?.subject?.name;
        if (!subName) continue;
        const key = subName.toLowerCase();
        
        // If student has department subjects, only evaluate grades for those subjects
        if (deptSubjects.length > 0 && !subjectsMap.has(key)) continue;

        const existing = subjectsMap.get(key) || {
          name: subName,
          teacher: g.subjectPaper?.teacher?.name || 'Class Teacher',
          totalScore: 0,
          totalMaxMarks: 0,
          count: 0
        };

        if (g.subjectPaper?.teacher?.name) existing.teacher = g.subjectPaper.teacher.name;
        existing.totalScore += Number(g.score || 0);
        existing.totalMaxMarks += Number(g.maxMarks || 100);
        existing.count += 1;
        subjectsMap.set(key, existing);
      }

      const tableData = Array.from(subjectsMap.values()).map((s, index) => {
        const avg = s.totalMaxMarks > 0 
          ? Math.round((s.totalScore / s.totalMaxMarks) * 100) 
          : (s.count > 0 ? Math.round(s.totalScore / s.count) : 0);
        const grade = s.count > 0 ? getGradeLetter(avg) : 'N/A';
        const tier = s.count > 0 ? getPerformanceTier(avg) : 'Pending Evaluation';

        return [
          String(index + 1),
          s.name,
          s.teacher,
          String(s.count),
          s.count > 0 ? `${avg}%` : 'N/A',
          grade,
          tier
        ];
      });

      const currentClass = student.classes?.[0]?.class?.name || 'Class N/A';
      const deptName = student.department?.name || 'General Curriculum';

      await generatePDF({
        title: 'Student Academic Performance Dossier',
        filename: `${student.name.replace(/\s+/g, '_')}_Academic_Performance.pdf`,
        schoolProfile: student.school,
        metaData: [
          { label: 'Student Name', value: student.name },
          { label: 'Student ID', value: student.id ? student.id.slice(-6).toUpperCase() : 'N/A' },
          { label: 'Enrolled Class', value: currentClass },
          { label: 'Department', value: deptName },
          { label: 'Total Subjects', value: String(tableData.length) },
          { label: 'Date Generated', value: new Date().toLocaleDateString('en-GB') }
        ],
        tableHeaders: [['#', 'Department Subject', 'Instructor', 'Tests Taken', 'Average Score', 'Letter Grade', 'Mastery Tier']],
        tableData
      });

      toast.update(toastId, {
        render: "Performance Report Exported Successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast.update(toastId, {
        render: "Failed to export PDF report",
        type: "error",
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-pulse flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 w-full">
          <Skeleton className="size-20 sm:size-24 rounded-2xl shrink-0" />
          <div className="space-y-3 w-full max-w-md">
            <Skeleton className="h-7 w-48 rounded-lg" />
            <Skeleton className="h-4 w-36 rounded-md" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24 rounded-xl" />
              <Skeleton className="h-6 w-24 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!student) return null;

  const placeholderUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}&backgroundColor=ea580c&fontFamily=Arial&fontSize=40&fontWeight=900`;

  const displayImage = (!imgError && student.profileImage && student.profileImage !== "null" && student.profileImage !== "") 
    ? student.profileImage 
    : placeholderUrl;

  const currentClass = student.classes?.[0]?.class?.name || 'Class N/A';
  const studentShortId = student.id ? student.id.slice(-6).toUpperCase() : 'N/A';

  return (
    <section className="relative overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all">
      {/* Decorative ambient gradient & watermark */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-orange-500/[0.08] via-amber-500/[0.03] to-transparent pointer-events-none" />
      <div className="absolute -bottom-8 -right-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <GraduationCap className="w-56 h-56 text-orange-600 dark:text-white transform -rotate-12" />
      </div>

      {/* Multi-child Switcher Bar */}
      {children.length > 1 && (
        <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-3 mb-5 border-b border-slate-100 dark:border-slate-800 scrollbar-hide">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
            Select Child:
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {children.map((c) => {
              const isSelected = selectedChildId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedChildId(c.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 active:scale-95 cursor-pointer",
                    isSelected
                      ? "bg-orange-600 text-white shadow-sm shadow-orange-600/30 ring-2 ring-orange-500/40"
                      : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  <span 
                    className="size-2 rounded-full shrink-0" 
                    style={{ backgroundColor: isSelected ? '#ffffff' : '#ea580c' }} 
                  />
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Profile Info & Action Row */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        
        {/* Left: Avatar + Details */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start text-center sm:text-left w-full lg:w-auto">
          
          {/* Avatar Container */}
          <div className="relative shrink-0">
            <div className="relative size-20 sm:size-24 md:size-26 p-1 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl sm:rounded-3xl shadow-lg shadow-orange-600/20">
              <div className="size-full rounded-[14px] sm:rounded-[22px] overflow-hidden bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-800 relative">
                <Image
                  src={displayImage}
                  alt={`Student photo of ${student.name}`}
                  fill
                  sizes="(max-width: 640px) 80px, 104px"
                  className="object-cover"
                  onError={() => setImgError(true)}
                  unoptimized={displayImage.includes('api.dicebear.com') || displayImage.includes('ui-avatars.com')}
                />
              </div>
            </div>
            {/* Active Status Badge */}
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border-2 border-white dark:border-slate-900 shadow-sm flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-white animate-pulse" />
              <span>Active</span>
            </div>
          </div>

          {/* Student Identifiers & Badges */}
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {student.name}
              </h1>
              <HeaderTooltip
                content="Official student profile summarizing academic enrollment, registered class level, session tracking, and verified curriculum performance."
              />
            </div>

            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider mt-1.5 flex items-center gap-2 justify-center sm:justify-start flex-wrap">
              <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
                <School className="w-3.5 h-3.5 text-orange-600" />
                {student.school?.name || 'School Hub Academy'}
              </span>
              <span className="size-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
              <span className="inline-flex items-center gap-1">
                <Hash className="w-3 h-3 text-slate-400" />
                ID: {studentShortId}
              </span>
            </p>

            {/* Badges Row */}
            <div className="mt-3.5 flex flex-wrap gap-2 justify-center sm:justify-start">
              {/* Enrolled Class */}
              <div className="inline-flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-xl border border-orange-200/50 dark:border-orange-900/30 shadow-xs">
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {currentClass}
                </span>
              </div>

              {/* Department */}
              {student.department?.name && (
                <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-xl border border-indigo-200/50 dark:border-indigo-900/30 shadow-xs">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {student.department.name}
                  </span>
                </div>
              )}

              {/* Academic Session */}
              <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Session 2023-2024
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2.5 w-full lg:w-auto justify-center sm:justify-start shrink-0">
          {/* Export PDF Button (Protected by Paying Plan) */}
          <button 
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-600/20 active:scale-95 cursor-pointer"
            title="Download official PDF academic performance report"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{isExporting ? "Generating..." : "Download PDF"}</span>
          </button>

          {/* Result Sheets Shortcut */}
          <Link
            href="/dashboard/parent/result/termly"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 px-4 py-2.5 sm:py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95"
            title="Inspect official published termly score sheets"
          >
            <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span>Result Sheets</span>
          </Link>
        </div>

      </div>
    </section>
  );
}

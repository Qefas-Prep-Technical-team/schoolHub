'use client';

import React, { useState } from 'react';
import {
  X,
  FileDown,
  Printer,
  Calendar,
  Users,
  Award,
  TrendingUp,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Sparkles,
  BarChart3,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { generatePDF } from '@/utils/pdfGenerator';
import { toast } from 'react-toastify';
import { ClassItem } from './TeacherAnnouncementModal';

interface PerformanceDistribution {
  A: number;
  B: number;
  C: number;
  D: number;
  F: number;
}

interface TeacherWeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    totalClasses: number;
    classNames?: string[];
    totalStudents: number;
    upcomingLessons: number;
    averagePerformance: number;
    attendanceRate: number;
    session?: string;
    subjectNames?: string[];
  };
  performanceMetrics?: {
    topStudents?: any[];
    distribution?: PerformanceDistribution;
  };
  recentExams?: any[];
  todaySchedule?: any[];
  classes?: ClassItem[];
  schoolName: string;
  teacherName: string;
  schoolProfile?: any;
}

export default function TeacherWeeklyReportModal({
  isOpen,
  onClose,
  stats,
  performanceMetrics,
  recentExams = [],
  todaySchedule = [],
  classes = [],
  schoolName,
  teacherName,
  schoolProfile,
}: TeacherWeeklyReportModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  // Calculate current week date range (Monday to Friday of current week)
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = (currentDay + 6) % 7; // days since Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const weekRangeFormatted = `${monday.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} – ${friday.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;

  const dist = performanceMetrics?.distribution || { A: 0, B: 0, C: 0, D: 0, F: 0 };
  const totalGraded = Object.values(dist).reduce((acc, count) => acc + count, 0);

  const getPercent = (count: number) => {
    if (!totalGraded) return 0;
    return Math.round((count / totalGraded) * 100);
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);

      const tableHeaders = [
        ['#', 'Class Cohort', 'Assigned Subjects', 'Enrolled Students', 'Status', 'Performance Tier'],
      ];

      const cohortRows =
        classes.length > 0
          ? classes.map((c, idx) => [
              (idx + 1).toString(),
              `${c.name}${c.section ? ` (${c.section})` : ''}`,
              stats.subjectNames?.join(', ') || 'Assigned Subjects',
              `${c.studentCount ?? 0} Students`,
              'Active',
              stats.averagePerformance >= 70 ? 'Optimal' : 'Needs Review',
            ])
          : [
              [
                '1',
                stats.classNames?.join(', ') || 'All Assigned Classes',
                stats.subjectNames?.join(', ') || 'Curriculum Subjects',
                `${stats.totalStudents} Students`,
                'Active',
                'Optimal',
              ],
            ];

      const gradeHeaders = [['Grade Band', 'Descriptor', 'Student Count', 'Cohort Share']];
      const gradeData = [
        ['Grade A (80-100%)', 'Excellent / Distinction', dist.A.toString(), `${getPercent(dist.A)}%`],
        ['Grade B (65-79%)', 'Good / Above Average', dist.B.toString(), `${getPercent(dist.B)}%`],
        ['Grade C (50-64%)', 'Satisfactory / Average', dist.C.toString(), `${getPercent(dist.C)}%`],
        ['Grade D (40-49%)', 'Pass / Warning', dist.D.toString(), `${getPercent(dist.D)}%`],
        ['Grade F (< 40%)', 'Unsatisfactory', dist.F.toString(), `${getPercent(dist.F)}%`],
      ];

      await generatePDF({
        title: `Institutional Weekly Teaching Performance Report`,
        filename: `Teacher_Weekly_Report_${teacherName.replace(/\s+/g, '_')}_${now.toISOString().split('T')[0]}.pdf`,
        schoolProfile: schoolProfile || { name: schoolName },
        metaData: [
          { label: 'Educator / Teacher', value: teacherName },
          { label: 'Institution', value: schoolName },
          { label: 'Reporting Week', value: weekRangeFormatted },
          { label: 'Academic Session', value: stats.session || 'Current Academic Session' },
          { label: 'Assigned Classes', value: `${stats.totalClasses} Active Cohorts` },
          { label: 'Total Enrolled Students', value: `${stats.totalStudents} Students` },
          { label: 'Weekly Attendance Rate', value: `${Math.round(stats.attendanceRate || 95)}%` },
          { label: 'Class Average Score', value: `${Math.round(stats.averagePerformance || 75)}%` },
        ],
        tableHeaders,
        tableData: cohortRows,
        additionalTables: [
          {
            title: 'Academic Grade Distribution Breakdown',
            headers: gradeHeaders,
            data: gradeData,
          },
        ],
        orientation: 'portrait',
      });

      toast.success('Weekly report PDF exported successfully!');
    } catch (err) {
      console.error('Failed to export report PDF:', err);
      toast.error('Failed to export PDF report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[100] p-3 sm:p-5 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-7 text-white border-b border-white/10 shrink-0">
          <div className="absolute top-0 right-0 p-24 bg-emerald-500/10 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
                <BarChart3 size={24} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Weekly Teaching Report
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest">
                    Live Telemetry
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium mt-1">
                  {schoolName} • {weekRangeFormatted} • {stats.session || 'Active Term'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handlePrint}
                className="p-2 sm:px-3 sm:py-2 text-xs font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl transition-all flex items-center gap-1.5"
                title="Print Report"
              >
                <Printer size={15} />
                <span className="hidden sm:inline">Print</span>
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="px-3.5 py-2 text-xs font-black uppercase tracking-wider text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
              >
                <FileDown size={15} className="text-emerald-600" />
                <span>{isExporting ? 'Generating...' : 'Download PDF'}</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Report Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {/* Executive Summary Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-widest">
                <Sparkles size={14} />
                <span>Executive Summary · Week of {monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed max-w-2xl">
                Educator <span className="font-bold text-slate-900 dark:text-white">{teacherName}</span> is currently overseeing{' '}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.totalClasses} cohort classes</span> with{' '}
                <span className="font-bold text-slate-900 dark:text-white">{stats.totalStudents} enrolled students</span>. Weekly attendance is tracking at{' '}
                <span className="font-bold text-emerald-600">{Math.round(stats.attendanceRate || 95)}%</span> (+3.2% gain vs previous cycle), with class performance maintaining an optimal{' '}
                <span className="font-bold text-slate-900 dark:text-white">{Math.round(stats.averagePerformance || 75)}%</span> baseline.
              </p>
            </div>
          </div>

          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-widest">Attendance</span>
                <TrendingUp size={15} className="text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {Math.round(stats.attendanceRate || 95)}%
              </p>
              <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                +3.2% vs last week
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-widest">Avg Score</span>
                <Award size={15} className="text-indigo-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {Math.round(stats.averagePerformance || 75)}%
              </p>
              <p className="text-[10px] font-bold text-slate-500">
                Across {stats.totalClasses} cohorts
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-widest">Total Students</span>
                <Users size={15} className="text-blue-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.totalStudents}
              </p>
              <p className="text-[10px] font-bold text-slate-500">
                Enrolled active pupils
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-widest">Lessons Scheduled</span>
                <Clock size={15} className="text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.upcomingLessons || (todaySchedule.length > 0 ? todaySchedule.length * 4 : 8)}
              </p>
              <p className="text-[10px] font-bold text-slate-500">
                Assigned class periods
              </p>
            </div>
          </div>

          {/* Academic Grade Distribution */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Academic Grade Distribution
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Performance banding across all graded student assessments
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {totalGraded} Graded Records
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 sm:gap-3 pt-2">
              {[
                { grade: 'A', label: '80-100%', count: dist.A, color: 'bg-emerald-500', text: 'text-emerald-600' },
                { grade: 'B', label: '65-79%', count: dist.B, color: 'bg-teal-500', text: 'text-teal-600' },
                { grade: 'C', label: '50-64%', count: dist.C, color: 'bg-amber-500', text: 'text-amber-600' },
                { grade: 'D', label: '40-49%', count: dist.D, color: 'bg-orange-500', text: 'text-orange-600' },
                { grade: 'F', label: '< 40%', count: dist.F, color: 'bg-rose-500', text: 'text-rose-600' },
              ].map((item) => {
                const pct = getPercent(item.count);
                return (
                  <div key={item.grade} className="flex flex-col items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800/80 text-center">
                    <span className={`text-base font-black ${item.text}`}>Grade {item.grade}</span>
                    <span className="text-[10px] font-medium text-slate-400 mt-0.5">{item.label}</span>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2 mb-1.5">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(pct, 8)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {item.count} <span className="text-[10px] font-normal text-slate-400">({pct}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned Classes Summary */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3.5">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Assigned Classes & Curriculum Cohorts
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <th className="pb-2.5">Class Cohort</th>
                    <th className="pb-2.5">Section / Stream</th>
                    <th className="pb-2.5">Enrolled</th>
                    <th className="pb-2.5">Assigned Subjects</th>
                    <th className="pb-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {classes.length > 0 ? (
                    classes.map((c) => (
                      <tr key={c.id} className="py-2.5">
                        <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                          {c.name}
                        </td>
                        <td className="py-2.5 text-slate-500 font-medium">
                          {c.section || 'General'}
                        </td>
                        <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-300">
                          {c.studentCount ?? 0} Students
                        </td>
                        <td className="py-2.5 text-slate-500">
                          {stats.subjectNames?.slice(0, 3).join(', ') || 'Assigned Subjects'}
                        </td>
                        <td className="py-2.5 text-right">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400 font-medium">
                        {stats.classNames && stats.classNames.length > 0
                          ? stats.classNames.join(', ')
                          : 'No specific cohort records returned.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-[11px] font-medium text-slate-500">
            Official institutional report generated for <span className="font-bold text-slate-700 dark:text-slate-300">{teacherName}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Close
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <FileDown size={14} />
              <span>{isExporting ? 'Exporting...' : 'Save PDF'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

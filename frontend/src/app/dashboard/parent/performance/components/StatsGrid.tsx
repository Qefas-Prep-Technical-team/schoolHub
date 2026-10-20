"use client";

import { useMemo } from 'react';
import { TrendingUp, Trophy, Award, Clock, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard';
import { useChildExams } from '@/lib/api/hooks/useChildExams';
import { useParentStore } from '@/lib/api/hooks/useParentStore';
import { Skeleton } from '@/components/ui/skeleton';
import { HeaderTooltip } from '@/app/dashboard/parent/components/dashboard/HeaderTooltip';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  link?: string;
  info?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorTheme: 'blue' | 'green' | 'orange' | 'purple';
}

const colorStyles = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200/60 dark:border-blue-900/40',
    glow: 'group-hover:border-blue-500/30',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200/60 dark:border-emerald-900/40',
    glow: 'group-hover:border-emerald-500/30',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200/60 dark:border-orange-900/40',
    glow: 'group-hover:border-orange-500/30',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200/60 dark:border-purple-900/40',
    glow: 'group-hover:border-purple-500/30',
  },
};

function StatCard({ title, value, subtitle, icon, trend, colorTheme, link, info }: StatCardProps) {
  const style = colorStyles[colorTheme];

  const CardContent = (
    <div className={cn(
      "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xs border border-slate-200/80 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden h-full",
      style.glow,
      link && "hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
    )}>
      {/* Top Row: Title + Icon */}
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-2.5 sm:mb-3">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              {title}
            </span>
            {info && <HeaderTooltip content={info} />}
          </div>
          <div className={cn(
            "size-8 sm:size-9 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
            style.bg,
            style.text,
            style.border
          )}>
            {icon}
          </div>
        </div>

        {/* Middle: Big Value + Trend badge */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {value}
          </span>
          {trend && (
            <span className={cn(
              "text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md inline-flex items-center tracking-tight",
              trend.isPositive 
                ? "text-emerald-700 bg-emerald-100/70 dark:bg-emerald-950/60 dark:text-emerald-300" 
                : "text-rose-700 bg-rose-100/70 dark:bg-rose-950/60 dark:text-rose-300"
            )}>
              <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
              {trend.value}
            </span>
          )}
        </div>
      </div>

      {/* Bottom: Subtitle / Link */}
      <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 truncate">
          {subtitle}
        </p>
        {link && (
          <span className="text-orange-600 dark:text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </div>
  );

  if (link) {
    return <Link href={link} className="block h-full">{CardContent}</Link>;
  }

  return CardContent;
}

export default function StatsGrid() {
  const { selectedChildId } = useParentStore();
  const { data: dashboardData, isLoading: isDashboardLoading } = useParentDashboard(selectedChildId);
  const { data: student, isLoading: isStudentLoading } = useChildExams(selectedChildId);

  const isLoading = isDashboardLoading || isStudentLoading;

  // Compute departmental stats from student grades attached to department subjects
  const departmentStats = useMemo(() => {
    if (!student) return null;

    const deptSubjects = student.department?.subjects || [];
    const deptSubjectNames = deptSubjects
      .map((ds) => ds.subject?.name?.toLowerCase())
      .filter((n): n is string => Boolean(n));

    const grades = student.grades || [];
    let totalScore = 0;
    let totalMaxMarks = 0;
    let count = 0;

    for (const g of grades) {
      const subName = (g.subject || g.subjectPaper?.subject?.name || '').toLowerCase();
      if (!subName) continue;

      if (deptSubjectNames.length > 0 && !deptSubjectNames.includes(subName)) {
        continue;
      }

      totalScore += Number(g.score || 0);
      totalMaxMarks += Number(g.maxMarks || 100);
      count += 1;
    }

    const calculatedAvg = totalMaxMarks > 0 
      ? Math.round((totalScore / totalMaxMarks) * 100) 
      : (count > 0 ? Math.round(totalScore / count) : 0);

    return {
      average: count > 0 ? calculatedAvg : (dashboardData?.stats?.averageGrade ?? 0),
      assessmentCount: count > 0 ? count : (student.grades?.length ?? 0),
      hasDepartmentGrades: count > 0,
      departmentName: student.department?.name || 'Department'
    };
  }, [student, dashboardData]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 sm:h-36 rounded-2xl sm:rounded-3xl" />
        ))}
      </div>
    );
  }

  const avg = departmentStats?.average ?? (dashboardData?.stats?.averageGrade ?? 0);
  const totalAssessments = departmentStats?.assessmentCount ?? (dashboardData?.child?.recentGrades?.length ?? 0);

  const gradeLabel = (score: number) => {
    if (totalAssessments === 0) return 'N/A';
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const deptSubtitle = departmentStats?.departmentName 
    ? `${departmentStats.departmentName} Curriculum` 
    : 'Coursework benchmark';

  const stats: StatCardProps[] = [
    {
      title: 'Average Score',
      value: `${avg}%`,
      subtitle: avg >= 75 ? `Above target in ${deptSubtitle}` : `Focus needed in ${deptSubtitle}`,
      icon: <TrendingUp className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
      trend: { value: '+2.1%', isPositive: true },
      info: `Cumulative grade percentage calculated across all grades attached to subjects in the student's assigned department (${departmentStats?.departmentName || 'Curriculum'}).`,
      colorTheme: 'blue',
      link: "/dashboard/parent/performance/subject-performance"
    },
    {
      title: 'Academic Standing',
      value: gradeLabel(avg),
      subtitle: 'Official letter grade',
      icon: <Award className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
      colorTheme: 'green',
      info: `Official academic performance tier and letter grade evaluated from coursework in the student's department subjects.`,
      link: "/dashboard/parent/performance/subject-performance"
    },
    {
      title: 'Assessments',
      value: `${totalAssessments}`,
      subtitle: `Recorded in ${deptSubtitle}`,
      icon: <Trophy className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
      colorTheme: 'orange',
      info: `Total count of all recorded tests, assignments, and examination papers taken for subjects in the student's department.`,
      link: "/dashboard/parent/exams&results"
    },
    {
      title: 'Attendance',
      value: `${dashboardData?.stats?.attendanceRate ?? 0}%`,
      subtitle: 'Verified presence',
      icon: <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
      colorTheme: 'purple',
      info: "Verified attendance rate tracking physical presence in scheduled school sessions and classes.",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

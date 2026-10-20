"use client";

import { useMemo, useState } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Filter, TrendingUp, Sparkles, BarChart2, ChevronDown, Layers } from 'lucide-react';
import { useChildExams } from '@/lib/api/hooks/useChildExams';
import { useParentStore } from '@/lib/api/hooks/useParentStore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { HeaderTooltip } from '@/app/dashboard/parent/components/dashboard/HeaderTooltip';

interface GradeItem {
  createdAt: string;
  score: number;
  maxMarks: number;
  subject?: string;
  subjectPaper?: {
    subject?: {
      name: string;
    };
  };
}

export default function PerformanceChart() {
  const { selectedChildId } = useParentStore();
  const { data: student, isLoading } = useChildExams(selectedChildId);
  const [selectedSubject, setSelectedSubject] = useState('All Department Subjects');

  // Subjects attached to student's department
  const departmentSubjectNames = useMemo<string[]>(() => {
    const deptSubjects = student?.department?.subjects || [];
    if (deptSubjects.length > 0) {
      return Array.from(
        new Set(
          deptSubjects
            .map((ds) => ds.subject?.name)
            .filter((name): name is string => Boolean(name))
        )
      );
    }
    // Fallback: If no explicit department subjects, gather from grades
    const gradeList = (student?.grades || []) as GradeItem[];
    return Array.from(
      new Set(
        gradeList
          .map((g) => g.subject || g.subjectPaper?.subject?.name)
          .filter((name): name is string => Boolean(name))
      )
    );
  }, [student]);

  const chartData = useMemo(() => {
    if (!student?.grades) return [];
    
    const grades = student.grades as GradeItem[];
    
    // Filter grades: must be attached to the department's subjects
    let filteredGrades = grades.filter((g) => {
      const subName = g.subject || g.subjectPaper?.subject?.name;
      if (!subName) return false;
      if (departmentSubjectNames.length > 0) {
        return departmentSubjectNames.some(
          (d) => d.toLowerCase() === subName.toLowerCase()
        );
      }
      return true;
    });

    if (selectedSubject !== 'All Department Subjects') {
      filteredGrades = filteredGrades.filter((g) => 
        (g.subject || g.subjectPaper?.subject?.name)?.toLowerCase() === selectedSubject.toLowerCase()
      );
    }

    // Map every grade attached to these department subjects chronologically
    return [...filteredGrades]
      .reverse()
      .map((g) => {
        const rawScore = Number(g.score) || 0;
        const maxScore = Number(g.maxMarks) || 100;
        const percent = Math.min(100, Math.max(0, Math.round((rawScore / maxScore) * 100)));
        let dateLabel = 'Recent';
        try {
          if (g.createdAt) {
            dateLabel = format(new Date(g.createdAt), 'MMM d');
          }
        } catch {
          dateLabel = 'Assessment';
        }

        return {
          date: dateLabel,
          score: percent,
          subject: g.subject || g.subjectPaper?.subject?.name || 'Curriculum',
        };
      });
  }, [student, selectedSubject, departmentSubjectNames]);

  const subjects = useMemo(() => {
    return ['All Department Subjects', ...departmentSubjectNames];
  }, [departmentSubjectNames]);

  if (isLoading) {
    return <Skeleton className="h-[360px] sm:h-[420px] w-full rounded-2xl sm:rounded-3xl" />;
  }

  const deptLabel = student?.department?.name 
    ? `${student.department.name} Department` 
    : 'Department Curriculum';

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 md:p-8 transition-all">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              Academic Trend
            </h3>
            <HeaderTooltip
              content={`This trend visualizes every continuous assessment score and exam evaluation for subjects attached to your child's department (${deptLabel}). Filter by specific department subjects to monitor mastery trajectory over time.`}
            />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 pl-10 flex items-center gap-1.5 flex-wrap">
            <span className="text-orange-600 dark:text-orange-400 font-bold">{deptLabel}</span>
            <span className="size-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
            <span>{departmentSubjectNames.length} Registered Subjects Evaluated</span>
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold text-slate-700 dark:text-white py-2.5 pl-3.5 pr-8 cursor-pointer outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {subject}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {selectedSubject !== 'All Department Subjects' && (
            <button
              type="button"
              onClick={() => setSelectedSubject('All Department Subjects')}
              className="px-2.5 py-2 rounded-xl text-xs font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Chart Canvas or Empty State */}
      {chartData.length === 0 ? (
        <div className="h-[240px] sm:h-[300px] w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-6 text-center">
          <BarChart2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No evaluation data available
          </p>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Recorded scores for {selectedSubject} in {deptLabel} will automatically render here as examinations and tests are graded.
          </p>
        </div>
      ) : (
        <div className="h-[260px] sm:h-[300px] md:h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={11}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                dy={8}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as { date: string; score: number; subject: string };
                    return (
                      <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white p-3 rounded-xl shadow-xl border border-slate-700/60 backdrop-blur-md text-xs">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">{data.date}</span>
                          <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-orange-600/30 text-orange-400 border border-orange-500/20">
                            {data.subject}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-lg font-black text-white">{data.score}%</span>
                          <span className="text-slate-400 text-[11px] font-medium">overall score</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#ea580c"
                fill="url(#scoreAreaGradient)"
                strokeWidth={3}
                fillOpacity={1}
                activeDot={{ r: 6, fill: '#ea580c', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

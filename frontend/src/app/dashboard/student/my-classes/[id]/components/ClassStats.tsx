import { CheckCircle, BookOpen, Award, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClassStatsProps {
  attendance: number;
  assignments: { completed: number; total: number };
  grade: string;
  gradeRemark?: string;
  gradeColor?: string;
  gradeBg?: string;
  averagePercentage?: number | null;
  lastActivity: string;
}

export default function ClassStats({
  attendance,
  assignments,
  grade,
  gradeRemark,
  gradeColor,
  gradeBg,
  averagePercentage,
  lastActivity
}: ClassStatsProps) {
  const isGraded = grade && grade !== 'N/A';

  const stats = [
    {
      icon: BookOpen,
      value: `${assignments.completed}/${assignments.total}`,
      label: 'Assignments Done',
      iconBg: 'bg-blue-50 dark:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: Award,
      value: grade,
      subValue: averagePercentage != null ? `${averagePercentage}%` : null,
      remark: gradeRemark || null,
      label: 'Current Grade',
      iconBg: isGraded ? (gradeBg || 'bg-emerald-50 dark:bg-emerald-950/30') : 'bg-orange-50 dark:bg-orange-950/30',
      iconColor: isGraded ? (gradeColor || 'text-emerald-600 dark:text-emerald-400') : 'text-orange-500 dark:text-orange-400',
      isGradeTile: true,
    },
    {
      icon: CheckCircle,
      value: `${attendance}%`,
      label: 'Attendance Rate',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      icon: Flame,
      value: lastActivity === 'No activity yet' ? '0' : '1',
      label: 'Active Streak',
      iconBg: 'bg-pink-50 dark:bg-pink-950/30',
      iconColor: 'text-pink-500 dark:text-pink-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between h-28 sm:h-32 transition-all hover:shadow-xs overflow-hidden"
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${stat.iconBg}`}>
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              {stat.label}
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-xl sm:text-2xl md:text-3xl font-black leading-none tracking-tight",
                stat.isGradeTile && isGraded && stat.iconColor
                  ? stat.iconColor
                  : "text-slate-800 dark:text-white"
              )}>
                {stat.value}
              </span>
              {stat.subValue && (
                <span className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500">
                  ({stat.subValue})
                </span>
              )}
            </div>
            {stat.remark && (
              <span className="block mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
                {stat.remark}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
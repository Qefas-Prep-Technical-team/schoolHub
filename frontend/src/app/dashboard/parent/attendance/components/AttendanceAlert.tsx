import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

interface AttendanceAlertProps {
  attendanceRate: number;
  message: string;
}

export default function AttendanceAlert({ attendanceRate, message }: AttendanceAlertProps) {
  const isExcellent = attendanceRate >= 90;
  const isGood = attendanceRate >= 75;

  const config = isExcellent
    ? {
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-300',
        iconBg: 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800/60',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        title: 'Excellent Attendance!',
        icon: CheckCircle2,
      }
    : isGood
    ? {
        bgColor: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-300',
        iconBg: 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800/60',
        iconColor: 'text-amber-600 dark:text-amber-400',
        title: 'Moderate Attendance',
        icon: AlertTriangle,
      }
    : {
        bgColor: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-300',
        iconBg: 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800/60',
        iconColor: 'text-rose-600 dark:text-rose-400',
        title: 'Attendance Attention Needed',
        icon: AlertCircle,
      };

  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border shadow-sm ${config.bgColor}`}>
      <div className={`p-2.5 rounded-xl shadow-sm flex items-center justify-center border shrink-0 ${config.iconBg}`}>
        <Icon className={`h-5 w-5 ${config.iconColor}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-black text-sm uppercase tracking-tight">{config.title}</p>
        <p className="text-xs sm:text-sm opacity-90 mt-0.5 leading-relaxed">
          {message.replace('{rate}', `${attendanceRate}%`)}
        </p>
      </div>
    </div>
  );
}

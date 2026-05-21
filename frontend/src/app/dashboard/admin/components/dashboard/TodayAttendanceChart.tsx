'use client';

import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolTodayAttendance } from '@/lib/api/hooks/useSchool';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, XCircle, Clock, CalendarCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl shadow-xl min-w-[130px]">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 truncate max-w-[120px]">{label}</p>
        {payload.map((entry: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-[9px] font-bold text-slate-500">{entry.name}</span>
            </div>
            <span className="text-xs font-black text-slate-900 dark:text-white">{entry.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function TodayAttendanceChart({ primaryColor = '#2563eb' }: { primaryColor?: string }) {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
  );
  const { data: classes = [], isLoading } = useSchoolTodayAttendance(schoolId, selectedDate);

  const chartData = useMemo(() =>
    classes.map((c) => ({
      name: c.className.length > 10 ? c.className.substring(0, 10) + '…' : c.className,
      fullName: c.className,
      Rate: c.rate,
    })), [classes]);

  const totals = useMemo(() => {
    const totalPresent = classes.reduce((acc, c) => acc + c.present, 0);
    const totalAbsent = classes.reduce((acc, c) => acc + c.absent, 0);
    const totalLate = classes.reduce((acc, c) => acc + c.late, 0);
    const total = classes.reduce((acc, c) => acc + c.total, 0);
    const overallRate = total > 0 ? Math.round((totalPresent / total) * 100) : 0;
    return { totalPresent, totalAbsent, totalLate, overallRate };
  }, [classes]);

  const rateColor = totals.overallRate >= 80 ? '#10B981' : totals.overallRate >= 60 ? '#F59E0B' : '#F43F5E';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden flex flex-col bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/20 dark:border-slate-800/50 p-6 md:p-8"
      style={{ boxShadow: `0 20px 40px -12px ${primaryColor}12` } as any}
    >
      {/* Glow */}
      <div className="absolute top-0 right-0 h-32 w-32 rounded-full blur-3xl opacity-25" style={{ backgroundColor: rateColor }} />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: rateColor, boxShadow: `0 0 6px ${rateColor}` }} />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-[9px] font-black uppercase tracking-[0.2em] bg-transparent border-none outline-none cursor-pointer p-0 m-0 w-[85px]"
              style={{ color: rateColor }}
            />
          </div>
          <h3 className="font-black text-lg text-slate-900 dark:text-white tracking-tighter">
            Attendance Overview
          </h3>
        </div>
        {/* Rate badge */}
        <div
          className="flex flex-col items-center justify-center h-12 w-12 rounded-2xl"
          style={{ backgroundColor: `${rateColor}18`, color: rateColor }}
        >
          <span className="text-base font-black leading-none">{totals.overallRate}%</span>
          <span className="text-[7px] font-black uppercase tracking-wider opacity-70">rate</span>
        </div>
      </div>

      {/* Summary pills */}
      <div className="relative z-10 grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Present', value: totals.totalPresent, color: '#10B981', Icon: CheckCircle2 },
          { label: 'Absent', value: totals.totalAbsent, color: '#F43F5E', Icon: XCircle },
          { label: 'Late', value: totals.totalLate, color: '#F59E0B', Icon: Clock },
        ].map(({ label, value, color, Icon }) => (
          <div
            key={label}
            className="flex flex-col gap-1 p-2.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-800/50"
          >
            <div className="flex items-center gap-1">
              <Icon size={10} style={{ color }} />
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</span>
            </div>
            <p className="text-base font-black leading-none" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="relative z-10 h-[140px]">
        {isLoading ? (
          <Skeleton className="h-full w-full rounded-2xl" />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -32, bottom: 0 }}>
              <defs>
                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.07)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 900, fill: '#94a3b8' }} dy={6} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 900, fill: '#94a3b8' }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: `${primaryColor}20`, strokeWidth: 1 }} />
              <ReferenceLine y={75} stroke="#10B981" strokeDasharray="3 3" strokeOpacity={0.35} />
              <Area
                type="monotone"
                dataKey="Rate"
                stroke={primaryColor}
                strokeWidth={2.5}
                fill="url(#attGrad)"
                dot={{ r: 4, fill: primaryColor, strokeWidth: 2, stroke: 'white' }}
                activeDot={{ r: 6, fill: primaryColor, strokeWidth: 2, stroke: 'white' }}
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center gap-2">
            <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
              <CalendarCheck size={22} className="text-slate-300" />
            </div>
            <div>
              <p className="font-black text-xs tracking-tight">No attendance data</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Mark attendance in classes</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-3 pt-3 border-t border-slate-200/30 dark:border-slate-800/50 flex items-center justify-between">
        <span className="text-[9px] font-bold text-slate-400">{classes.length} class{classes.length !== 1 ? 'es' : ''} · dashed = 75% target</span>
        <Link
          href="/dashboard/admin/classes"
          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity"
          style={{ color: primaryColor }}
        >
          All Classes <ArrowRight size={9} />
        </Link>
      </div>
    </motion.div>
  );
}

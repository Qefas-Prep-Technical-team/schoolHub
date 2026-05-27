import { UserCheck, UserX, Clock, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AttendanceData {
  overallPercentage: number;
  present: number;
  absent: number;
  late: number;
  trend: string;
}

interface AttendanceSummaryProps {
  data: AttendanceData;
  onViewAll: () => void;
}

export default function AttendanceSummary({ data, onViewAll }: AttendanceSummaryProps) {
  const chartData = {
    labels: ['Present/Late', 'Absent'],
    datasets: [
      {
        data: [data.overallPercentage, 100 - data.overallPercentage],
        backgroundColor: [
          '#10B981', // emerald-500
          'rgba(241, 245, 249, 0.1)', // transparent/slate-100 placeholder
        ],
        borderWidth: 0,
        hoverBackgroundColor: ['#059669', 'rgba(241, 245, 249, 0.1)'],
      },
    ],
  };

  const chartOptions = {
    cutout: '85%',
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1500,
      easing: 'easeOutQuart' as const,
    },
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 dark:shadow-none h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Activity className="text-primary" size={20} />
          Attendance Pulse
        </h2>
        <button
          onClick={onViewAll}
          className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-dark transition-colors"
        >
          Detailed Log
        </button>
      </div>

      <div className="flex flex-col items-center justify-center mb-10 mt-4 relative">
        <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Chart.js Doughnut */}
            <div className="absolute inset-0 z-0">
               <Doughnut data={chartData} options={chartOptions} />
            </div>
            
            {/* Inner Text */}
            <div className="text-center z-10 flex flex-col items-center pointer-events-none">
                <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{data.overallPercentage}%</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Average</span>
                <span className={`text-[10px] font-bold mt-2 px-2 py-0.5 rounded-md ${data.trend.includes('Up') || data.trend.includes('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {data.trend}
                </span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-auto">
        <MetricBox icon={UserCheck} label="Present" value={data.present} color="text-emerald-500" bg="bg-emerald-500/10" />
        <MetricBox icon={UserX} label="Absent" value={data.absent} color="text-rose-500" bg="bg-rose-500/10" />
        <MetricBox icon={Clock} label="Late" value={data.late} color="text-amber-500" bg="bg-amber-500/10" />
      </div>
    </div>
  );
}

function MetricBox({ icon: Icon, label, value, color, bg }: any) {
    return (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center text-center border border-slate-100 dark:border-slate-800">
            <div className={`p-2 rounded-xl mb-3 ${bg} ${color}`}>
                <Icon size={16} strokeWidth={3} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white leading-none mb-1">{value}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
        </div>
    );
}
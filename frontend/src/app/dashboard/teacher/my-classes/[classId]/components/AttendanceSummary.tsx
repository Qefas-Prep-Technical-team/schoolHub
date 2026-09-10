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
          'rgba(241, 245, 249, 0.05)', // extremely subtle placeholder
        ],
        borderWidth: 0,
        hoverBackgroundColor: ['#34D399', 'rgba(241, 245, 249, 0.05)'],
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
    <div className="bg-white/70 dark:bg-emerald-950/40 backdrop-blur-3xl border border-slate-200/60 dark:border-emerald-800/50 rounded-[3rem] p-8 shadow-2xl h-full flex flex-col relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
          <Activity className="text-emerald-500" size={24} />
          Attendance Pulse
        </h2>
        <button
          onClick={onViewAll}
          className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-800 transition-colors"
        >
          Detailed Log
        </button>
      </div>

      <div className="flex flex-col items-center justify-center mb-10 mt-4 relative z-10">
        <div className="relative w-56 h-56 flex items-center justify-center">
            {/* Center Glow */}
            <div className="absolute inset-0 m-auto w-32 h-32 bg-emerald-500/20 blur-[40px] rounded-full z-0"></div>
            
            {/* Chart.js Doughnut */}
            <div className="absolute inset-0 z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
               <Doughnut data={chartData} options={chartOptions} />
            </div>
            
            {/* Inner Text */}
            <div className="text-center z-20 flex flex-col items-center pointer-events-none">
                <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm">{data.overallPercentage}%</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Average</span>
                <span className={`text-[10px] font-bold mt-2 px-3 py-1 rounded-lg backdrop-blur-md border border-white/10 ${data.trend.includes('Up') || data.trend.includes('+') ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                    {data.trend}
                </span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-auto relative z-10">
        <MetricBox icon={UserCheck} label="Present" value={data.present} color="text-emerald-500" bg="bg-emerald-500/10" border="group-hover:border-emerald-500/30" />
        <MetricBox icon={UserX} label="Absent" value={data.absent} color="text-rose-500" bg="bg-rose-500/10" border="group-hover:border-rose-500/30" />
        <MetricBox icon={Clock} label="Late" value={data.late} color="text-amber-500" bg="bg-amber-500/10" border="group-hover:border-amber-500/30" />
      </div>
    </div>
  );
}

function MetricBox({ icon: Icon, label, value, color, bg, border }: any) {
    return (
        <div className={`p-4 rounded-3xl bg-white/40 dark:bg-emerald-900/30 flex flex-col items-center justify-center text-center border border-slate-200/50 dark:border-emerald-700/40 transition-all duration-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg group cursor-pointer ${border}`}>
            <div className={`p-3 rounded-[1rem] mb-3 ${bg} ${color} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1 tracking-tighter group-hover:scale-105 transition-transform duration-300">{value}</span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-500 transition-colors">{label}</span>
        </div>
    );
}
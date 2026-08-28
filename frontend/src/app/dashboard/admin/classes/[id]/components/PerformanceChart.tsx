import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface PerformanceChartProps {
  performanceTrend?: any[];
  attendanceTrend?: any[];
  isLoading?: boolean;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  performanceTrend = [], 
  attendanceTrend = [], 
  isLoading 
}) => {
  const [view, setView] = useState<'performance' | 'attendance'>('performance');

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm h-[382px] flex flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Crunching analytics...</p>
      </div>
    );
  }

  const chartData = view === 'performance' ? performanceTrend : attendanceTrend;
  const hasData = chartData && chartData.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-black text-gray-900 dark:text-white capitalize tracking-tight">
            Class {view}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {view === 'performance' ? 'Average scores across recent assessments' : 'Attendance trends for the last 14 days'}
          </p>
        </div>
        
        <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setView('performance')}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
              view === 'performance' 
                ? 'bg-white dark:bg-gray-700 text-primary shadow-[0_4px_12px_-2px_rgba(0,0,0,0.1)]' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setView('attendance')}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
              view === 'attendance' 
                ? 'bg-white dark:bg-gray-700 text-primary shadow-[0_4px_12px_-2px_rgba(0,0,0,0.1)]' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Attendance
          </button>
        </div>
      </div>

      <div className="w-full h-72">
        {!hasData ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
             <div className="w-12 h-12 bg-gray-100 dark:bg-gray-850 rounded-full flex items-center justify-center mb-3 text-gray-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-3"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
             </div>
             <p className="text-sm font-bold text-gray-400 dark:text-gray-500">No data points captured yet</p>
             <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Start recording attendance or exams to see trends.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {view === 'performance' ? (
              <BarChart data={performanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis 
                  dataKey="label" 
                  stroke="#9CA3AF"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontWeight: 600 }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(54, 112, 226, 0.05)', radius: 8 }}
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    borderColor: '#374151',
                    borderRadius: '1rem',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(8px)',
                    padding: '12px'
                  }}
                  itemStyle={{ color: '#60A5FA', fontWeight: 800, fontSize: '14px' }}
                  labelStyle={{ color: '#D1D5DB', marginBottom: '6px', fontWeight: 700 }}
                  formatter={(value: any) => [`${value}%`, 'Avg. Score']}
                />
                <Bar 
                  dataKey="value" 
                  fill="#3670e2" 
                  radius={[8, 8, 4, 4]}
                  barSize={32}
                  animationBegin={0}
                  animationDuration={1500}
                />
              </BarChart>
            ) : (
              <LineChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis 
                  dataKey="label" 
                  stroke="#9CA3AF"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontWeight: 600 }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    borderColor: '#374151',
                    borderRadius: '1rem',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(8px)',
                    padding: '12px'
                  }}
                  itemStyle={{ color: '#10B981', fontWeight: 800, fontSize: '14px' }}
                  labelStyle={{ color: '#9CA3AF', marginBottom: '6px', fontWeight: 700 }}
                  formatter={(value: any) => [`${value}%`, 'Attendance']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10B981" 
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#10B981', strokeWidth: 3, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0, fill: '#10B981' }}
                  animationDuration={1500}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default PerformanceChart;
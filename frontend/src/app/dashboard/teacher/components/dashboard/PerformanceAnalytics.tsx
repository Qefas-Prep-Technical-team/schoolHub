/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Area, AreaChart,
  Area as RechartsArea 
} from 'recharts';
import { teacherService } from '@/lib/api/services/teacherService';
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export default function PerformanceAnalytics() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'semester'>('month');
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedSchoolId } = useDashboardStore();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await teacherService.getPerformanceTrends(selectedSchoolId, timeRange);
        setData(result.trends);
        setSummary(result.summary);
      } catch (error) {
        console.error('Failed to fetch performance trends:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedSchoolId, timeRange]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl ring-1 ring-black/5">
          <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-3">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: entry.color }} 
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {entry.name}:
                </span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  {entry.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-white/70 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            Performance Analytics
          </h2>
        </div>
        
        <div className="flex gap-1.5 bg-gray-100/50 dark:bg-gray-900/50 p-1 rounded-xl">
          {['week', 'month', 'semester'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                timeRange === range
                  ? 'bg-white dark:bg-gray-800 text-primary shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={`h-[280px] w-full transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3670e2" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3670e2" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorTop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.1} />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={15}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3670e2', strokeWidth: 1, strokeDasharray: '4 4' }} />
            
            <Area
              type="monotone"
              dataKey="top"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTop)"
              name="Top Score"
              animationDuration={1500}
            />
            <Area
              type="monotone"
              dataKey="average"
              stroke="#3670e2"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAvg)"
              name="Average"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
        <div className="flex gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Current Avg</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-gray-900 dark:text-white">
                {summary?.currentAvg || 0}%
              </span>
              {summary?.status === 'up' ? (
                <div className="flex items-center text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-md">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  <span className="text-[10px] font-bold">Trend</span>
                </div>
              ) : (
                <div className="flex items-center text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-md">
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                  <span className="text-[10px] font-bold">Trend</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Consistency</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-gray-900 dark:text-white">
                {summary?.currentAvg > 70 ? 'High' : summary?.currentAvg > 40 ? 'Medium' : 'Low'}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-end">
          <p className="text-[10px] font-bold text-gray-400 mb-2">SCORE DISTRIBUTION</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(54,112,226,0.5)]" />
              <span className="text-[10px] font-bold text-gray-500">Class Average</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-bold text-gray-500">Top Quartile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
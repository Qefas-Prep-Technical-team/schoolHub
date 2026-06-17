'use client'

import React from 'react'
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard'
import { useParentStore } from '@/lib/api/hooks/useParentStore'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'

export default function RecentPerformanceChart() {
  const { selectedChildId } = useParentStore()
  const { data, isLoading } = useParentDashboard(selectedChildId)

  const grades = data?.child?.recentGrades ?? []
  
  // Format data for Recharts: calculate percentage
  // Reverse to show chronologically from left to right (if recentGrades is desc)
  const chartData = [...grades].reverse().map((g) => {
    const pct = g.maxMarks > 0 ? Math.round((g.score / g.maxMarks) * 100) : 0
    return {
      name: g.subject.length > 12 ? g.subject.substring(0, 12) + '...' : g.subject,
      fullSubject: g.subject,
      score: pct,
      date: new Date(g.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }
  })

  const hasData = chartData.length > 0

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-white/10 flex flex-col h-full w-full transition-all duration-300 hover:shadow-xl hover:border-blue-500/30 overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-blue-600/10 text-blue-600 rounded-2xl ring-1 ring-blue-500/20">
          <span className="material-symbols-outlined text-[20px]">bar_chart</span>
        </div>
        <div className="flex flex-col">
          <h3 className="font-black text-[13px] text-slate-900 dark:text-white uppercase tracking-tight">Recent Academic Trend</h3>
          <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-0.5">Subject Analytics</span>
        </div>
      </div>

      <div className="h-[280px] w-full">
        {isLoading ? (
          <Skeleton className="w-full h-full rounded-xl" />
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">data_alert</span>
            <p className="text-xs uppercase tracking-widest font-black">No Grade Data Available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800 opacity-50" />
              <XAxis 
                dataKey="name" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} 
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-2xl text-xs font-bold shadow-2xl border border-slate-800 dark:border-slate-200">
                        <p className="mb-1 opacity-70 font-medium">{data.date}</p>
                        <p className="uppercase tracking-widest mb-1.5">{data.fullSubject}</p>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].color }} />
                            <span className="text-slate-100 dark:text-slate-900 font-black">{data.score}% Score</span>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="score" radius={[6, 6, 6, 6]} maxBarSize={48}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.score >= 70 ? '#10b981' : entry.score >= 50 ? '#f59e0b' : '#ef4444'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

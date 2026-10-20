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
import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react'
import { HeaderTooltip } from './HeaderTooltip'

export default function RecentPerformanceChart() {
  const { selectedChildId } = useParentStore()
  const { data, isLoading } = useParentDashboard(selectedChildId)

  const grades = data?.child?.recentGrades ?? []

  // Format data for Recharts: calculate percentage
  // Reverse to show chronologically from left to right (if recentGrades is desc)
  const chartData = [...grades].slice(0, 5).reverse().map((g) => {
    const pct = g.maxMarks > 0 ? Math.round((g.score / g.maxMarks) * 100) : 0
    return {
      name: g.subject.length > 8 ? g.subject.substring(0, 8) + '…' : g.subject,
      fullSubject: g.subject,
      score: pct,
      date: new Date(g.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }
  })

  const hasData = chartData.length > 0

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 flex flex-col w-full transition-all duration-300 hover:shadow-md overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl sm:rounded-2xl border border-orange-500/20 shrink-0">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                Recent Academic Trend
              </h3>
              <HeaderTooltip content="Tracks your child's recent assessment scores normalized to standard percentages (0-100%). Scores at or above 70% are highlighted in green, 50-69% in amber, and below 50% in red to highlight subjects requiring support." />
            </div>
            <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">
              Subject Analytics
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <TrendingUp size={13} className="text-orange-500" />
          <span>Last 5 Assessments</span>
        </div>
      </div>

      <div className="h-[210px] sm:h-[260px] md:h-[280px] w-full">
        {isLoading ? (
          <Skeleton className="w-full h-full rounded-xl" />
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 py-8">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 mb-2 opacity-40 text-orange-400" />
            <p className="text-xs uppercase tracking-widest font-black">No Grade Data Available</p>
            <p className="text-[11px] text-slate-400 mt-1">Grades will appear here once teachers record term scores.</p>
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
                cursor={{ fill: 'rgba(249, 115, 22, 0.05)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload
                    return (
                      <div className="bg-slate-900 dark:bg-slate-800 text-white p-3 rounded-xl text-xs font-bold shadow-2xl border border-slate-700/60">
                        <p className="mb-0.5 text-slate-400 font-medium text-[10px]">{d.date}</p>
                        <p className="uppercase tracking-wider mb-1.5 text-white font-black">{d.fullSubject}</p>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].color }} />
                          <span className="font-black text-orange-400">{d.score}% Score</span>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="score" radius={[6, 6, 6, 6]} maxBarSize={44}>
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

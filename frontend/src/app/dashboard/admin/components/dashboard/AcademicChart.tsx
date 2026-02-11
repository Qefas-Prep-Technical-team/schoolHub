'use client';

import { BarChart3, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import DonutChart from './DonutChart';

export default function AcademicChart() {
  const [performanceData] = useState([
    { name: 'Excellent (A- to A+)', value: 45, color: '#10B981' },
    { name: 'Good (C+ to B+)', value: 35, color: '#3B82F6' },
    { name: 'At Risk (< C)', value: 20, color: '#F87171' },
  ]);

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Academic Performance
        </h3>
        <button className="text-xs font-semibold text-primary hover:bg-primary/5 px-2 py-1 rounded transition-colors">
          View Details
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Donut Chart */}
        <div className="flex-shrink-0">
          <DonutChart
            data={performanceData}
            innerRadius={40}
            outerRadius={60}
            centerLabel={{
              title: 'Avg Grade',
              value: 'B+',
            }}
          />
        </div>

        {/* Legend & Details */}
        <div className="flex flex-col gap-3 flex-1">
          {performanceData.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 dark:text-slate-300">
                  {item.name}
                </span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">
                {item.value}%
              </span>
            </div>
          ))}

          {/* Stats */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Top Performing Class
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Grade 10-A (Math)
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Improvement
              </p>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                <TrendingUp className="h-3 w-3" />
                +12% vs last term
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
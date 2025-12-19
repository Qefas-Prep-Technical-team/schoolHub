'use client';

import { Users, UserX, Building, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

import { useState } from 'react';
import ProgressBar from './ui/ProgressBar';

interface StaffInsight {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  severity: 'high' | 'medium' | 'low';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function StaffInsights() {
  const [workload, setWorkload] = useState(65);
  const [insights] = useState<StaffInsight[]>([
    {
      id: '1',
      title: '2 Unassigned Teachers',
      description: 'New hires pending class allocation. Needs immediate attention.',
      icon: UserX,
      iconColor: 'text-red-600 dark:text-red-400',
      iconBg: 'bg-red-100 dark:bg-red-900/20',
      severity: 'high',
      action: {
        label: 'Assign Now',
        onClick: () => console.log('Assign teachers'),
      },
    },
    {
      id: '2',
      title: 'Grade 8-B: No Class Teacher',
      description: 'Previous teacher resigned last week. Temporary substitute assigned.',
      icon: Building,
      iconColor: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-100 dark:bg-orange-900/20',
      severity: 'medium',
      action: {
        label: 'View Class',
        onClick: () => console.log('View class details'),
      },
    },
    {
      id: '3',
      title: 'High Workload: Math Dept',
      description: '3 teachers handling extra classes due to staff shortage.',
      icon: AlertTriangle,
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-100 dark:bg-amber-900/20',
      severity: 'medium',
      action: {
        label: 'Review Schedule',
        onClick: () => console.log('Review schedule'),
      },
    },
  ]);

  const getSeverityColor = (severity: StaffInsight['severity']) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-orange-600 dark:text-orange-400';
      case 'low':
        return 'text-emerald-600 dark:text-emerald-400';
    }
  };

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Staff Insights
          </h3>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              85 Teachers
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <div
              key={insight.id}
              className="p-4 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`${insight.iconBg} p-2 rounded-lg`}>
                  <Icon className={`${insight.iconColor} h-5 w-5`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {insight.title}
                    </h4>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getSeverityColor(insight.severity)} bg-opacity-10`}>
                      {insight.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                    {insight.description}
                  </p>
                  {insight.action && (
                    <button
                      onClick={insight.action.onClick}
                      className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      {insight.action.label} →
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workload Overview */}
      <div className="mt-auto px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Teacher Workload Distribution
              </span>
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {workload}% Average
            </span>
          </div>

          <ProgressBar
            value={workload}
            color={workload > 80 ? 'bg-red-500' : workload > 60 ? 'bg-amber-500' : 'bg-emerald-500'}
            showLabel={false}
            height="lg"
          />

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-emerald-600 dark:text-emerald-400 font-bold">24%</div>
              <div className="text-slate-500">Light Load</div>
            </div>
            <div className="text-center">
              <div className="text-amber-600 dark:text-amber-400 font-bold">56%</div>
              <div className="text-slate-500">Moderate</div>
            </div>
            <div className="text-center">
              <div className="text-red-600 dark:text-red-400 font-bold">20%</div>
              <div className="text-slate-500">Heavy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
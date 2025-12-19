'use client';

import { UserPlus, FileText, Megaphone, MoreHorizontal, Users, Calendar, Download, Settings } from 'lucide-react';
import { useState } from 'react';

interface Action {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  iconColor: string;
  bgColor: string;
  onClick?: () => void;
}

export default function QuickActions() {
  const [actions] = useState<Action[]>([
    {
      id: 'add-student',
      title: 'Add Student',
      icon: UserPlus,
      description: 'Enroll new student',
      color: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      onClick: () => console.log('Add Student clicked'),
    },
    {
      id: 'publish-results',
      title: 'Publish Results',
      icon: FileText,
      description: 'Release exam grades',
      color: 'border-emerald-200 dark:border-emerald-800',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      onClick: () => console.log('Publish Results clicked'),
    },
    {
      id: 'announce',
      title: 'Announce',
      icon: Megaphone,
      description: 'Send notifications',
      color: 'border-amber-200 dark:border-amber-800',
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      onClick: () => console.log('Announce clicked'),
    },
    {
      id: 'manage-staff',
      title: 'Manage Staff',
      icon: Users,
      description: 'Teacher assignments',
      color: 'border-purple-200 dark:border-purple-800',
      iconColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      onClick: () => console.log('Manage Staff clicked'),
    },
    {
      id: 'schedule',
      title: 'Schedule',
      icon: Calendar,
      description: 'Create timetable',
      color: 'border-indigo-200 dark:border-indigo-800',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      onClick: () => console.log('Schedule clicked'),
    },
    {
      id: 'export-data',
      title: 'Export Data',
      icon: Download,
      description: 'Download reports',
      color: 'border-teal-200 dark:border-teal-800',
      iconColor: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      onClick: () => console.log('Export Data clicked'),
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      description: 'System configuration',
      color: 'border-slate-200 dark:border-slate-800',
      iconColor: 'text-slate-600 dark:text-slate-400',
      bgColor: 'bg-slate-50 dark:bg-slate-900/20',
      onClick: () => console.log('Settings clicked'),
    },
    {
      id: 'more',
      title: 'More',
      icon: MoreHorizontal,
      description: 'Additional actions',
      color: 'border-gray-200 dark:border-gray-800',
      iconColor: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      onClick: () => console.log('More clicked'),
    },
  ]);

  const [showMore, setShowMore] = useState(false);
  const visibleActions = showMore ? actions : actions.slice(0, 4);

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm uppercase text-slate-400 tracking-wider">
          Quick Shortcuts
        </h3>
        {actions.length > 4 && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            {showMore ? 'Show Less' : `+${actions.length - 4} More`}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {visibleActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border ${action.color} ${action.bgColor} hover:border-primary/50 hover:scale-[1.02] transition-all group`}
            >
              <div className={`p-2 rounded-lg ${action.bgColor} group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors`}>
                <Icon className={`h-5 w-5 ${action.iconColor} group-hover:text-primary transition-colors`} />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors text-center">
                {action.title}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-primary/70 transition-colors text-center">
                {action.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Action Modal */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {actions.length} available actions
          </p>
          <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
            Customize
            <Settings className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
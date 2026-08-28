'use client';

import { UserPlus, FileText, Megaphone, MoreHorizontal, Users, Calendar, Download, Settings, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Action {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  description: string;
  color: string;
  iconColor: string;
  bgColor: string;
  href: string;
}

export default function QuickActions({ primaryColor = '#2563eb' }: { primaryColor?: string }) {
  const router = useRouter();
  const [actions] = useState<Action[]>([
    {
      id: 'add-student',
      title: 'Add Student',
      icon: UserPlus,
      description: 'Enroll new student',
      color: 'border-blue-500/20',
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      href: '/dashboard/admin/students?showAdd=true',
    },
    {
      id: 'publish-results',
      title: 'Publish Results',
      icon: FileText,
      description: 'Release exam grades',
      color: 'border-emerald-500/20',
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      href: '/dashboard/admin/grades',
    },
    {
      id: 'announce',
      title: 'Announce',
      icon: Megaphone,
      description: 'Send notifications',
      color: 'border-amber-500/20',
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      href: '/dashboard/admin/notifications',
    },
    {
      id: 'manage-staff',
      title: 'Manage Staff',
      icon: Users,
      description: 'Teacher assignments',
      color: 'border-purple-500/20',
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50',
      href: '/dashboard/admin/teachers',
    },
    {
      id: 'schedule',
      title: 'Schedule',
      icon: Calendar,
      description: 'Create timetable',
      color: '', // Will use custom
      iconColor: '',
      bgColor: '',
      href: '/dashboard/admin/classes',
    },
    {
      id: 'export-data',
      title: 'Export Data',
      icon: Download,
      description: 'Download reports',
      color: 'border-teal-500/20',
      iconColor: 'text-teal-500',
      bgColor: 'bg-teal-50',
      href: '/dashboard/admin/attendance',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      description: 'System configuration',
      color: 'border-slate-500/20',
      iconColor: 'text-slate-500',
      bgColor: 'bg-slate-50',
      href: '/dashboard/admin/settings',
    },
  ]);

  const [showMore, setShowMore] = useState(false);
  const visibleActions = showMore ? actions : actions.slice(0, 4);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-white">Quick Actions</h3>
            <p className="text-xs text-slate-500">Shortcuts to common tasks</p>
        </div>
        {actions.length > 4 && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="text-xs font-semibold transition-colors hover:opacity-80"
            style={{ color: primaryColor }}
          >
            {showMore ? 'Show Less' : 'View All'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {visibleActions.map((action, idx) => {
          const Icon = action.icon;
          const isCustom = action.id === 'schedule';

          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => router.push(action.href)}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
            >
              <div
                className={cn(
                  "p-2.5 rounded-xl transition-transform group-hover:scale-105",
                  !isCustom && action.bgColor,
                  !isCustom && action.iconColor,
                  !isCustom && "dark:bg-opacity-10"
                )}
                style={isCustom ? { backgroundColor: `${primaryColor}15`, color: primaryColor } : {}}
              >
                <Icon size={18} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {action.title}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}


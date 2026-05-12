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
      bgColor: 'bg-blue-500/10',
      href: '/dashboard/admin/students?showAdd=true',
    },
    {
      id: 'publish-results',
      title: 'Publish Results',
      icon: FileText,
      description: 'Release exam grades',
      color: 'border-emerald-500/20',
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      href: '/dashboard/admin/grades',
    },
    {
      id: 'announce',
      title: 'Announce',
      icon: Megaphone,
      description: 'Send notifications',
      color: 'border-amber-500/20',
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      href: '/dashboard/admin/notifications',
    },
    {
      id: 'manage-staff',
      title: 'Manage Staff',
      icon: Users,
      description: 'Teacher assignments',
      color: 'border-purple-500/20',
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
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
      bgColor: 'bg-teal-500/10',
      href: '/dashboard/admin/grades',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      description: 'System configuration',
      color: 'border-slate-500/20',
      iconColor: 'text-slate-500',
      bgColor: 'bg-slate-500/10',
      href: '/dashboard/admin/settings',
    },
  ]);

  const [showMore, setShowMore] = useState(false);
  const visibleActions = showMore ? actions : actions.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-black text-[10px] uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em]">
          Quick Actions
        </h3>
        {actions.length > 4 && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="text-[10px] font-black hover:text-white transition-all uppercase tracking-widest"
            style={{ color: primaryColor }}
          >
            {showMore ? 'Show Less' : `+${actions.length - 4} More`}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {visibleActions.map((action, idx) => {
          const Icon = action.icon;
          const isCustom = action.id === 'schedule';

          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => router.push(action.href)}
              className={cn(
                "flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] border transition-all duration-500 group relative overflow-hidden",
                "bg-white/10 dark:bg-black/20 border-white/10 hover:bg-white/20",
                "active:scale-95"
              )}
              style={{
                '--hover-border': `${primaryColor}50`,
                '--shadow-hover': `${primaryColor}10`,
                boxShadow: `0 10px 15px -3px ${primaryColor}10`
              } as any}
            >
              <div
                className={cn(
                  "p-3 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                  !isCustom && action.bgColor,
                  !isCustom && action.iconColor
                )}
                style={isCustom ? { backgroundColor: `${primaryColor}15`, color: primaryColor } : {}}
              >
                <Icon size={20} strokeWidth={2.5} />
              </div>
              <div className="text-center space-y-1 relative z-10">
                <span className="text-[11px] font-black text-white uppercase tracking-tight italic block">
                  {action.title}
                </span>
                <span className="text-[9px] text-white/50 font-bold uppercase tracking-widest block opacity-0 group-hover:opacity-100 transition-opacity">
                  Open
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Quick Action Footer */}
      <div className="pt-4 border-t border-white/5 flex items-center justify-between px-2 opacity-60">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {actions.length} Shortcuts Available
        </p>
        <Link
          href="/dashboard/admin/settings"
          className="text-[9px] font-black hover:text-white transition-all uppercase flex items-center gap-1 tracking-widest"
          style={{ color: primaryColor }}
        >
          Settings <Settings size={10} />
        </Link>
      </div>
    </div>
  );
}


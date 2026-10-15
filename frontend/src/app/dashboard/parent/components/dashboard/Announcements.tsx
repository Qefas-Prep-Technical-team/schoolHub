'use client'

import { format, parseISO } from 'date-fns'
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { useParentStore } from '@/lib/api/hooks/useParentStore'
import Link from 'next/link'
import { Bell, BellOff, ChevronRight } from 'lucide-react'
import { HeaderTooltip } from './HeaderTooltip'

const typeConfig: Record<string, { label: string; dot: string; badge: string }> = {
  LINK_REQUEST:    { label: 'Link', dot: 'bg-orange-500 ring-orange-500/20', badge: 'text-orange-600 bg-orange-600/10 border-orange-500/20 dark:text-orange-400' },
  LINK_ACCEPTED:   { label: 'Link', dot: 'bg-emerald-500 ring-emerald-500/20', badge: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400' },
  SYSTEM:          { label: 'System', dot: 'bg-slate-300 dark:bg-slate-700 ring-slate-100 dark:ring-slate-800', badge: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' },
  BEHAVIOUR_ALERT: { label: 'Alert', dot: 'bg-rose-500 ring-rose-500/20', badge: 'text-rose-600 bg-rose-500/10 border-rose-500/20 dark:text-rose-400' },
  ACADEMIC:        { label: 'Academic', dot: 'bg-indigo-500 ring-indigo-500/20', badge: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20 dark:text-indigo-400' },
}

const getConfig = (type: string) =>
  typeConfig[type] ?? { label: 'General', dot: 'bg-slate-300 dark:bg-slate-700 ring-slate-100', badge: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' }

export default function Announcements() {
  const { selectedChildId } = useParentStore()
  const { data, isLoading } = useParentDashboard(selectedChildId)
  const notifications = data?.notifications ?? []

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 h-full flex flex-col overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl sm:rounded-2xl border border-orange-500/20 shrink-0">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                Activity Feed
              </h3>
              <HeaderTooltip content="Chronological log of official school notices, teacher alerts, upcoming term events, and student linking requests." />
            </div>
            <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">
              School Updates
            </span>
          </div>
        </div>
        
        <Link 
          href="/dashboard/parent/notifications" 
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-500/40 hover:text-orange-600 text-slate-600 dark:text-slate-300 transition-all text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm shrink-0"
        >
          <span>All</span>
          <ChevronRight size={12} />
        </Link>
      </div>

      <div className="p-3 sm:p-4 flex flex-col gap-3 overflow-y-auto max-h-[460px]">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3.5 p-3.5">
              <Skeleton className="h-3 w-3 rounded-full mt-1.5 shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-4 w-32 rounded-lg" />
                <Skeleton className="h-3 w-full rounded-lg" />
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-slate-400 flex items-center justify-center mb-2">
              <BellOff className="w-6 h-6 opacity-60" />
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-widest">No notifications yet</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs">New announcements and activity updates from teachers will display here.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const cfg = getConfig(n.type)
            return (
              <div 
                key={n.id} 
                className="group flex gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-2xl hover:bg-orange-500/[0.04] dark:hover:bg-slate-800/50 border border-transparent hover:border-orange-500/10 transition-all duration-200"
              >
                <div className="flex flex-col items-center pt-1.5 min-w-[16px] sm:min-w-[20px]">
                  <div className={`size-2.5 sm:size-3 rounded-full ring-4 ${cfg.dot}`} />
                  <div className="w-[1.5px] h-full bg-slate-100 dark:bg-slate-800 mt-2 group-last:hidden" />
                </div>

                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border w-fit ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tight self-start sm:self-auto">
                      {format(parseISO(n.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <h5 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight group-hover:text-orange-600 transition-colors truncate">
                    {n.title}
                  </h5>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2">
                    {n.message}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

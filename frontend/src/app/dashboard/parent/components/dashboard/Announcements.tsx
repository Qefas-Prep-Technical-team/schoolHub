'use client'
import { format, parseISO } from 'date-fns'
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { useParentStore } from '@/lib/api/hooks/useParentStore'

const typeConfig: Record<string, { label: string; dot: string; badge: string }> = {
  LINK_REQUEST:    { label: 'Link', dot: 'bg-orange-500 ring-orange-500/20', badge: 'text-orange-600 bg-orange-600/10 border-orange-500/20' },
  LINK_ACCEPTED:   { label: 'Link', dot: 'bg-emerald-500 ring-emerald-500/20', badge: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
  SYSTEM:          { label: 'System', dot: 'bg-slate-300 dark:bg-slate-700 ring-slate-100 dark:ring-slate-800', badge: 'text-slate-500 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10' },
  BEHAVIOUR_ALERT: { label: 'Alert', dot: 'bg-rose-500 ring-rose-500/20', badge: 'text-rose-600 bg-rose-500/10 border-rose-500/20' },
}

const getConfig = (type: string) =>
  typeConfig[type] ?? { label: 'General', dot: 'bg-slate-300 dark:bg-slate-700 ring-slate-100', badge: 'text-slate-500 bg-slate-100 border-slate-200' }

export default function Announcements() {
  const { selectedChildId } = useParentStore()
  const { data, isLoading } = useParentDashboard(selectedChildId)
  const notifications = data?.notifications ?? []

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/50 dark:border-white/10 h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
        <div className="flex flex-col">
          <h3 className="font-black text-[14px] text-slate-900 dark:text-white uppercase tracking-tight">Notifications</h3>
          <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">School Updates</span>
        </div>
        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:border-orange-500/30 transition-all text-slate-500 hover:text-orange-600">
          <span className="material-symbols-outlined text-[20px]">filter_list</span>
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[500px]">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4">
              <Skeleton className="h-3 w-3 rounded-full mt-1.5" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-4 w-32 rounded-lg" />
                <Skeleton className="h-3 w-full rounded-lg" />
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-[40px] text-slate-300 dark:text-slate-700 mb-3">notifications_off</span>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n, index) => {
            const cfg = getConfig(n.type)
            return (
              <div key={n.id} className="group flex gap-4 p-4 rounded-2xl hover:bg-orange-500/[0.03] dark:hover:bg-white/[0.02] border border-transparent hover:border-orange-500/10 transition-all duration-300">
                <div className="flex flex-col items-center pt-1.5 min-w-[24px]">
                  <div className={`size-3 rounded-full ring-4 ${cfg.dot}`} />
                  <div className="w-[1.5px] h-full bg-slate-100 dark:bg-white/5 mt-2 group-last:hidden" />
                </div>

                <div className="flex-1 pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      {format(parseISO(n.createdAt), 'MMM d')}
                    </span>
                  </div>
                  <h5 className="text-[14px] font-black text-slate-900 dark:text-white mb-1.5 uppercase tracking-tight group-hover:text-orange-600 transition-colors">
                    {n.title}
                  </h5>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
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

import React from 'react'

interface Announcement {
  type: 'urgent' | 'events' | 'general'
  typeLabel: string
  title: string
  content: string
  time: string
  color: string
  bgColor: string
}

const announcements: Announcement[] = [
  {
    type: 'urgent',
    typeLabel: 'Urgent',
    title: 'School Closing Early',
    content: 'Due to severe weather conditions, the school will close at 1:00 PM today. Buses will depart at 1:15 PM.',
    time: 'Today',
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
  },
  {
    type: 'events',
    typeLabel: 'Events',
    title: 'Annual Sports Day',
    content: 'Registration for the Annual Sports Day is now open. Please sign up your child before Friday.',
    time: 'Yesterday',
    color: 'text-primary',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    type: 'general',
    typeLabel: 'General',
    title: 'Library Fine Update',
    content: 'The library has updated its policy on late returns. Please review the new handbook.',
    time: 'Oct 20',
    color: 'text-slate-500',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
  },
]

export default function Announcements() {
  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/50 dark:border-white/10 h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
        <div className="flex flex-col">
          <h3 className="font-black text-[14px] text-slate-900 dark:text-white uppercase tracking-tight">Announcements</h3>
          <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">School Updates</span>
        </div>
        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:border-orange-500/30 transition-all text-slate-500 hover:text-orange-600">
          <span className="material-symbols-outlined text-[20px]">filter_list</span>
        </button>
      </div>
      
      <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[500px]">
        {announcements.map((announcement, index) => (
          <div key={index} className="group flex gap-4 p-4 rounded-2xl hover:bg-orange-500/[0.03] dark:hover:bg-white/[0.02] border border-transparent hover:border-orange-500/10 transition-all duration-300">
            <div className="flex flex-col items-center pt-1.5 min-w-[24px]">
              <div className={`size-3 rounded-full ring-4 ${
                announcement.type === 'urgent' 
                  ? 'bg-rose-500 ring-rose-500/20' 
                  : announcement.type === 'events' 
                  ? 'bg-orange-500 ring-orange-500/20' 
                  : 'bg-slate-300 dark:bg-slate-700 ring-slate-100 dark:ring-slate-800'
              }`}></div>
              <div className="w-[1.5px] h-full bg-slate-100 dark:bg-white/5 mt-2 group-last:hidden"></div>
            </div>
            
            <div className="flex-1 pb-2">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                  announcement.type === 'urgent' 
                    ? 'text-rose-600 bg-rose-500/10 border-rose-500/20' 
                    : announcement.type === 'events' 
                    ? 'text-orange-600 bg-orange-600/10 border-orange-500/20' 
                    : 'text-slate-500 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10'
                }`}>
                  {announcement.typeLabel}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{announcement.time}</span>
              </div>
              
              <h5 className="text-[14px] font-black text-slate-900 dark:text-white mb-1.5 uppercase tracking-tight group-hover:text-orange-600 transition-colors">
                {announcement.title}
              </h5>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {announcement.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

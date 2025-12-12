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
    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark h-full flex flex-col">
      <div className="p-5 border-b border-border-light dark:border-border-dark flex items-center justify-between">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Announcements</h3>
        <div className="flex gap-1">
          <button className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
          </button>
        </div>
      </div>
      
      <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[400px]">
        {announcements.map((announcement, index) => (
          <div key={index} className="flex gap-3 group cursor-pointer">
            <div className="flex flex-col items-center pt-1">
              <div className={`size-2 rounded-full ${announcement.type === 'urgent' ? 'bg-red-500' : announcement.type === 'events' ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
              <div className="w-0.5 h-full bg-border-light dark:bg-border-dark mt-1 group-last:hidden"></div>
            </div>
            
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${announcement.color} ${announcement.bgColor} px-2 py-0.5 rounded`}>
                  {announcement.typeLabel}
                </span>
                <span className="text-xs text-slate-400">{announcement.time}</span>
              </div>
              
              <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                {announcement.title}
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {announcement.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
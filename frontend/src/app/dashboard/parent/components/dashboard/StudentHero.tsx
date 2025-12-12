import React from 'react'
import Image from 'next/image'

interface QuickStat {
  value: string
  label: string
  color?: string
}

const quickStats: QuickStat[] = [
  { value: '94%', label: 'Attendance' },
  { value: 'A', label: 'Avg Grade', color: 'text-primary' },
  { value: '5th', label: 'Rank' },
]

export default function StudentHero() {
  return (
    <section className="bg-card-light dark:bg-card-dark rounded-2xl shadow-sm border border-border-light dark:border-border-dark p-6 relative overflow-hidden group">
      {/* Decorative bg element */}
      <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-blue-50/50 to-transparent dark:from-blue-900/10 pointer-events-none"></div>
      
      <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between relative z-10">
        {/* Left: Profile Info */}
        <div className="flex items-center gap-6">
          <div className="relative size-24 rounded-2xl overflow-hidden shadow-md shrink-0">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtYQGsQxpWDPjkR1Gc6fCz4zvcONBzHK1dYhTDBYcJU2eObiYEeiQ5sGmCAbCk9Ulqg7Th8Xa0NMsdQWCM-SU4vTt5bDwyfUs3AYseftef_p9mkaiqPui4qUKlekjJvqLOlnmURLxBN3uB36QIghGl7_a6b7wVjMpSw7VfpJmLEJLmFBRWTl3ZxKWOHgeigySngFEZvx_UcJVoie6CH6H4Irln9g0gDfpqKdKHuxjgbvK4TwqBefMErjxTQrZkOHieInMkmXc-y7U"
              alt="Portrait of student Emily Johnson"
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Emily Johnson</h2>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full border border-green-200 dark:border-green-900/50">
                Excellent Standing
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Class 5-B • Section A • ID: #883921</p>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 bg-background-light dark:bg-background-dark px-2.5 py-1 rounded-lg border border-border-light dark:border-border-dark">
                <span className="material-symbols-outlined text-primary text-[18px]">cake</span>
                <span>11 Years Old</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Middle: Quick Stats */}
        <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto pb-2 lg:pb-0">
          {quickStats.map((stat, index) => (
            <div 
              key={index}
              className="flex flex-col items-center p-3 min-w-[100px] rounded-xl bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark"
            >
              <span className={`text-2xl font-bold ${stat.color || 'text-slate-900 dark:text-white'}`}>
                {stat.value}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
        
        {/* Right: Actions */}
        <div className="flex flex-row lg:flex-col gap-3 shrink-0">
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-lg shadow-blue-500/20">
            <span className="material-symbols-outlined text-[20px]">mail</span>
            <span>Message Teacher</span>
          </button>
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors">
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span>Download Report</span>
          </button>
        </div>
      </div>
    </section>
  )
}
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
    <section className="relative overflow-hidden group bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-slate-200/50 dark:border-white/10 p-8 lg:p-10">
      {/* Premium Decorative elements */}
      <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-orange-500/10 via-orange-500/[0.02] to-transparent pointer-events-none transition-opacity duration-1000 group-hover:opacity-60" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-600/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row gap-10 lg:items-center justify-between relative z-10">
        {/* Left: Profile Info */}
        <div className="flex items-center gap-8">
          <div className="relative group/avatar">
            <div className="absolute -inset-2 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-[2rem] blur-xl opacity-20 group-hover/avatar:opacity-40 transition-opacity duration-500" />
            <div className="relative size-32 rounded-[1.8rem] overflow-hidden shadow-2xl ring-4 ring-white dark:ring-slate-800 transition-transform duration-700 group-hover/avatar:scale-[1.02]">
                <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtYQGsQxpWDPjkR1Gc6fCz4zvcONBzHK1dYhTDBYcJU2eObiYEeiQ5sGmCAbCk9Ulqg7Th8Xa0NMsdQWCM-SU4vTt5bDwyfUs3AYseftef_p9mkaiqPui4qUKlekjJvqLOlnmURLxBN3uB36QIghGl7_a6b7wVjMpSw7VfpJmLEJLmFBRWTl3ZxKWOHgeigySngFEZvx_UcJVoie6CH6H4Irln9g0gDfpqKdKHuxjgbvK4TwqBefMErjxTQrZkOHieInMkmXc-y7U"
                alt="Portrait of student Emily Johnson"
                fill
                className="object-cover"
                sizes="128px"
                />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Emily Johnson</h2>
              <div className="px-4 py-1.5 bg-orange-600/10 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-orange-500/20 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-600 animate-pulse" />
                Excellent Standing
              </div>
            </div>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Class 5-B • Section A • ID: <span className="text-orange-600">#883921</span></p>
            
            <div className="flex items-center gap-6 mt-3">
              <div className="flex items-center gap-2.5 text-[11px] font-black text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-white/5 px-4 py-2 rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-sm transition-all hover:border-orange-500/30">
                <span className="material-symbols-outlined text-orange-600 text-[18px]">cake</span>
                <span className="uppercase tracking-widest">11 Years Old</span>
              </div>
              <div className="flex items-center gap-2.5 text-[11px] font-black text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-white/5 px-4 py-2 rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-sm transition-all hover:border-orange-500/30">
                <span className="material-symbols-outlined text-orange-600 text-[18px]">location_on</span>
                <span className="uppercase tracking-widest">Lagos Campus</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Middle: Quick Stats */}
        <div className="flex items-center gap-4 sm:gap-10 overflow-x-auto pb-4 lg:pb-0 px-2">
          {quickStats.map((stat, index) => (
            <div 
              key={index}
              className="group/stat flex flex-col items-center p-5 min-w-[120px] rounded-3xl bg-white/40 dark:bg-white/[0.02] border border-white/60 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 hover:border-orange-500/30"
            >
              <span className={`text-3xl font-black tracking-tighter ${stat.color ? 'text-orange-600' : 'text-slate-900 dark:text-white'}`}>
                {stat.value}
              </span>
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 group-hover/stat:text-orange-500 transition-colors text-center w-full">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
        
        {/* Right: Actions */}
        <div className="flex flex-row lg:flex-col gap-4 shrink-0">
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all duration-500 shadow-2xl shadow-orange-600/30 active:scale-[0.98]">
            <span className="material-symbols-outlined text-[20px]">mail</span>
            <span>Contact Teacher</span>
          </button>
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:bg-orange-600 hover:text-white px-8 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all duration-500 group/btn active:scale-[0.98]">
            <span className="material-symbols-outlined text-[20px] text-orange-600 group-hover/btn:text-white">download</span>
            <span>Academic Report</span>
          </button>
        </div>
      </div>
    </section>
  )
}

"use client"

import Link from "next/link"

interface StatCard {
  title: string
  value: string
  description: string
  trend?: {
    value: string
    isPositive: boolean
  }
  icon: string
  iconColor?: string
  progress?: number
  accentColor?: string
}

export default function StatCards() {
  const stats: StatCard[] = [
    {
      title: 'Term Average',
      value: '88%',
      description: 'GPA: 3.8/4.0',
      trend: { value: '+5%', isPositive: true },
      icon: 'analytics',
      accentColor: 'bg-green-500'
    },
    {
      title: 'Class Rank',
      value: 'Top 5%',
      description: '2nd of 34 students',
      icon: 'leaderboard',
      progress: 95
    },
    {
      title: 'Best Subject',
      value: 'Mathematics',
      description: '98% Avg Score',
      icon: 'star',
      iconColor: 'text-yellow-500 icon-filled'
    },
    {
      title: 'Needs Attention',
      value: 'Physics',
      description: '72% - Upcoming Test',
      icon: 'warning',
      iconColor: 'text-orange-500'
    }
  ]
  const handleLink =(type:string)=>{

    switch(type){
      case "Term Average":
      return "/dashboard/parent/exams&results/analytics";
      break;
      case "Class Rank" :
      return "/dashboard/parent/exams&results/report-card";
      break;
    }
     
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <Link
        href={`${handleLink(stat.title)}`}
          key={index}
          className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-border-light dark:border-border-dark shadow-sm flex flex-col justify-between h-40 relative overflow-hidden group"
        >
          {/* Accent bar for first card */}
          {stat.accentColor && (
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${stat.accentColor}`}></div>
          )}
          
          {/* Background icon */}
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-8xl text-primary">
              {stat.icon}
            </span>
          </div>

          <div className="flex justify-between items-start z-10">
            <p className="text-text-secondary text-sm font-medium">{stat.title}</p>
            {stat.trend && (
              <span className={`${
                stat.trend.isPositive 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              } text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1`}>
                <span className="material-symbols-outlined text-[14px]">
                  {stat.trend.isPositive ? 'trending_up' : 'trending_down'}
                </span>
                {stat.trend.value}
              </span>
            )}
            {stat.iconColor && !stat.trend && (
              <span className={`material-symbols-outlined ${stat.iconColor}`}>
                {stat.icon}
              </span>
            )}
          </div>

          <div className="z-10">
            <p className="text-4xl font-black text-text-main dark:text-white tracking-tight">
              {stat.value}
            </p>
            <p className="text-text-secondary text-sm mt-1">{stat.description}</p>
            
            {stat.progress !== undefined && (
              <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full" 
                  style={{ width: `${stat.progress}%` }}
                ></div>
              </div>
            )}
          </div>
        </Link>
      ))}
    </section>
  )
}
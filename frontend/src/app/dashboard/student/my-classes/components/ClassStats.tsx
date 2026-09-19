import { cn } from '@/lib/utils';

interface ClassStatsProps {
  totalClasses: number;
}

export function ClassStats({ totalClasses }: ClassStatsProps) {
  const stats = [
    { 
      title: 'Enrolled Classes', 
      value: totalClasses, 
      subtitle: 'Todays', 
      change: '+11%', 
      changeColor: 'text-pink-600', 
      headerBg: 'bg-pink-600', 
      chartColor: 'text-pink-600',
      chartType: 'bars' 
    },
    { 
      title: 'Total Subjects', 
      value: `${totalClasses * 2}`, 
      subtitle: 'Todays', 
      change: '-6.5%', 
      changeColor: 'text-rose-500', 
      headerBg: 'bg-fuchsia-500', 
      chartColor: 'text-fuchsia-500',
      chartType: 'circle' 
    },
    { 
      title: 'Exam Attempts', 
      value: '03', 
      subtitle: 'Todays', 
      change: '+09%', 
      changeColor: 'text-pink-500', 
      headerBg: 'bg-rose-500', 
      chartColor: 'text-rose-500',
      chartType: 'bars' 
    },
    { 
      title: 'Overall Rank', 
      value: '05', 
      subtitle: 'Todays', 
      change: '+31%', 
      changeColor: 'text-pink-600', 
      headerBg: 'bg-pink-500', 
      chartColor: 'text-pink-500',
      chartType: 'siren' 
    },
  ];

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Overview</h2>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-300">
            Md Rayhan Islam ▼
          </button>
          <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-300">
            Central Clinic, Dhaka ▼
          </button>
          <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-300">
            Todays ▼
          </button>
        </div>
      </div>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <div className={cn("p-4 text-white font-medium text-lg", stat.headerBg)}>
                {stat.title}
              </div>
              <div className="p-6 flex items-center justify-between flex-grow">
                  <div className={cn("flex-shrink-0 w-16 h-16 relative flex items-center justify-center", stat.chartColor)}>
                    {stat.chartType === 'circle' && (
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="6" fill="none" />
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" strokeDasharray="176" strokeDashoffset="60" strokeLinecap="round" />
                      </svg>
                    )}
                    {stat.chartType === 'siren' && (
                       <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="6" fill="none" />
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" strokeDasharray="176" strokeDashoffset="120" strokeLinecap="round" />
                      </svg>
                    )}
                    {stat.chartType === 'bars' && (
                      <div className="flex items-end gap-1 h-12 w-full pt-2">
                        <div className="w-2 bg-slate-200 dark:bg-slate-700 rounded-t-sm h-full"></div>
                        <div className="w-2 bg-slate-200 dark:bg-slate-700 rounded-t-sm h-3/4"></div>
                        <div className="w-2 bg-slate-200 dark:bg-slate-700 rounded-t-sm h-1/2"></div>
                        <div className="w-2 rounded-t-sm h-full bg-current"></div>
                        <div className="w-2 bg-slate-200 dark:bg-slate-700 rounded-t-sm h-2/3"></div>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                      <div className="text-3xl font-bold text-slate-800 dark:text-white leading-none mb-1">{stat.value}</div>
                      <div className="text-sm font-medium text-slate-400">{stat.subtitle}</div>
                  </div>
                  <div className={cn("text-xs font-bold self-end mb-1 ml-2", stat.changeColor)}>
                      {stat.change}
                  </div>
              </div>
          </div>
        ))}
      </section>
    </div>
  );
}

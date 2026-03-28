import { StudentProfile } from "@/lib/api/services/studentService";
import { TrendingUp, Award, Clock, DollarSign } from "lucide-react";

interface StatisticsProps {
  student: StudentProfile;
}

export default function Statistics({ student }: StatisticsProps) {
  const stats = [
    { label: 'GPA', value: '3.85', icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Attendance', value: '97%', icon: Clock, color: 'text-emerald-500' },
    { label: 'Incidents', value: '0', icon: Award, color: 'text-orange-500' },
    { label: 'Balance', value: '$0.00', icon: DollarSign, color: 'text-purple-500' },
  ]

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
      <h2 className="text-slate-900 dark:text-white text-xl font-black leading-tight tracking-tight mb-6 flex items-center gap-2">
        <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
        Quick Statistics
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex flex-col gap-2 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 group hover:bg-white dark:hover:bg-slate-800 transition-all duration-300">
              <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 w-fit shadow-sm group-hover:scale-110 transition-transform ${stat.color}`}>
                <Icon size={16} />
              </div>
              <div>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                  {stat.label}
                </p>
                <p className="text-slate-900 dark:text-white text-lg font-black leading-tight mt-0.5">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}

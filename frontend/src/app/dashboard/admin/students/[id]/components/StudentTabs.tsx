import React, { useState } from 'react'
import InfoPage from './InfoPage/InfoPage';
import AcademicPerformancePage from './AcademicPerformance/AcademicPerformancePage';
import AttendancePage from './attendance/AttendancePage';
import BehaviourPage from './Behaviour/BehaviourPage';
import { StudentProfile } from '@/lib/api/services/studentService';
import { LayoutDashboard, UserCircle, GraduationCap, CalendarCheck, ShieldAlert } from 'lucide-react';

const tabs = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Info', icon: UserCircle },
  { name: 'Academics', icon: GraduationCap },
  { name: 'Attendance', icon: CalendarCheck },
  { name: 'Behaviour', icon: ShieldAlert },
]

export default function StudentTabs({ student }: { student: StudentProfile }) {
  const [activeTab, setActiveTab] = useState<number>(0);

  const renderTabContent = (tabIndex: number): React.ReactNode => {
    switch(tabIndex) {
      case 0: // Overview
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Current GPA', value: '3.85', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                { label: 'Attendance', value: '97%', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                { label: 'Incidents', value: '0', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-500/10' },
                { label: 'Balance', value: '$0.00', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10' },
              ].map((stat, i) => (
                <div key={i} className={`flex flex-col gap-2 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 ${stat.bg} transition-transform hover:scale-[1.02]`}>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{stat.label}</p>
                  <p className={`text-4xl font-black tracking-tight ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
              {/* Academic Progress Chart Placeholder */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Academic Progress</h3>
                <div className="rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 h-80 flex items-center justify-center border-dashed">
                  <p className="text-slate-400 font-bold italic">No academic data available for this term</p>
                </div>
              </div>
              
              {/* Recent Behaviour Notes Placeholder */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Recent Behaviour Notes</h3>
                <div className="rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 h-80 flex items-center justify-center border-dashed">
                  <p className="text-slate-400 font-bold italic">No behaviour incidents reported</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 1: // Info
        return <InfoPage student={student} />;
      case 2: // Academics
        return <AcademicPerformancePage student={student} />;
      case 3: // Attendance
        return <AttendancePage student={student} />;
      case 4: // Behaviour
        return <BehaviourPage student={student} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full rounded-[3rem] border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden min-h-[700px]">
      {/* Premium Tabs */}
      <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-2">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === index;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(index)}
                className={`flex items-center gap-2 px-6 py-4 rounded-2xl transition-all font-black text-sm uppercase tracking-wider ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon size={18} className={isActive ? "text-primary" : "text-slate-400"} />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-8 lg:p-10">
        {renderTabContent(activeTab)}
      </div>
    </div>
  )
}
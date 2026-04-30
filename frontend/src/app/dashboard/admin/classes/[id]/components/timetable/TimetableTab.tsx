'use client';

import React, { useState } from 'react';
import HeaderActions from './components/HeaderActions';
import FilterButton from './components/FilterButton';
import TimetableGrid from './components/TimetableGrid';
import { Period, Subject } from './components/types';
import { useClassTimetable, useClassDetails } from '@/lib/api/hooks/useClasses';
import { useSchoolSettings } from '@/lib/api/hooks/useSchool';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useParams } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Filter, 
  Layout, 
  ChevronRight,
  Activity,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function TimetablePage() {
  const params = useParams();
  const classId = params.id as string;
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#ea580c';

  const { data: classDetails } = useClassDetails(classId);
  
  const [filters, setFilters] = useState({
    term: 'Term 1',
    week: 'This Week'
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const { data: rawPeriods = [], isLoading } = useClassTimetable(classId);

  const periods: Period[] = React.useMemo(() => {
    if (rawPeriods.length === 0) return [];

    const slots = new Map<string, Period>();

    rawPeriods.forEach((rp: any) => {
      const timeSlot = `${rp.startTime} - ${rp.endTime}`;
      if (!slots.has(timeSlot)) {
        slots.set(timeSlot, {
          id: timeSlot,
          timeSlot,
          subjects: {}
        });
      }

      const slot = slots.get(timeSlot)!;
      slot.subjects[rp.day] = {
        id: rp.id,
        name: rp.subject?.name || 'Unknown',
        teacher: rp.teacher?.name || 'Staff',
        room: rp.room || 'TBD'
      };
    });

    return Array.from(slots.values()).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  }, [rawPeriods]);

  const termOptions = ['Term 1', 'Term 2', 'Term 3'];
  const weekOptions = ['This Week', 'Next Week', 'Week 1', 'Week 2', 'Week 3', 'Week 4'];

  const handleFilterChange = (filterType: 'term' | 'week', value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <main className="p-8 md:p-12 space-y-12">
        <div className="w-full max-w-7xl mx-auto space-y-12">
          {/* Tactical Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                <span>Chronology protocol</span>
                <div className="size-1 rounded-full" style={{ backgroundColor: primaryColor }} />
                <span style={{ color: primaryColor }}>Synchronization Node</span>
              </div>
              <div className="flex items-center gap-5">
                <div className="p-4 rounded-[2rem] shadow-2xl" style={{ backgroundColor: primaryColor }}>
                  <Calendar size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                    Class Timetable
                  </h1>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                    <Layers size={12} /> Cluster Node: <span className="text-slate-900 dark:text-white">{classDetails?.name || 'Loading...'}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <HeaderActions
              onAutoGenerate={() => console.log('Auto-generating...')}
              onAddPeriod={() => console.log('Adding period...')}
              onDownload={() => console.log('Downloading...')}
            />
          </header>

          {/* Operational Control Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                <Filter size={18} />
              </div>
              <div className="flex items-center gap-3">
                <FilterButton
                  label="Phase"
                  value={filters.term}
                  options={termOptions}
                  onChange={(value) => handleFilterChange('term', value)}
                />
                <FilterButton
                  label="Sequence"
                  value={filters.week}
                  options={weekOptions}
                  onChange={(value) => handleFilterChange('week', value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest">
                <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                Sync Active
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Last Sync: 2m ago</span>
              </div>
            </div>
          </div>

          {/* Grid Terminal */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[3.5rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-2xl"
          >
            <TimetableGrid
              periods={periods}
              days={days}
              onCellClick={(day, periodId) => console.log(`Clicked ${day} ${periodId}`)}
              onEdit={(id) => console.log(`Editing ${id}`)}
              onDelete={(id) => console.log(`Deleting ${id}`)}
              onMarkAttendance={(id) => console.log(`Attendance for ${id}`)}
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
}

}
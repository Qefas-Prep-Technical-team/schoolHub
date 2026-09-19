'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useClassTimetable } from '@/lib/api/hooks/useClasses';
import { useSessions } from '@/lib/api/hooks/useSessions';
import { useSchoolSettings } from '@/lib/api/hooks/useSchool';
import { useSingleClass } from '@/lib/api/hooks/useClasses';

import FilterButton from '@/app/dashboard/admin/classes/[id]/components/timetable/components/FilterButton';
import TimetableGrid from '@/app/dashboard/admin/classes/[id]/components/timetable/components/TimetableGrid';
import SlotDetailsModal from '@/app/dashboard/admin/classes/[id]/components/timetable/components/SlotDetailsModal';

export default function TimetablePage() {
  const params = useParams();
  const classId = params.id as string;
  
  const { data: classData } = useSingleClass(classId);
  const schoolId = classData?.schoolId || "";
  
  // Sessions and Term Filters
  const { data: sessionsData } = useSessions(schoolId);
  const sessions = sessionsData?.data || [];
  const [selectedSessionName, setSelectedSessionName] = useState("");
  const [selectedTermName, setSelectedTermName] = useState("First Term");

  React.useEffect(() => {
    if (sessions && sessions.length > 0 && !selectedSessionName) {
      const now = new Date();
      let foundSession = null;
      let foundTerm = null;

      for (const session of sessions) {
        if (session.termPeriods && session.termPeriods.length > 0) {
          const currentTermPeriod = session.termPeriods.find((tp: any) => {
            if (!tp.startDate || !tp.endDate) return false;
            const start = new Date(tp.startDate);
            const end = new Date(tp.endDate);
            return now >= start && now <= end;
          });
          
          if (currentTermPeriod) {
            foundSession = session;
            foundTerm = currentTermPeriod.term;
            break;
          }
        }
      }

      if (foundSession && foundTerm) {
        setSelectedSessionName(foundSession.name);
        setSelectedTermName(
          foundTerm === 'FIRST' ? 'First Term' :
          foundTerm === 'SECOND' ? 'Second Term' : 'Third Term'
        );
      } else {
        const activeSession = sessions.find((s: any) => s.isActive);
        if (activeSession) {
          setSelectedSessionName(activeSession.name);
          setSelectedTermName(
            activeSession.currentTerm === 'FIRST' ? 'First Term' :
            activeSession.currentTerm === 'SECOND' ? 'Second Term' : 'Third Term'
          );
        } else {
          setSelectedSessionName(sessions[0].name);
          setSelectedTermName('First Term');
        }
      }
    }
  }, [sessions, selectedSessionName]);

  const selectedSessionObj = sessions.find((s: any) => s.name === selectedSessionName);
  const selectedTerm = selectedTermName === 'First Term' ? 'FIRST' : selectedTermName === 'Second Term' ? 'SECOND' : 'THIRD';
  const termPeriodId = selectedSessionObj?.termPeriods?.find((tp: any) => tp.term === selectedTerm)?.id || "";

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('07:30 - 08:30');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPeriodDetails, setSelectedPeriodDetails] = useState<any>(null);

  const { data: rawPeriods = [], isLoading: isTimetableLoading } = useClassTimetable(classId, termPeriodId);

  const periods = React.useMemo(() => {
    const defaultSlots = [
      '07:30 - 08:30', '08:30 - 09:30', '09:30 - 10:30',
      '10:30 - 11:30', '11:30 - 12:30', '12:30 - 13:30',
      '13:30 - 14:30', '14:30 - 15:30', '15:30 - 16:30',
      '16:30 - 17:30', '17:30 - 18:00'
    ];

    if (rawPeriods.length === 0) {
      return defaultSlots.map(timeSlot => ({ id: timeSlot, timeSlot, subjects: {} }));
    }

    const uniqueSlotsMap = new Map<string, { startTime: string; endTime: string }>();
    rawPeriods.forEach((rp: any) => {
      if (rp.startTime && rp.endTime) {
        const slot = `${rp.startTime} - ${rp.endTime}`;
        uniqueSlotsMap.set(slot, { startTime: rp.startTime, endTime: rp.endTime });
      }
    });

    const sortedSlots = Array.from(uniqueSlotsMap.values()).sort((a, b) => a.startTime.localeCompare(b.startTime));

    return sortedSlots.map(slot => {
      const timeSlot = `${slot.startTime} - ${slot.endTime}`;
      const slotSubjects: Record<string, any> = {};

      rawPeriods.forEach((rp: any) => {
        if (rp.startTime === slot.startTime && rp.endTime === slot.endTime) {
          slotSubjects[rp.day] = {
            id: rp.id,
            name: rp.isBreak ? 'Recess / Break' : (rp.subject?.name || 'Unknown'),
            teacher: rp.isBreak ? '' : (rp.teacher?.name || 'Staff'),
            room: rp.isBreak ? '' : (rp.room || 'TBD'),
            isBreak: !!rp.isBreak
          };
        }
      });

      return { id: timeSlot, timeSlot, subjects: slotSubjects };
    });
  }, [rawPeriods]);

  const handleCellClick = (day: string, timeSlot: string) => {
    setSelectedDay(day);
    setSelectedTimeSlot(timeSlot);

    const [start, end] = timeSlot.split(' - ');
    const matchedPeriod = rawPeriods.find((rp: any) => 
      rp.day === day && rp.startTime === start && rp.endTime === end
    );

    if (matchedPeriod) {
      setSelectedPeriodDetails({
        id: matchedPeriod.id,
        subjectId: matchedPeriod.subjectId || '',
        subjectName: matchedPeriod.isBreak ? 'Recess / Break' : (matchedPeriod.subject?.name || 'Unknown Subject'),
        teacherId: matchedPeriod.teacherId || '',
        teacherName: matchedPeriod.isBreak ? '' : (matchedPeriod.teacher?.name || 'Staff'),
        room: matchedPeriod.room || '',
        startTime: matchedPeriod.startTime,
        endTime: matchedPeriod.endTime,
        isBreak: !!matchedPeriod.isBreak,
        breakLabel: matchedPeriod.breakLabel || 'Recess / Break'
      });
      setIsDetailsModalOpen(true);
    }
  };

  return (
    <div className="w-full mt-6 pb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-gray-900 dark:text-white text-xl font-bold">Class Timetable</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">View your weekly schedule</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        {sessions.length > 0 && (
          <FilterButton
            label="Session"
            value={selectedSessionName}
            options={sessions.map((s: any) => s.name)}
            onChange={setSelectedSessionName}
          />
        )}
        <FilterButton
          label="Term"
          value={selectedTermName}
          options={['First Term', 'Second Term', 'Third Term']}
          onChange={setSelectedTermName}
        />
      </div>

      <div className="w-full">
        {isTimetableLoading ? (
          <div className="w-full border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden animate-pulse">
            <div className="grid grid-cols-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="p-4 border-r border-slate-200 dark:border-slate-800"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div></div>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="p-4 border-r border-slate-200 dark:border-slate-800 last:border-r-0 flex justify-center"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div></div>
              ))}
            </div>
            {[1, 2, 3, 4, 5].map(row => (
              <div key={row} className="grid grid-cols-6 border-b border-slate-200 dark:border-slate-800 last:border-b-0">
                <div className="p-4 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div></div>
                {[1, 2, 3, 4, 5].map(col => (
                  <div key={col} className="p-3 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                    <div className="h-20 bg-slate-100 dark:bg-slate-800/40 rounded-xl w-full"></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <TimetableGrid
            periods={periods}
            days={days}
            onCellClick={handleCellClick}
          />
        )}
      </div>

      <SlotDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        day={selectedDay}
        timeSlot={selectedTimeSlot}
        period={selectedPeriodDetails}
        onEdit={() => {}}
        onDelete={() => {}}
        onMarkAttendance={() => {}}
        onAdd={() => {}}
      />
    </div>
  );
}

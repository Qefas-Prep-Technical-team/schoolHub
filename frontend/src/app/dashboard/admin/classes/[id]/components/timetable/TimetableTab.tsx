'use client';

import React, { useState } from 'react';

import HeaderActions from './components/HeaderActions';
import FilterButton from './components/FilterButton';
import TimetableGrid from './components/TimetableGrid';
import { Period, Subject } from './components/types';

import { useClassTimetable } from '@/lib/api/hooks/useClasses';
import { useParams } from 'next/navigation';

export default function TimetablePage() {
  const params = useParams();
  const classId = params.id as string;
  
  const [filters, setFilters] = useState({
    term: 'Term 1',
    week: 'This Week'
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Real Data Hook
  const { data: rawPeriods = [], isLoading } = useClassTimetable(classId);

  // Transform flat backend periods to the structure expected by TimetableGrid
  const periods: Period[] = React.useMemo(() => {
    if (rawPeriods.length === 0) return [];

    // Group by time slot
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

  const handleAutoGenerate = () => {
    console.log('Auto-generating timetable...');
    // Implement auto-generation logic here
  };

  const handleAddPeriod = () => {
    console.log('Adding new period...');
    // Implement add period logic here
  };

  const handleDownload = () => {
    console.log('Downloading timetable...');
    // Implement download logic here
  };

  const handleCellClick = (day: string, periodId: string) => {
    console.log(`Clicked ${day} at period ${periodId}`);
    // Implement cell click logic (e.g., open modal to add/update subject)
  };

  const handleEditSubject = (subjectId: string) => {
    console.log(`Editing subject ${subjectId}`);
    // Implement edit logic
  };

  const handleDeleteSubject = (subjectId: string) => {
    console.log(`Deleting subject ${subjectId}`);
    // Implement delete logic with confirmation
  };

  const handleMarkAttendance = (subjectId: string) => {
    console.log(`Marking attendance for subject ${subjectId}`);
    // Implement attendance marking logic
  };

  return (
    <div className="relative flex min-h-screen w-full">
      <main className="flex-1 p-8">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header Section */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col gap-1">
              <p className="text-gray-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">
                Class Timetable
              </p>
              <p className="text-gray-500 dark:text-[#95a5c6] text-base font-normal leading-normal">
                Grade 10 – A
              </p>
            </div>
            
            <HeaderActions
              onAutoGenerate={handleAutoGenerate}
              onAddPeriod={handleAddPeriod}
              onDownload={handleDownload}
            />
          </header>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-6">
            <FilterButton
              label="Term"
              value={filters.term}
              options={termOptions}
              onChange={(value) => handleFilterChange('term', value)}
            />
            
            <FilterButton
              label="Week"
              value={filters.week}
              options={weekOptions}
              onChange={(value) => handleFilterChange('week', value)}
            />
          </div>

          {/* Timetable Grid */}
          <TimetableGrid
            periods={periods}
            days={days}
            onCellClick={handleCellClick}
            onEdit={handleEditSubject}
            onDelete={handleDeleteSubject}
            onMarkAttendance={handleMarkAttendance}
          />
        </div>
      </main>
    </div>
  );
}
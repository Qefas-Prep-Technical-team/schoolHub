'use client';

import React, { useState } from 'react';

import HeaderActions from './components/HeaderActions';
import FilterButton from './components/FilterButton';
import TimetableGrid from './components/TimetableGrid';
import { Period, Subject } from './components/types';

export default function TimetablePage() {
  const [filters, setFilters] = useState({
    term: 'Term 1',
    week: 'This Week'
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const [periods, setPeriods] = useState<Period[]>([
    {
      id: '1',
      timeSlot: '09:00 - 10:00',
      subjects: {
        Monday: {
          id: 'math-1',
          name: 'Mathematics',
          teacher: 'Mr. Smith',
          room: 'Room 201'
        },
        Tuesday: {
          id: 'english-1',
          name: 'English',
          teacher: 'Ms. Davis',
          room: 'Room 105'
        },
        Wednesday: null,
        Thursday: {
          id: 'physics-1',
          name: 'Physics',
          teacher: 'Dr. Chen',
          room: 'Lab A'
        },
        Friday: null
      }
    },
    {
      id: '2',
      timeSlot: '10:00 - 11:00',
      subjects: {
        Monday: null,
        Tuesday: null,
        Wednesday: {
          id: 'history-1',
          name: 'History',
          teacher: 'Mr. Moore',
          room: 'Room 302'
        },
        Thursday: null,
        Friday: {
          id: 'art-1',
          name: 'Art',
          teacher: 'Mrs. Lee',
          room: 'Art Studio'
        }
      }
    },
    {
      id: 'break',
      timeSlot: '11:00 - 12:00',
      subjects: {}
    },
    {
      id: '3',
      timeSlot: '12:00 - 13:00',
      subjects: {
        Monday: {
          id: 'geography-1',
          name: 'Geography',
          teacher: 'Ms. Kim',
          room: 'Room 301'
        },
        Tuesday: null,
        Wednesday: null,
        Thursday: null,
        Friday: null
      }
    },
    {
      id: '4',
      timeSlot: '13:00 - 14:00',
      subjects: {
        Monday: null,
        Tuesday: {
          id: 'pe-1',
          name: 'P.E.',
          teacher: 'Mr. Jones',
          room: 'Gym'
        },
        Wednesday: null,
        Thursday: {
          id: 'music-1',
          name: 'Music',
          teacher: 'Mr. Evans',
          room: 'Music Room'
        },
        Friday: null
      }
    }
  ]);

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
'use client';

import { useState } from 'react';
import Toolbar from './Toolbar';
import { AttendanceStatus, Day } from './types';
import StatsGrid from './StatsGrid';
import Calendar from './Calendar';
import EditModal from './EditModal';

const AttendanceTab: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<number | null>(9); // October 9th selected by default
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [currentMonth, setCurrentMonth] = useState<string>('October');
  const [currentYear, setCurrentYear] = useState<number>(2024);

  // Generate calendar days for October 2024
  const generateDays = (): Day[] => {
    const days: Day[] = [];
    
    // Previous month days (September 29, 30)
    days.push(
      { date: 29, type: 'previous-month', status: 'none' },
      { date: 30, type: 'previous-month', status: 'none' }
    );
    
    // October days with attendance data
    const octoberDays: Day[] = [
      { date: 1, type: 'current-month', status: 'present' },
      { date: 2, type: 'current-month', status: 'present' },
      { date: 3, type: 'current-month', status: 'present' },
      { date: 4, type: 'current-month', status: 'present' },
      { date: 5, type: 'current-month', status: 'none' },
      { date: 6, type: 'current-month', status: 'none' },
      { date: 7, type: 'current-month', status: 'present' },
      { date: 8, type: 'current-month', status: 'late' },
      { date: 9, type: 'current-month', status: 'present', hasNote: true, isSelected: true },
      { date: 10, type: 'current-month', status: 'present' },
      { date: 11, type: 'current-month', status: 'absent' },
      { date: 12, type: 'current-month', status: 'none' },
      { date: 13, type: 'current-month', status: 'none' },
      { date: 14, type: 'current-month', status: 'present' },
      { date: 15, type: 'current-month', status: 'present' },
      { date: 16, type: 'current-month', status: 'present' },
      { date: 17, type: 'current-month', status: 'late' },
      { date: 18, type: 'current-month', status: 'present' },
      { date: 19, type: 'current-month', status: 'none' },
      { date: 20, type: 'current-month', status: 'none' },
      { date: 21, type: 'current-month', status: 'present' },
      { date: 22, type: 'current-month', status: 'present' },
      { date: 23, type: 'current-month', status: 'present' },
      { date: 24, type: 'current-month', status: 'present' },
      { date: 25, type: 'current-month', status: 'present' },
      { date: 26, type: 'current-month', status: 'none' },
      { date: 27, type: 'current-month', status: 'none' },
      { date: 28, type: 'current-month', status: 'present' },
      { date: 29, type: 'current-month', status: 'present' },
      { date: 30, type: 'current-month', status: 'present' },
      { date: 31, type: 'current-month', status: 'present' }
    ];
    
    // Next month days (November 1, 2)
    days.push(...octoberDays);
    days.push(
      { date: 1, type: 'next-month', status: 'none' },
      { date: 2, type: 'next-month', status: 'none' }
    );
    
    return days;
  };

  const [days, setDays] = useState<Day[]>(generateDays());

  const handleDayClick = (date: number) => {
    setSelectedDate(date);
    setShowEditModal(true);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    // Implement month navigation logic
    console.log(`Change month: ${direction}`);
  };

  const handleDownloadReport = () => {
    console.log('Download attendance report');
    // Implement download logic
  };

  const handleSaveAttendance = (status: AttendanceStatus, comment: string) => {
    console.log('Save attendance:', { status, comment });
    // Update the day's status in the state
    if (selectedDate !== null) {
      setDays(days.map(day => 
        day.date === selectedDate && day.type === 'current-month'
          ? { ...day, status, hasNote: !!comment }
          : day
      ));
    }
    setShowEditModal(false);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
  };

  const getFormattedDate = (): string => {
    return `${currentMonth} ${selectedDate}, ${currentYear}`;
  };

  const getCurrentStatus = (): AttendanceStatus => {
    const selectedDay = days.find(day => 
      day.date === selectedDate && day.type === 'current-month'
    );
    return selectedDay?.status || 'present';
  };

  return (
    <div className="bg-white dark:bg-[#19212e] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/60">
      <Toolbar
        month={currentMonth}
        year={currentYear}
        onMonthChange={handleMonthChange}
        onDownloadReport={handleDownloadReport}
      />
      
      <div className="p-6">
        <StatsGrid />
        
        <Calendar
          days={days}
          selectedDate={selectedDate || undefined}
          onDayClick={handleDayClick}
        />
      </div>

      {showEditModal && selectedDate && (
        <EditModal
          date={getFormattedDate()}
          currentStatus={getCurrentStatus()}
          currentComment="Arrived on time but forgot his homework."
          onSave={handleSaveAttendance}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default AttendanceTab;
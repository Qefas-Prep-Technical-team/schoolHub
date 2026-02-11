/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Download, Plus } from 'lucide-react';
import AttendanceSummaryCard from './components/AttendanceSummaryCard';
import AttendanceCalendar from './components/AttendanceCalendar';
import AttendanceTable from './components/AttendanceTable';
import AttendanceModal from './components/AttendanceModal';
import { 
  AttendanceRecord, 
  AttendanceSummary, 
  CalendarDay,
  MonthlyAttendance 
} from './components/types';
import Breadcrumbs from '../students/components/Breadcrumbs';

// Mock data
const mockStudents = [
  { id: '1', name: 'Jane Doe', code: '102345' },
  { id: '2', name: 'John Smith', code: '102346' },
  { id: '3', name: 'Emily White', code: '102347' },
  { id: '4', name: 'Michael Brown', code: '102348' },
  { id: '5', name: 'Jessica Jones', code: '102349' },
  { id: '6', name: 'David Wilson', code: '102350' },
  { id: '7', name: 'Sarah Miller', code: '102351' },
  { id: '8', name: 'Robert Taylor', code: '102352' },
  { id: '9', name: 'Lisa Anderson', code: '102353' },
  { id: '10', name: 'Thomas Moore', code: '102354' }
];

const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'Jane Doe',
    studentCode: '102345',
    classId: 'bio-101',
    className: 'Biology 101',
    date: '2023-10-26',
    status: 'present',
    submittedBy: 'Dr. Eleanor Vance',
    submittedAt: '2023-10-26T08:30:00Z'
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'John Smith',
    studentCode: '102346',
    classId: 'bio-101',
    className: 'Biology 101',
    date: '2023-10-26',
    status: 'absent',
    comment: 'Feeling unwell',
    submittedBy: 'Dr. Eleanor Vance',
    submittedAt: '2023-10-26T08:30:00Z'
  },
  {
    id: '3',
    studentId: '3',
    studentName: 'Emily White',
    studentCode: '102347',
    classId: 'bio-101',
    className: 'Biology 101',
    date: '2023-10-26',
    status: 'present',
    submittedBy: 'Dr. Eleanor Vance',
    submittedAt: '2023-10-26T08:30:00Z'
  },
  {
    id: '4',
    studentId: '4',
    studentName: 'Michael Brown',
    studentCode: '102348',
    classId: 'bio-101',
    className: 'Biology 101',
    date: '2023-10-26',
    status: 'late',
    comment: '5 mins, traffic',
    submittedBy: 'Dr. Eleanor Vance',
    submittedAt: '2023-10-26T08:35:00Z'
  },
  {
    id: '5',
    studentId: '5',
    studentName: 'Jessica Jones',
    studentCode: '102349',
    classId: 'bio-101',
    className: 'Biology 101',
    date: '2023-10-26',
    status: 'present',
    submittedBy: 'Dr. Eleanor Vance',
    submittedAt: '2023-10-26T08:30:00Z'
  }
];

const mockMonthlySummary: AttendanceSummary = {
  date: '2023-10',
  totalStudents: 10,
  present: 1240,
  absent: 58,
  late: 12,
  excused: 0,
  attendanceRate: 95
};

export default function ClassAttendancePage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2023-10-26'));
  const [showModal, setShowModal] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Classes', href: '/classes' },
    { label: 'Biology 101', href: `/class/${classId}` },
    { label: 'Attendance' }
  ];

  useEffect(() => {
    // Generate calendar days for October 2023
    const generateCalendarDays = () => {
      const year = 2023;
      const month = 9; // October (0-indexed)
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const days: CalendarDay[] = [];
      
      // Add previous month's trailing days
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      const firstDayOfWeek = firstDay.getDay();
      
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, prevMonthLastDay - i);
        days.push({
          date,
          isCurrentMonth: false,
          hasAttendance: false
        });
      }
      
      // Add current month's days
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const hasAttendanceForDate = attendanceRecords.some(record => 
          new Date(record.date).toDateString() === date.toDateString()
        );
        
        // Simulate random attendance status for demo
        const statuses = ['present', 'absent', 'late', undefined];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)] as any;
        
        days.push({
          date,
          isCurrentMonth: true,
          hasAttendance: hasAttendanceForDate,
          status: hasAttendanceForDate ? randomStatus : undefined
        });
      }
      
      // Add next month's leading days
      const totalCells = 42; // 6 weeks * 7 days
      const remainingCells = totalCells - days.length;
      
      for (let day = 1; day <= remainingCells; day++) {
        const date = new Date(year, month + 1, day);
        days.push({
          date,
          isCurrentMonth: false,
          hasAttendance: false
        });
      }
      
      return days;
    };
    
    setCalendarDays(generateCalendarDays());
  }, [attendanceRecords]);

  const handleStartAttendance = () => {
    setShowModal(true);
  };

  const handleDownloadReport = () => {
    console.log('Downloading attendance report for class:', classId);
    // Implement download logic
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // In real app, fetch attendance records for selected date
    console.log('Fetching attendance for:', date.toDateString());
  };

  const handleMonthChange = (month: string) => {
    console.log('Changing month to:', month);
    // Implement month change logic
  };

  const handleEditRecord = (record: AttendanceRecord) => {
    console.log('Editing attendance record:', record);
    // Implement edit logic
  };

  const handleSaveAttendance = (records: AttendanceRecord[]) => {
    console.log('Saving attendance records:', records);
    // In real app, make API call to save records
    setAttendanceRecords(prev => [...prev, ...records]);
  };

  const filteredRecords = attendanceRecords.filter(record => 
    new Date(record.date).toDateString() === selectedDate.toDateString()
  );

  return (
    <div className="relative flex min-h-screen w-full">
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={breadcrumbItems} />
          
          {/* Page Heading */}
          <header className="sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm py-4 z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">
                Biology 101 - Attendance
              </h1>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadReport}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <Download size={18} className="mr-2" />
                  <span className="truncate">Download Report</span>
                </button>
                
                <button
                  onClick={handleStartAttendance}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
                >
                  <Plus size={18} />
                  <span className="truncate">Start Attendance</span>
                </button>
              </div>
            </div>
          </header>
          
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Left Column */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <AttendanceSummaryCard 
                summary={mockMonthlySummary}
                onMonthChange={handleMonthChange}
              />
              
              <AttendanceCalendar 
                days={calendarDays}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
            </div>
            
            {/* Right Column - Attendance Table */}
            <AttendanceTable 
              records={filteredRecords}
              date={selectedDate.toISOString()}
              onEdit={handleEditRecord}
            />
          </div>
        </div>
      </main>

      <AttendanceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveAttendance}
        students={mockStudents}
        date={new Date().toISOString().split('T')[0]}
      />
    </div>
  );
}
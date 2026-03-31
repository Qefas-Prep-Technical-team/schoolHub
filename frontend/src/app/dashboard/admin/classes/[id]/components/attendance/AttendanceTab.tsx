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

import { 
  useClassAttendance, 
  useClassAttendanceSummary, 
  useSubmitAttendance 
} from '@/lib/api/hooks/useClasses';

export default function ClassAttendancePage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showModal, setShowModal] = useState(false);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  
  // Real Data Hooks
  const { data: attendanceRecords = [], isLoading } = useClassAttendance(classId, selectedDate.toISOString().split('T')[0]);
  const { data: attendanceSummary } = useClassAttendanceSummary(classId);
  const submitMutation = useSubmitAttendance(classId);

  useEffect(() => {
    // Generate calendar days
    const generateCalendarDays = () => {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const days: CalendarDay[] = [];
      const firstDayOfWeek = firstDay.getDay();
      
      // Pad previous month
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        days.push({
          date: new Date(year, month, -i),
          isCurrentMonth: false,
          hasAttendance: false
        });
      }
      
      // Current month
      for (let d = 1; d <= lastDay.getDate(); d++) {
        const date = new Date(year, month, d);
        days.push({
          date,
          isCurrentMonth: true,
          hasAttendance: false // Simplified for now
        });
      }
      
      return days;
    };
    
    setCalendarDays(generateCalendarDays());
  }, [selectedDate]);

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Classes', href: '/dashboard/admin/classes' },
    { label: 'Class Details', href: `/dashboard/admin/classes/${classId}` },
    { label: 'Attendance' }
  ];

  const handleStartAttendance = () => {
    setShowModal(true);
  };

  const handleDownloadReport = () => {
    console.log('Downloading attendance report for class:', classId);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (month: string) => {
    console.log('Changing month to:', month);
  };

  const handleEditRecord = (record: AttendanceRecord) => {
    console.log('Editing attendance record:', record);
  };

  const handleSaveAttendance = (records: AttendanceRecord[]) => {
    submitMutation.mutate(records, {
      onSuccess: () => {
        setShowModal(false);
      }
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading Attendance...</div>;
  }

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
                summary={attendanceSummary || mockMonthlySummary}
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
              records={attendanceRecords}
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
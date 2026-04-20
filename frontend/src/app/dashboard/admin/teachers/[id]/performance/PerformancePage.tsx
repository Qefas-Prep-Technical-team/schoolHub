"use client"
import { useState } from 'react'
import { ProtectedAdminRoute } from '../../../components/ProtectedAdminRoute'
import AttendanceCalendar from './AttendanceCalendar'
import MarkAttendanceForm from './MarkAttendanceForm'
import AttendanceStats from './AttendanceStats'

const mockTeacherData = {
    id: '1',
    name: 'John Appleseed',
    title: 'Mathematics Teacher',
    teacherId: 'T-82156',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmpuwUGDmWSnAYeiA59QIA5gfVXUhS6H7pZO1WzZlqF3adpaWXJWW1LhbSfCvkLKbDk96GKyea0u9cA42tCe3p4IMPYKudGRDle-HwMoAxJhqvA47-xEunmEA4ZpF1PFdvRbgam9WJDxxORkuvsjUdjZTmhFONOGXepi9sLF9QL5Bi9nKeIeuMyduwU7uSxNLU8YH7HIm_fzDDU7O2wIE_-QHRr1q84JU28DpncIjSRBPhP6AxKFxA4GcedQumfEdEiw6CafTxKK0',
    status: 'active' as const,
    personalInfo: {
        fullName: 'John Appleseed',
        gender: 'Male',
        email: 'john.appleseed@school.edu',
        phone: '+1 (234) 567-8901',
        address: '123 Education Street, City, State 12345',
        highestQualification: 'M.Sc. in Mathematics',
        yearsOfExperience: '8 Years'
    },
    professionalInfo: {
        department: 'Mathematics',
        subjects: ['Algebra', 'Calculus', 'Statistics'],
        assignedClasses: ['Grade 9A', 'Grade 10B', 'Grade 11C']
    },
    statistics: {
        classPerformance: '87%',
        attendanceRate: '98%',
        upcomingClasses: '4',
        studentsTaught: '85'
    }
}

// Mock attendance data
const mockAttendanceData: { date: string; status: 'present' | 'absent' | 'late' | null }[] = [
    { date: '2024-10-02', status: 'present' },
    { date: '2024-10-03', status: 'present' },
    { date: '2024-10-04', status: 'present' },
    { date: '2024-10-07', status: 'present' },
    { date: '2024-10-08', status: 'absent' },
    { date: '2024-10-09', status: 'present' },
    { date: '2024-10-10', status: 'late' },
    { date: '2024-10-11', status: 'present' },
    { date: '2024-10-14', status: 'present' },
    { date: '2024-10-15', status: 'present' },
    { date: '2024-10-16', status: 'present' },
    { date: '2024-10-17', status: 'present' },
    { date: '2024-10-18', status: 'present' },
    { date: '2024-10-21', status: 'absent' },
    { date: '2024-10-22', status: 'present' },
    { date: '2024-10-23', status: 'late' },
    { date: '2024-10-24', status: 'late' },
    { date: '2024-10-25', status: 'present' },
    { date: '2024-10-28', status: 'present' },
    { date: '2024-10-29', status: 'present' },
    { date: '2024-10-30', status: 'present' }
]

const attendanceStats = {
    present: 15,
    absent: 2,
    late: 3,
    percentage: '90%'
}

const timetableClasses = [
    // ... existing timetable classes
]

const tabs = [
    { id: 'profile', label: 'Profile Info' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'timetable', label: 'Timetable' },
    { id: 'courses', label: 'Courses' },
    { id: 'leave', label: 'Leave Requests' }
]

export default function PerformancePage() {
    const [activeTab, setActiveTab] = useState('attendance')
    const [currentMonth, setCurrentMonth] = useState('October 2024')
    const [selectedDate, setSelectedDate] = useState('2024-10-30')

    const breadcrumbItems = [
        { label: 'Teachers', href: '/dashboard/admin/teachers' },
        { label: mockTeacherData.name, href: '#' },
        { label: 'Attendance', active: true }
    ]

    const handleMonthChange = (direction: 'prev' | 'next') => {
        // Implement month navigation logic
        console.log('Month change:', direction)
    }

    const handleDateClick = (date: string) => {
        setSelectedDate(date)
        console.log('Date clicked:', date)
    }

    const handleAttendanceSubmit = (data: { date: string; status: string }) => {
        // Implement attendance submission logic
        console.log('Attendance submitted:', data)
    }

    const handleExportReport = () => {
        // Implement export logic
        console.log('Export report')
    }

    return (
        <ProtectedAdminRoute>
            <main className="flex-1 p-6 lg:p-10 overflow-auto">
                <div className="max-w-7xl mx-auto">


                    {/* Page Heading */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-slate-900 dark:text-slate-200 text-3xl font-bold leading-tight tracking-tight">
                                Attendance Record for {mockTeacherData.name}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                                View and manage attendance records for the selected month.
                            </p>
                        </div>
                        <button
                            onClick={handleExportReport}
                            className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-semibold leading-normal shadow-sm hover:bg-primary/90"
                        >
                            <span className="material-symbols-outlined text-lg">download</span>
                            <span className="truncate">Export Report</span>
                        </button>
                    </div>
                    <AttendanceStats stats={attendanceStats} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <AttendanceCalendar
                            attendance={mockAttendanceData}
                            currentMonth={currentMonth}
                            onMonthChange={handleMonthChange}
                            onDateClick={handleDateClick}
                        />

                        <MarkAttendanceForm
                            selectedDate={selectedDate}
                            onAttendanceSubmit={handleAttendanceSubmit}
                        />
                    </div>

                </div>
            </main>
        </ProtectedAdminRoute>
    )
}
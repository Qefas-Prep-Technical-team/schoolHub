"use client"
import { useState } from 'react'
import { ProtectedAdminRoute } from '../../../components/ProtectedAdminRoute'
import AttendanceCalendar from './AttendanceCalendar'
import MarkAttendanceForm from './MarkAttendanceForm'
import AttendanceStats from './AttendanceStats'
import { useTeacherAttendance, useMarkTeacherAttendance } from '@/lib/api/hooks/useAdmin'
import { format, subMonths, addMonths } from 'date-fns'

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

interface PerformancePageProps {
    teacher: any
}

export default function PerformancePage({ teacher }: PerformancePageProps) {
    const [activeTab, setActiveTab] = useState('attendance')
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

    const currentMonthStr = format(currentDate, 'yyyy-MM')
    
    // Fallback to activeSchoolId or resolvedSchoolId depending on what page.tsx passed, or tenant
    const schoolId = teacher?.resolvedSchoolId || teacher?.schoolId;

    const { data: attendanceData = [], isLoading } = useTeacherAttendance(teacher?.id, schoolId, currentMonthStr)
    const { mutate: markAttendance, isPending } = useMarkTeacherAttendance(teacher?.id, schoolId, currentMonthStr)

    // Calculate dynamic stats based on real data
    const presentCount = attendanceData.filter((a: any) => a.status === 'present').length
    const absentCount = attendanceData.filter((a: any) => a.status === 'absent').length
    const lateCount = attendanceData.filter((a: any) => a.status === 'late').length
    const totalCount = presentCount + absentCount + lateCount
    const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0

    const dynamicStats = {
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        percentage: `${percentage}%`
    }

    // Format for the calendar component
    const formattedAttendance = attendanceData.map((a: any) => ({
        date: format(new Date(a.date), 'yyyy-MM-dd'),
        status: a.status,
        note: a.note
    }))

    const existingRecord = formattedAttendance.find((a: any) => a.date === selectedDate)

    const breadcrumbItems = [
        { label: 'Teachers', href: '/dashboard/admin/teachers' },
        { label: teacher?.name || 'Teacher', href: '#' },
        { label: 'Attendance', active: true }
    ]

    const handleMonthChange = (direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            setCurrentDate(subMonths(currentDate, 1))
        } else {
            setCurrentDate(addMonths(currentDate, 1))
        }
    }

    const handleDateClick = (date: string) => {
        setSelectedDate(date)
    }

    const handleAttendanceSubmit = (data: { date: string; status: string; note?: string }) => {
        markAttendance({
            schoolId,
            date: data.date,
            status: data.status,
            note: data.note
        })
    }

    const handleExportReport = () => {
        const headers = ["Date", "Status", "Note"];
        const csvContent = [
            headers.join(","),
            ...attendanceData.map((a: any) => [
                `="${format(new Date(a.date), 'yyyy-MM-dd')}"`,
                `"${a.status}"`,
                `"${(a.note || '').replace(/"/g, '""')}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `attendance_report_${teacher?.name?.replace(/\s+/g, '_') || 'teacher'}_${currentMonthStr}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <ProtectedAdminRoute>
            <main className="flex-1 p-6 lg:p-10 overflow-auto">
                <div className="max-w-7xl mx-auto">


                    {/* Page Heading */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-slate-900 dark:text-slate-200 text-3xl font-bold leading-tight tracking-tight">
                                Attendance Record for {teacher?.name || 'Teacher'}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                                View and manage attendance records for the selected month.
                            </p>
                        </div>
                        <button
                            onClick={handleExportReport}
                            className="flex items-center justify-center gap-2 rounded-xl h-11 px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-md transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined text-lg">download</span>
                            <span className="truncate uppercase tracking-widest text-[11px]">Export Report</span>
                        </button>
                    </div>
                    <AttendanceStats stats={dynamicStats} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <AttendanceCalendar
                            attendance={formattedAttendance}
                            currentMonth={currentMonthStr}
                            onMonthChange={handleMonthChange}
                            onDateClick={handleDateClick}
                        />

                        <MarkAttendanceForm
                            selectedDate={selectedDate}
                            existingStatus={existingRecord?.status?.toLowerCase()}
                            existingNote={existingRecord?.note}
                            isSubmitting={isPending}
                            onAttendanceSubmit={handleAttendanceSubmit}
                        />
                    </div>

                </div>
            </main>
        </ProtectedAdminRoute>
    )
}


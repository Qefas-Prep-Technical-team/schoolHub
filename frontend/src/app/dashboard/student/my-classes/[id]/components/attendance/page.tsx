'use client';

import { useEffect, useState } from "react";
import { AttendanceInsight, AttendanceRecord, AttendanceStatsType, Course, MonthlyData } from "./components/types";
import StudentLayout from "./components/StudentLayout";

import AttendanceStats from "./components/AttendanceStats";
import AttendanceInsights from "./components/AttendanceInsights";
import AttendanceChart from "./components/AttendanceChart";
import AttendanceTable from "./components/AttendanceTable";
import Select from "./components/ui/Select";


// Mock data
const mockUser = {
    name: 'Alex Johnson',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT6HukhJ7NnC1XwS_z8zgOaIEXbwqcd18VhSsMLWbsM6YEZhsdaqjSIepQ33lJYyefjP9_UAJjrYusTRd5bNZ7QJJwfSdl8tmRmhWveox1Z9kml4RNbl4ALbmoxhpzjqcPwTnt1U4K802cpIA_Z0dwAFUQfgsFjx-Uj5noKunmJpoGROU8Vl-qvJ9LLnA9OplUV7AKgdK_sV-Oc3KfNhzuGFzQD8H7lTfztknZcR4Icf_7lpNCCAE71d7uB5xSTpoqySk72Q4VgBs',
    studentId: 'STU2024001'
};

const mockStats: AttendanceStatsType = {
    overallRate: 92,
    daysPresent: 42,
    daysAbsent: 3,
    lateArrivals: 5,
    changeFromPrevious: {
        rate: 5,
        absent: -1,
        late: 2
    }
};

const mockMonthlyData: MonthlyData[] = [
    { month: 'Jan', present: 14, absent: 4, late: 2 },
    { month: 'Feb', present: 18, absent: 1, late: 1 },
    { month: 'Mar', present: 20, absent: 0, late: 0 },
    { month: 'Apr', present: 17, absent: 1, late: 3 },
    { month: 'May', present: 19, absent: 0, late: 1, isCurrent: true },
    { month: 'Jun', present: 18, absent: 2, late: 0 },
];

const mockInsights: AttendanceInsight[] = [
    {
        type: 'positive',
        icon: 'trending_up',
        message: 'Great job! Your attendance improved by 5% this month compared to last month.'
    },
    {
        type: 'warning',
        icon: 'warning',
        message: 'You have 2 late arrivals this month. Try to be on time for the next class!'
    }
];

const mockRecords: AttendanceRecord[] = [
    { id: '1', date: '2024-05-24', status: 'present', classTopic: 'Design Principles & Hierarchy', time: '9:00 AM' },
    { id: '2', date: '2024-05-22', status: 'absent', classTopic: 'Color Theory Fundamentals', time: '9:00 AM' },
    { id: '3', date: '2024-05-20', status: 'late', classTopic: 'Introduction to Typography', time: '9:15 AM' },
    { id: '4', date: '2024-05-17', status: 'present', classTopic: 'User Research Methods', time: '9:00 AM' },
    { id: '5', date: '2024-05-15', status: 'present', classTopic: 'Wireframing & Prototyping', time: '9:00 AM' },
    { id: '6', date: '2024-05-13', status: 'present', classTopic: 'UI Design Patterns', time: '9:00 AM' },
    { id: '7', date: '2024-05-10', status: 'present', classTopic: 'Design Systems', time: '9:00 AM' },
    { id: '8', date: '2024-05-08', status: 'late', classTopic: 'Interaction Design', time: '9:10 AM' },
];

const mockCourses: Course[] = [
    { id: '1', name: 'Introduction to Design', code: 'DES101', instructor: 'Prof. Sarah Chen' },
    { id: '2', name: 'Web Development', code: 'WEB201', instructor: 'Dr. Michael Rodriguez' },
    { id: '3', name: 'Data Structures', code: 'CS301', instructor: 'Dr. James Wilson' },
    { id: '4', name: 'Calculus I', code: 'MATH101', instructor: 'Prof. Emily Brown' },
];

export default function AttendancePage() {
    const [stats, setStats] = useState<AttendanceStatsType | null>(null);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [insights, setInsights] = useState<AttendanceInsight[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('1');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAttendanceData = async () => {
            setIsLoading(true);
            try {
                // In a real app, fetch from API with selected course
                // const response = await fetch(`/api/attendance?courseId=${selectedCourse}`);
                // const data = await response.json();

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 800));

                setStats(mockStats);
                setRecords(mockRecords);
                setMonthlyData(mockMonthlyData);
                setInsights(mockInsights);
                setCourses(mockCourses);
            } catch (error) {
                console.error('Error fetching attendance data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttendanceData();
    }, [selectedCourse]);

    const handleCourseChange = (courseId: string) => {
        setSelectedCourse(courseId);
    };

    if (isLoading) {
        return (
            <StudentLayout user={mockUser}>
                <div className="flex flex-col gap-6">
                    {/* Skeleton for page header */}
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex min-w-72 flex-col gap-2">
                            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-64"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-48"></div>
                        </div>
                        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-48"></div>
                    </div>

                    {/* Skeleton for stats */}
                    <div className="flex flex-wrap gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex-1 min-w-[158px] h-32 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout user={mockUser}>
            {/* Page Header */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex min-w-72 flex-col gap-2">
                    <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                        Attendance Record
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                        Showing attendance for: {courses.find(c => c.id === selectedCourse)?.name || 'Introduction to Design'}
                    </p>
                </div>

                {/* Course Selector */}
                <div className="relative">
                    <Select
                        options={courses.map(course => ({
                            value: course.id,
                            label: `${course.name} (${course.code})`
                        }))}
                        value={selectedCourse}
                        onChange={(e) => handleCourseChange(e.target.value)}
                        className="min-w-[200px]"
                    />
                </div>
            </div>

            {/* Stats Cards */}
            {stats && <AttendanceStats stats={stats} />}

            {/* Chart and Insights */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                    <AttendanceChart monthlyData={monthlyData} />
                </div>
                <div className="lg:max-w-xs">
                    <AttendanceInsights insights={insights} />
                </div>
            </div>

            {/* Attendance Table */}
            <AttendanceTable records={records} />

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="text-sm font-semibold text-primary mb-2">Attendance Policy</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Minimum 80% attendance required to pass. Late arrivals count as 0.5 absence after 15 minutes.
                    </p>
                </div>

                <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                    <h4 className="text-sm font-semibold text-green-600 dark:text-green-500 mb-2">
                        Good Standing
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Your current attendance rate of {stats?.overallRate}% exceeds the minimum requirement.
                    </p>
                </div>

                <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-500 mb-2">
                        Late Arrivals
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Consider arriving 10 minutes early to account for unexpected delays.
                    </p>
                </div>
            </div>
        </StudentLayout>
    );
}
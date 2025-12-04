'use client';

import { useState } from 'react';
import { Class } from './type';
import PageHeader from './PageHeader';
import FilterChips from './FilterChips';
import ClassGrid from './ClassGrid';
import EmptyState from './EmptyState';


export default function MyClassesPage() {
    const [filters, setFilters] = useState({
        academicYear: '',
        term: '',
        level: '',
        class: '',
        subject: '',
    });

    const classes: Class[] = [
        {
            id: '1',
            name: 'JSS 1A - Mathematics',
            subject: 'Mathematics',
            level: 'JSS 1',
            section: 'A',
            studentCount: 32,
            schedule: ['Mon 10:00 AM', 'Wed 11:00 AM'],
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAL0zLD-Zw46tNNL9EF1qqlpRbHgO1uuHKCc1UzyBWbcMscRxmReR48BycWbICZ1XucCngOmFuhIQypaoYOkrb_tyfO-EqXeyW0xp5nbQG3aN2C3YPS1PYFCsYngX4jGiAFreP25p26O9Qapvyl2IEgHYHbUWMbbGX3rQ89Gwk8FKCS9y7U3WBVV2lItx5X1EK1WgBsz1FlCTK_8BVi3B8LOqjtmgTT1H-323TgrkkE_t1syWBrbat_SnihV4WOPjvz-Tkg1US2yvY',
            assignments: 5,
            exams: 2,
            attendance: 94,
            averageGrade: 82,
        },
        {
            id: '2',
            name: 'JSS 2B - English Language',
            subject: 'English Language',
            level: 'JSS 2',
            section: 'B',
            studentCount: 28,
            schedule: ['Tue 09:00 AM', 'Thu 11:00 AM'],
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_y2nQtFYarBnvr9w3bI6YE0WUgwXJt_uBIqPniL-mrTFwKkJ7kZV69oToL_fDMW1uN9ndnxzcFcG32rBt2pe8OPe2BmPR0-18bXUhe5wKlIUNeD2jIF-rfePOrlhrRG_b-aaXZjLbd7AABRHNv0ckejsK8BUIJA9it8HrycN-UW-pGztay61wsNczXGpCi2Y2tOx3gqKOpmen2W_YvgETnqdiQBPJkOSfZGy04BBNXyWFCTWWISYqGe7t_FMkK3AIiPvc_9s9cyc',
            assignments: 3,
            exams: 1,
            attendance: 96,
            averageGrade: 85,
        },
        {
            id: '3',
            name: 'SSS 1C - Physics',
            subject: 'Physics',
            level: 'SSS 1',
            section: 'C',
            studentCount: 25,
            schedule: ['Fri 01:00 PM', 'Mon 08:00 AM'],
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5LmgI1w-Adog_vARtd0-YF74vyCRXI9UC1ztW-xXdg7H2-ZBve62pYQlx6P23rel6P2Pb7raPCDxeNYhKfi6QEp2sCmP2hArhecNgxqEIAkuZVUQnVHmECmXmYzLBFk0cfAIUJkXgwSYTQiVRMkLfT563VntxMOuHT5xaVNKb2Lr0EGxnRpV_KaE1bjhSzrMOEDX1tvY3BWTsai6T8KsnvBUOrHFWsTLCuiIIOu-rX9jnf8P7ZFTw-A5OJPY_M-J9SPRJbBBIavs',
            assignments: 4,
            exams: 3,
            attendance: 89,
            averageGrade: 78,
        },
        {
            id: '4',
            name: 'JSS 1A - Basic Science',
            subject: 'Basic Science',
            level: 'JSS 1',
            section: 'A',
            studentCount: 32,
            schedule: ['Wed 02:00 PM', 'Fri 09:00 AM'],
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDopAIQ9xsbMqr-0UZagYuKJSO7JoO66SfTK60ZVF2ek2eSvWoLo-uUG-7ZckIX5RyE9ui8BghRsauov13x1oppBfsgHfv9xmjP0IJ6pNP-RSh2LmaZdgMxroSWfrOhqQkD6n-G2h4Rh7Wr-T2agmkqHTGdNKY1s0Ga-O-EmrCH6n8puBQaJ2lDhp3fWFtTm4dBq8rANpT8c0PRtpsI5g8-yEsmv81VOwN6x2tnceNVsrlpSsnR7s2k5F7zETY2uSQWtPyIsUjyjF0',
            assignments: 6,
            exams: 2,
            attendance: 92,
            averageGrade: 80,
        },
        {
            id: '5',
            name: 'SSS 3A - Chemistry',
            subject: 'Chemistry',
            level: 'SSS 3',
            section: 'A',
            studentCount: 22,
            schedule: ['Mon 11:00 AM', 'Thu 10:00 AM'],
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMQ63kieIbGOWR6QUXkSo6TXDW1R6PMi0c18fPMzFMVjH5RDkJd7FmO3koFe5udgcw47VPM3FgFe6Iu5ioZAdb7R473HrPygx3qOzVRvglaPASp9kHPvUw4Ya6gTSituP9ir8FB9d-wemfbjS_7r2vObDBltPiJpksdymXgI93lrTbMPrfpNKYfQKnjr1ER20pDWX0jrhVSgvtfUYf1BNaYyr9ZA5TlfwWIlU3497fN1HPktk5LpBpJonelBAqMuUW5MY1HVJI9ns',
            assignments: 7,
            exams: 4,
            attendance: 95,
            averageGrade: 88,
        },
        {
            id: '6',
            name: 'JSS 3B - Social Studies',
            subject: 'Social Studies',
            level: 'JSS 3',
            section: 'B',
            studentCount: 30,
            schedule: ['Tue 01:00 PM', 'Wed 08:00 AM'],
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8dDwKtM3DgOBEdivGq_Ebwp3hLNxUo3STGykWaXNReKbuPgX4w-sxPOEtspXKPPLBnZ1sNpwpVtZY5Ap0_owgScKWTZDlj1bpwcgTgDhIFbcC44wPcsieLy8yZC4jI6Tf9kqXLmfqMo53H_VXvx7yVJ2xW5JKa0eh8aX3sITkZ_Dh_Vexc5ZVP2vOSrRcffPD8fp0Mg8hZA4qxGmprj9SWPWPlMO5caS80MUIC5U5u-cUUpk7khWquoksgEdPaESYvnq3sbbobvw',
            assignments: 2,
            exams: 1,
            attendance: 91,
            averageGrade: 79,
        },
    ];

    const filteredClasses = classes.filter(cls => {
        if (filters.academicYear && !cls.level.includes(filters.academicYear)) return false;
        if (filters.level && cls.level !== filters.level) return false;
        if (filters.class && !cls.name.includes(filters.class)) return false;
        if (filters.subject && cls.subject !== filters.subject) return false;
        return true;
    });

    const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    const handleClearFilters = () => {
        setFilters({
            academicYear: '',
            term: '',
            level: '',
            class: '',
            subject: '',
        });
    };

    const handleClassClick = (classId: string) => {
        console.log('Navigate to class:', classId);
        // Navigate to class detail page
        // router.push(`/classes/${classId}`);
    };

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark p-4 sm:p-6 lg:p-10">
            <div className="max-w-screen-xl mx-auto">
                <PageHeader
                    title="My Classes"
                    description="View and manage all your assigned classes and subjects."
                />

                <FilterChips
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                />

                {filteredClasses.length > 0 ? (
                    <ClassGrid
                        classes={filteredClasses}
                        onClassClick={handleClassClick}
                    />
                ) : (
                    <EmptyState onResetFilters={handleClearFilters} />
                )}

                {/* Stats Summary */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Classes</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredClasses.length}</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {filteredClasses.reduce((sum, cls) => sum + cls.studentCount, 0)}
                        </p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Attendance</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {Math.round(filteredClasses.reduce((sum, cls) => sum + cls.attendance, 0) / filteredClasses.length)}%
                        </p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pending Grading</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {filteredClasses.reduce((sum, cls) => sum + cls.assignments + cls.exams, 0)}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
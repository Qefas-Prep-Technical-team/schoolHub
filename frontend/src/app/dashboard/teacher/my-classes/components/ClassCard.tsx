import { Users, Calendar, FileText, GraduationCap, CheckSquare, TrendingUp } from 'lucide-react';
import { Class } from './type';
import Link from 'next/link';


interface ClassCardProps {
    classData: Class;
    onClick: () => void;
}

export default function ClassCard({ classData, onClick }: ClassCardProps) {
    const getAttendanceColor = (attendance: number) => {
        if (attendance >= 95) return 'text-green-600 dark:text-green-400';
        if (attendance >= 85) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getGradeColor = (grade: number) => {
        if (grade >= 85) return 'text-green-600 dark:text-green-400';
        if (grade >= 75) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <Link
        href={"/dashboard/teacher/my-classes/class-details"}
            onClick={onClick}
            className="flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer group"
        >
            {/* Header Image */}
            <div
                className="w-full h-40 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${classData.image})` }}
            >
                <div className="w-full h-full bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
                <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                        {classData.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <Users className="w-4 h-4" />
                        <span>{classData.studentCount} Students</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{classData.schedule.join(', ')}</span>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="text-center">
                        <p className={`text-sm font-semibold ${getAttendanceColor(classData.attendance)}`}>
                            {classData.attendance}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Attendance</p>
                    </div>
                    <div className="text-center">
                        <p className={`text-sm font-semibold ${getGradeColor(classData.averageGrade)}`}>
                            {classData.averageGrade}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Grade</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log('View students for', classData.id);
                            }}
                            className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="View Students"
                        >
                            <Users className="w-5 h-5" />
                            <span className="text-xs font-medium">Students</span>
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log('View assignments for', classData.id);
                            }}
                            className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Assignments"
                        >
                            <FileText className="w-5 h-5" />
                            <span className="text-xs font-medium">Assignments</span>
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log('Take attendance for', classData.id);
                            }}
                            className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Attendance"
                        >
                            <CheckSquare className="w-5 h-5" />
                            <span className="text-xs font-medium">Attendance</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Pending Badge */}
            {(classData.assignments > 0 || classData.exams > 0) && (
                <div className="absolute top-2 right-2">
                    <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {classData.assignments + classData.exams} pending
                    </div>
                </div>
            )}
        </Link>
    );
}
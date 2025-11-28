import { ChevronsUpDown } from 'lucide-react';
import Badge from './ui/Badge';

interface Grade {
    id: string;
    studentName: string;
    studentId: string;
    className: string;
    subject: string;
    examType: string;
    score: number;
    grade: string;
    remarks: string;
    status: 'pass' | 'fail';
}

interface GradesTableProps {
    grades: Grade[];
    onEdit: (gradeId: string) => void;
}

export default function GradesTable({ grades, onEdit }: GradesTableProps) {
    const getGradeColor = (grade: string, status: 'pass' | 'fail') => {
        if (status === 'fail') {
            return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300';
        }

        switch (grade) {
            case 'A':
                return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';
            case 'B':
                return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';
            case 'C':
                return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300';
            case 'D':
                return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300';
            case 'F':
                return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300';
            default:
                return 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-300';
        }
    };

    const getRowClass = (status: 'pass' | 'fail') => {
        return status === 'fail' ? 'bg-red-50/50 dark:bg-red-900/20' : '';
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                        <th className="px-6 py-3 text-left" scope="col">
                            <div className="flex items-center gap-2 cursor-pointer">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Student Name
                                </span>
                                <ChevronsUpDown size={16} className="text-gray-400" />
                            </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">
                            ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">
                            Class
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">
                            Subject
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">
                            Exam
                        </th>
                        <th className="px-6 py-3 text-left" scope="col">
                            <div className="flex items-center gap-2 cursor-pointer">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Score
                                </span>
                                <ChevronsUpDown size={16} className="text-gray-400" />
                            </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">
                            Grade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">
                            Remarks
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {grades.map((grade) => (
                        <tr key={grade.id} className={getRowClass(grade.status)}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {grade.studentName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {grade.studentId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {grade.className}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {grade.subject}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {grade.examType}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${grade.status === 'fail'
                                ? 'text-red-700 dark:text-red-400 font-bold'
                                : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                {grade.score}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <Badge className={getGradeColor(grade.grade, grade.status)}>
                                    {grade.grade}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                {grade.remarks}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                    onClick={() => onEdit(grade.id)}
                                    className="text-primary dark:text-blue-400 hover:text-primary/80 dark:hover:text-blue-300 transition-colors"
                                >
                                    Edit
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
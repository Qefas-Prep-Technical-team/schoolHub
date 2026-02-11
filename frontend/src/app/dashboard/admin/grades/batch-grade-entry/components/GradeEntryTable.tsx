import GradeInput from './GradeInput';
import { StudentGrade } from './types';


interface GradeEntryTableProps {
    students: StudentGrade[];
    maxScore: number;
    onScoreChange: (studentId: string, score: number | null) => void;
    onRemarksChange: (studentId: string, remarks: string) => void;
}

export default function GradeEntryTable({
    students,
    maxScore,
    onScoreChange,
    onRemarksChange
}: GradeEntryTableProps) {
    return (
        <div className="flex flex-col @container bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 w-[30%]">
                                Student Name
                            </th>
                            <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 w-[20%]">
                                Student ID
                            </th>
                            <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 w-[20%]">
                                Score (Max {maxScore})
                            </th>
                            <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 w-[30%]">
                                Remarks
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => (
                            <tr
                                key={student.id}
                                className="border-t border-t-gray-200 dark:border-t-gray-700"
                            >
                                <td className="px-4 py-2 w-[30%] text-gray-900 dark:text-white font-medium">
                                    {student.studentName}
                                </td>
                                <td className="px-4 py-2 w-[20%] text-gray-500 dark:text-gray-400">
                                    {student.studentId}
                                </td>
                                <td className="px-4 py-2 w-[20%]">
                                    <GradeInput
                                        value={student.score}
                                        max={maxScore}
                                        hasError={student.hasError}
                                        onChange={(score) => onScoreChange(student.id, score)}
                                        placeholder="-"
                                    />
                                </td>
                                <td className="px-4 py-2 w-[30%]">
                                    <input
                                        type="text"
                                        value={student.remarks}
                                        onChange={(e) => onRemarksChange(student.id, e.target.value)}
                                        placeholder="Add a comment..."
                                        className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary px-3 py-1 text-sm"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
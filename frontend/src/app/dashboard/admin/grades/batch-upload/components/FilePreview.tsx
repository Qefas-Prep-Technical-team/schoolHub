import { GradeRecord } from './types';

interface FilePreviewProps {
    records: GradeRecord[];
    onRowHover?: (record: GradeRecord) => void;
}

export default function FilePreview({ records, onRowHover }: FilePreviewProps) {
    const hasErrors = records.some(record => record.errors && record.errors.length > 0);

    const getRowClass = (record: GradeRecord) => {
        if (record.errors && record.errors.length > 0) {
            return 'bg-red-50 dark:bg-red-900/20 border-b dark:border-slate-800 relative group';
        }
        return 'bg-white dark:bg-slate-900 border-b dark:border-slate-800';
    };

    const getCellClass = (record: GradeRecord, field: keyof GradeRecord) => {
        if (record.errors?.some(error => error.toLowerCase().includes(field as string))) {
            return 'font-medium text-red-600 dark:text-red-400';
        }
        return '';
    };

    return (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-400">
                <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-100 dark:bg-slate-800">
                    <tr>
                        <th className="px-6 py-3" scope="col">Student ID</th>
                        <th className="px-6 py-3" scope="col">Student Name</th>
                        <th className="px-6 py-3" scope="col">Subject Code</th>
                        <th className="px-6 py-3" scope="col">Grade</th>
                        <th className="px-6 py-3" scope="col">Comments</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((record, index) => (
                        <tr
                            key={index}
                            className={getRowClass(record)}
                            onMouseEnter={() => onRowHover?.(record)}
                        >
                            <td className={`px-6 py-4 ${getCellClass(record, 'studentId')}`}>
                                {record.studentId}
                            </td>
                            <td className={`px-6 py-4 ${getCellClass(record, 'studentName')}`}>
                                {record.studentName}
                            </td>
                            <td className={`px-6 py-4 ${getCellClass(record, 'subjectCode')}`}>
                                {record.subjectCode}
                            </td>
                            <td className={`px-6 py-4 ${getCellClass(record, 'grade')}`}>
                                {record.grade}
                            </td>
                            <td className={`px-6 py-4 ${getCellClass(record, 'comments')}`}>
                                {record.comments}
                            </td>

                            {/* Error Tooltip */}
                            {record.errors && record.errors.length > 0 && (
                                <td className="absolute right-4 top-1/2 -translate-y-1/2 hidden group-hover:block px-2 py-1 text-xs bg-slate-800 dark:bg-slate-700 text-white rounded-md">
                                    {record.errors[0]}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
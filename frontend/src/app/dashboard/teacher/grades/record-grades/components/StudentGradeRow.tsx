import React from 'react';

import GradeBadge from './GradeBadge';
import { MoreVertical } from 'lucide-react';
import { StudentGrade } from './types';

interface StudentGradeRowProps {
  student: StudentGrade;
  onSelect: (id: string, selected: boolean) => void;
  onScoreChange: (id: string, field: keyof StudentGrade, value: number) => void;
}

const StudentGradeRow: React.FC<StudentGradeRowProps> = ({
  student,
  onSelect,
  onScoreChange,
}) => {
  const validateScore = (value: number): boolean => {
    return value >= 0 && value <= 100;
  };

  const handleScoreChange = (
    field: 'caScore' | 'assignmentScore' | 'examScore',
    value: string
  ) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onScoreChange(student.id, field, numValue);
    }
  };

  const getInputClass = (hasError: boolean) =>
    `w-24 rounded-md shadow-sm focus:ring-primary sm:text-sm ${
      hasError
        ? 'border-red-500 ring-1 ring-red-500 dark:border-red-500'
        : 'border-gray-300 dark:border-gray-600'
    } dark:bg-gray-700 dark:text-white focus:border-primary`;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="px-4 py-2 whitespace-nowrap">
        <input
          type="checkbox"
          checked={student.isSelected}
          onChange={(e) => onSelect(student.id, e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary dark:bg-gray-700"
          aria-label={`Select student ${student.name}`}
        />
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
        {student.name}
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {student.studentId}
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        <input
          type="number"
          value={student.caScore}
          onChange={(e) => handleScoreChange('caScore', e.target.value)}
          className={getInputClass(student.hasError || false)}
          min="0"
          max="100"
          step="0.5"
        />
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        <input
          type="number"
          value={student.assignmentScore}
          onChange={(e) => handleScoreChange('assignmentScore', e.target.value)}
          className={getInputClass(student.hasError || false)}
          min="0"
          max="100"
          step="0.5"
        />
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        <input
          type="number"
          value={student.examScore}
          onChange={(e) => handleScoreChange('examScore', e.target.value)}
          className={getInputClass(student.hasError || false)}
          min="0"
          max="100"
          step="0.5"
        />
      </td>
      <td
        className={`px-4 py-2 whitespace-nowrap text-sm ${
          student.hasError
            ? 'text-red-500 dark:text-red-400'
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        {student.hasError ? 'Error' : student.total}
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        <GradeBadge grade={student.grade} isError={student.hasError} />
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-right">
        <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600">
          <MoreVertical className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
};

export default StudentGradeRow;
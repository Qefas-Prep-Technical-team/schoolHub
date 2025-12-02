import React from 'react';

import GradeTableToolbar from './GradeTableToolbar';
import StudentGradeRow from './StudentGradeRow';
import { StudentGrade } from './types';

interface GradeTableProps {
  students: StudentGrade[];
  onStudentsUpdate: (students: StudentGrade[]) => void;
}

const GradeTable: React.FC<GradeTableProps> = ({ students, onStudentsUpdate }) => {
  const selectedCount = students.filter((s) => s.isSelected).length;

  const handleSelectAll = (selected: boolean) => {
    const updatedStudents = students.map((student) => ({
      ...student,
      isSelected: selected,
    }));
    onStudentsUpdate(updatedStudents);
  };

  const handleSelectStudent = (id: string, selected: boolean) => {
    const updatedStudents = students.map((student) =>
      student.id === id ? { ...student, isSelected: selected } : student
    );
    onStudentsUpdate(updatedStudents);
  };

  const handleScoreChange = (
    id: string,
    field: keyof StudentGrade,
    value: number
  ) => {
    const updatedStudents = students.map((student) => {
      if (student.id === id) {
        const updated = { ...student, [field]: value };
        
        // Calculate total
        const total = updated.caScore + updated.assignmentScore + updated.examScore;
        updated.total = total;
        
        // Validate and calculate grade
        const hasError = [updated.caScore, updated.assignmentScore, updated.examScore]
          .some(score => score < 0 || score > 100);
        
        updated.hasError = hasError;
        
        if (!hasError) {
          // Simple grade calculation (customize as needed)
          if (total >= 90) updated.grade = 'A';
          else if (total >= 80) updated.grade = 'A-';
          else if (total >= 70) updated.grade = 'B';
          else if (total >= 60) updated.grade = 'C';
          else if (total >= 50) updated.grade = 'D';
          else updated.grade = 'F';
        } else {
          updated.grade = 'Invalid';
        }
        
        return updated;
      }
      return student;
    });
    onStudentsUpdate(updatedStudents);
  };

  const handleApplySameScore = () => {
    // Implement apply same score logic
    console.log('Apply same score to selected');
  };

  const handleClearSelected = () => {
    const updatedStudents = students.map((student) =>
      student.isSelected ? { ...student, isSelected: false } : student
    );
    onStudentsUpdate(updatedStudents);
  };

  return (
    <div className="flex flex-col gap-4">
      <GradeTableToolbar
        selectedCount={selectedCount}
        totalCount={students.length}
        onSelectAll={handleSelectAll}
        onApplySameScore={handleApplySameScore}
        onClearSelected={handleClearSelected}
      />
      
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1024px]">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCount === students.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary dark:bg-gray-700"
                    aria-label="Select all students"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wider">
                  Student Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wider">
                  Student ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wider">
                  CA Score
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wider">
                  Assignment Score
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wider">
                  Exam Score
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wider">
                  Grade
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {students.map((student) => (
                <StudentGradeRow
                  key={student.id}
                  student={student}
                  onSelect={handleSelectStudent}
                  onScoreChange={handleScoreChange}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-red-600 dark:text-red-400 mt-[-12px] px-1">
        Score must be between 0-100.
      </p>
    </div>
  );
};

export default GradeTable;
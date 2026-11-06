import React, { useMemo, Fragment } from 'react';
import GradeTableToolbar from './GradeTableToolbar';
import StudentGradeRow from './StudentGradeRow';
import { StudentGrade } from './types';
import { calculateGrade } from '../../utils/gradeCalculator';
import { getEffectiveGradingSystem, type GradingTier } from '@/utils/gradingSystem';
import { groupByDate } from '@/app/dashboard/teacher/utils/dateSectioning';

interface GradeTableProps {
  students: StudentGrade[];
  onStudentsUpdate: (students: StudentGrade[]) => void;
  gradingSystem?: GradingTier[] | null;
}

const GradeTable: React.FC<GradeTableProps> = ({ students, onStudentsUpdate, gradingSystem }) => {
  const selectedCount = students.filter((s) => s.isSelected).length;
  const activeGradingScale = useMemo(() => getEffectiveGradingSystem(gradingSystem), [gradingSystem]);

  const groupedStudents = useMemo(() => {
    return groupByDate(students, (s) => s.recordedAt);
  }, [students]);

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
        
        // Calculate percentage for the total column (assuming 100 as base for record-grades form)
        updated.total = updated.score; // Store numeric for internal use
        
        // Validate and calculate grade
        const hasError = updated.score < 0 || updated.score > 100; 
        
        updated.hasError = hasError;
        
        if (!hasError) {
          updated.grade = calculateGrade(updated.score, 100, activeGradingScale);
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
                  Student Code
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wider">
                  Subject Paper
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wider">
                  Score
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
              {groupedStudents.map((group) => (
                <Fragment key={group.label}>
                  <tr className="bg-slate-50/90 dark:bg-gray-900/60 border-y border-gray-200/70 dark:border-gray-700">
                    <td colSpan={9} className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="size-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                          {group.label}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full">
                          {group.items.length} {group.items.length === 1 ? 'record' : 'records'}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {group.items.map((student) => (
                    <StudentGradeRow
                      key={student.id}
                      student={{
                        ...student,
                        grade: student.hasError ? 'Invalid' : calculateGrade(student.score, 100, activeGradingScale),
                      }}
                      onSelect={handleSelectStudent}
                      onScoreChange={handleScoreChange}
                    />
                  ))}
                </Fragment>
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

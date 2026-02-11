// src/components/Dashboard/SubjectTable.tsx
import React from 'react';
import { SubjectData } from './types';

const SubjectTable: React.FC = () => {
  const subjects: SubjectData[] = [
    {
      subject: 'Mathematics',
      testAvg: '92%',
      examScore: '98%',
      finalScore: '95%',
      grade: 'A+',
      comment: 'Excellent work!',
    },
    {
      subject: 'Physics',
      testAvg: '85%',
      examScore: '90%',
      finalScore: '88%',
      grade: 'A',
      comment: 'Great improvement.',
    },
    {
      subject: 'English',
      testAvg: '78%',
      examScore: '82%',
      finalScore: '80%',
      grade: 'B+',
      comment: 'Consistent effort.',
    },
    {
      subject: 'Chemistry',
      testAvg: '65%',
      examScore: '70%',
      finalScore: '68%',
      grade: 'C+',
      comment: 'Needs more focus.',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">
        Subject Breakdown
      </h2>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                Subject
              </th>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-400 text-center">
                Test Avg.
              </th>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-400 text-center">
                Exam Score
              </th>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-400 text-center">
                Final Score
              </th>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-400 text-center">
                Grade
              </th>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">
                Comment
              </th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject, index) => (
              <tr 
                key={subject.subject} 
                className={`border-b border-slate-200 dark:border-slate-800 ${
                  index === subjects.length - 1 ? 'last:border-b-0' : ''
                }`}
              >
                <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                  {subject.subject}
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300 text-center">
                  {subject.testAvg}
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300 text-center">
                  {subject.examScore}
                </td>
                <td className="p-4 font-bold text-slate-800 dark:text-slate-100 text-center">
                  {subject.finalScore}
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300 text-center">
                  {subject.grade}
                </td>
                <td className="p-4 text-slate-500 dark:text-slate-400 text-sm hidden md:table-cell">
                  {subject.comment}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubjectTable;
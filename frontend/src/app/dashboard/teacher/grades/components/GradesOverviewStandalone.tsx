'use client';

import { useState } from 'react';

const GradesOverviewStandalone: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const grades = [
    {
      id: 1,
      name: 'Olivia Chen',
      studentId: 'S-2041',
      caScore: '18/20',
      assignmentScore: '45/50',
      examScore: '88/100',
      totalScore: '151',
      grade: 'A',
      status: 'Graded'
    },
    {
      id: 2,
      name: 'Ben Carter',
      studentId: 'S-2042',
      caScore: '15/20',
      assignmentScore: '40/50',
      examScore: '75/100',
      totalScore: '130',
      grade: 'B',
      status: 'Graded'
    },
    // ... more grades
  ];

  const filters = [
    { label: 'Term: Fall 2024', icon: 'expand_more' },
    { label: 'Class: Grade 10-A', icon: 'expand_more' },
    { label: 'Subject: Mathematics', icon: 'expand_more' }
  ];

  const handleAddGrade = () => {
    console.log('Add new grade');
  };

  const handleExport = () => {
    console.log('Export to CSV');
  };

  const handleEditGrade = (gradeId: number) => {
    console.log('Edit grade:', gradeId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Simplified Header */}
      <header className="bg-white dark:bg-gray-800 border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Grades</h1>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            onClick={handleAddGrade}
          >
            <span className="material-symbols-outlined">add</span>
            Record New Grade
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {filters.map((filter) => (
            <button
              key={filter.label}
              className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {filter.label}
              <span className="material-symbols-outlined">{filter.icon}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-4 border-b flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search students..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="flex items-center gap-2 border px-3 py-2 rounded-lg">
                <span className="material-symbols-outlined">filter_list</span>
                Filter
              </button>
            </div>
            <button 
              className="flex items-center gap-2 border px-3 py-2 rounded-lg"
              onClick={handleExport}
            >
              <span className="material-symbols-outlined">ios_share</span>
              Export CSV
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['Student Name', 'Student ID', 'CA', 'Assignment', 'Exam', 'Total', 'Grade', 'Status', 'Actions'].map((header) => (
                    <th key={header} className="px-4 py-3 text-left">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => (
                  <tr key={grade.id} className="border-t">
                    <td className="px-4 py-3">{grade.name}</td>
                    <td className="px-4 py-3 text-gray-500">{grade.studentId}</td>
                    <td className="px-4 py-3 text-center">{grade.caScore}</td>
                    <td className="px-4 py-3 text-center">{grade.assignmentScore}</td>
                    <td className="px-4 py-3 text-center">{grade.examScore}</td>
                    <td className="px-4 py-3 text-center font-medium">{grade.totalScore}</td>
                    <td className="px-4 py-3 text-center font-medium">{grade.grade}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        grade.status === 'Graded' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {grade.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        onClick={() => handleEditGrade(grade.id)}
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t flex justify-between items-center">
            <p className="text-gray-500">Showing 1 to 5 of 25 results</p>
            <div className="flex gap-2">
              <button className="w-8 h-8 border rounded flex items-center justify-center">
                ←
              </button>
              <button className="w-8 h-8 border rounded bg-blue-100 text-blue-600">
                1
              </button>
              <button className="w-8 h-8 border rounded">2</button>
              <button className="w-8 h-8 border rounded">3</button>
              <span className="px-2">...</span>
              <button className="w-8 h-8 border rounded">5</button>
              <button className="w-8 h-8 border rounded flex items-center justify-center">
                →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GradesOverviewStandalone;
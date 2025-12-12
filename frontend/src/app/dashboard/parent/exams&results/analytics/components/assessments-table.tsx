"use client"

import Link from 'next/link'

interface Assessment {
  id: string
  title: string
  module: string
  date: string
  type: 'Exam' | 'Quiz' | 'Project'
  score: string
  status: 'Graded' | 'Pending'
}

export default function AssessmentsTable() {
  const assessments: Assessment[] = [
    {
      id: '1',
      title: 'Polynomials Unit Test',
      module: 'Algebra Module',
      date: 'Jan 15, 2024',
      type: 'Exam',
      score: '92/100',
      status: 'Graded'
    },
    {
      id: '2',
      title: 'Geometry Quiz 2',
      module: 'Shapes & Angles',
      date: 'Jan 08, 2024',
      type: 'Quiz',
      score: '85/100',
      status: 'Graded'
    },
    {
      id: '3',
      title: 'Winter Math Project',
      module: 'Applied Mathematics',
      date: 'Dec 20, 2023',
      type: 'Project',
      score: '--',
      status: 'Pending'
    }
  ]

  const getStatusColor = (status: Assessment['status']) => {
    return status === 'Graded'
      ? 'text-green-600 dark:text-green-400'
      : 'text-orange-500'
  }

  const getStatusIcon = (status: Assessment['status']) => {
    return status === 'Graded'
      ? 'bg-green-500'
      : 'bg-orange-500 animate-pulse'
  }

  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Recent Assessments
        </h3>
        <Link
          href="#"
          className="text-sm text-primary font-medium hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Assessment</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Score</th>
              <th className="px-6 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
            {assessments.map((assessment) => (
              <tr
                key={assessment.id}
                className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">
                    {assessment.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {assessment.module}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {assessment.date}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                    {assessment.type}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                  {assessment.score}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold ${getStatusColor(assessment.status)}`}>
                    <span className={`size-1.5 rounded-full ${getStatusIcon(assessment.status)}`}></span>
                    {assessment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
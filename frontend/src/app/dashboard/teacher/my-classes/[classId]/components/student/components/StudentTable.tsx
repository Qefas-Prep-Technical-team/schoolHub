'use client'

import { Icon } from './Icon'
import { Student } from './types'
import { cn, getStatusColor } from './utils'


interface StudentTableProps {
  students: Student[]
  onView: (student: Student) => void
  onCall: (student: Student) => void
}

export function StudentTable({ students, onView, onCall }: StudentTableProps) {
  const tableHeaders = [
    { key: 'student', label: 'Student', className: 'w-2/5' },
    { key: 'studentId', label: 'Student ID', className: 'w-1/5 hidden @sm:table-cell' },
    { key: 'gender', label: 'Gender', className: 'w-1/5 hidden @sm:table-cell' },
    { key: 'status', label: 'Status', className: 'w-1/5 hidden @xs:table-cell' },
    { key: 'actions', label: 'Actions', className: 'w-auto text-center' },
  ]

  return (
    <div className="px-4 py-3 @container">
      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              {tableHeaders.map((header) => (
                <th
                  key={header.key}
                  className={cn(
                    "px-4 py-3 text-left text-sm font-medium",
                    "text-slate-600 dark:text-slate-300",
                    header.className
                  )}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-background-light dark:bg-background-dark">
            {students.map((student) => (
              <tr
                key={student.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="h-[72px] px-4 py-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatar}
                      alt={`Photo of ${student.name}`}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <span className="text-slate-900 dark:text-white text-sm font-normal leading-normal">
                      {student.name}
                    </span>
                  </div>
                </td>
                <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal hidden @sm:table-cell">
                  {student.studentId}
                </td>
                <td className="h-[72px] px-4 py-2 text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal hidden @sm:table-cell">
                  {student.gender.charAt(0).toUpperCase() + student.gender.slice(1)}
                </td>
                <td className="h-[72px] px-4 py-2 hidden @xs:table-cell">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                      getStatusColor(student.status)
                    )}
                  >
                    {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                  </span>
                </td>
                <td className="h-[72px] px-4 py-2">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onCall(student)}
                      className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Icon
                        name="call"
                        className="text-slate-600 dark:text-slate-300"
                      />
                    </button>
                    <button
                      onClick={() => onView(student)}
                      className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Icon
                        name="visibility"
                        className="text-primary"
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
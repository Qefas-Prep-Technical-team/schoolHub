import React from 'react'

interface Assignment {
  title: string
  due: string
  status: 'urgent' | 'upcoming'
}

const assignments: Assignment[] = [
  { title: 'History Essay', due: 'Due Tomorrow', status: 'urgent' },
  { title: 'Physics Lab Report', due: 'Due Oct 28', status: 'upcoming' },
]

export default function AssignmentsCard() {
  return (
    <div className="bg-card-light dark:bg-card-dark p-5 rounded-xl shadow-sm border border-border-light dark:border-border-dark flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-lg">
            <span className="material-symbols-outlined">edit_document</span>
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Assignments</h3>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 flex-1">
        {assignments.map((assignment, index) => (
          <div 
            key={index}
            className={`border-l-2 pl-3 py-1 ${assignment.status === 'urgent' 
              ? 'border-red-500' 
              : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            <p className="text-sm font-medium text-slate-900 dark:text-white">{assignment.title}</p>
            <p className={`text-xs mt-0.5 ${assignment.status === 'urgent' 
              ? 'text-red-500 font-medium' 
              : 'text-slate-500 dark:text-slate-400'
            }`}>
              {assignment.due}
            </p>
          </div>
        ))}
      </div>
      
      <button className="mt-4 text-teal-600 text-sm font-semibold hover:underline flex items-center gap-1">
        All Assignments <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
      </button>
    </div>
  )
}
"use client"

interface SubjectInfo {
  name: string
  teacher: string
  grade: string
  term: string
  status: string
  icon: string
}

export default function SubjectHeader() {
  const subject: SubjectInfo = {
    name: 'Mathematics',
    teacher: 'Mr. Anderson',
    grade: 'Grade 5',
    term: 'Term 2',
    status: 'On Track',
    icon: 'functions'
  }

  return (
    <div className="flex items-start gap-6">
      <div className="size-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
        <span className="material-symbols-outlined text-4xl">{subject.icon}</span>
      </div>
      <div className="flex-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
          {subject.name}
        </h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 dark:text-slate-400 text-sm">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">person</span>
            Teacher: {subject.teacher}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">school</span>
            {subject.grade} • {subject.term}
          </span>
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
            <span className="material-symbols-outlined text-lg">trending_up</span>
            {subject.status}
          </span>
        </div>
      </div>
    </div>
  )
}
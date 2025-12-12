"use client"

interface Subject {
  name: string
  continuousAssessment: number
  exam: number
  total: number
  grade: string
  gradeColor: string
  remark: string
}

export default function AcademicTable() {
  const subjects: Subject[] = [
    {
      name: 'Mathematics',
      continuousAssessment: 35,
      exam: 53,
      total: 88,
      grade: 'A',
      gradeColor: 'green',
      remark: 'Excellent performance'
    },
    {
      name: 'English Language',
      continuousAssessment: 30,
      exam: 48,
      total: 78,
      grade: 'B',
      gradeColor: 'lime',
      remark: 'Very good essay work'
    },
    {
      name: 'General Science',
      continuousAssessment: 28,
      exam: 42,
      total: 70,
      grade: 'B',
      gradeColor: 'lime',
      remark: 'Good understanding'
    },
    {
      name: 'Social Studies',
      continuousAssessment: 32,
      exam: 50,
      total: 82,
      grade: 'A',
      gradeColor: 'green',
      remark: 'Active in class'
    },
    {
      name: 'Art & Craft',
      continuousAssessment: 38,
      exam: 55,
      total: 93,
      grade: 'A+',
      gradeColor: 'green',
      remark: 'Outstanding creativity'
    },
    {
      name: 'French',
      continuousAssessment: 20,
      exam: 35,
      total: 55,
      grade: 'C',
      gradeColor: 'yellow',
      remark: 'Needs more practice'
    }
  ]

  const getGradeColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'lime':
        return 'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400'
      case 'yellow':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
    }
  }

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
              <th className="p-4 min-w-[200px]">Subject</th>
              <th className="p-4 text-center">C.A (40)</th>
              <th className="p-4 text-center">Exam (60)</th>
              <th className="p-4 text-center">Total (100)</th>
              <th className="p-4 text-center">Grade</th>
              <th className="p-4 min-w-[150px]">Remark</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
            {subjects.map((subject) => (
              <tr
                key={subject.name}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <td className="p-4 font-medium text-slate-900 dark:text-white">
                  {subject.name}
                </td>
                <td className="p-4 text-center text-slate-600 dark:text-slate-300">
                  {subject.continuousAssessment}
                </td>
                <td className="p-4 text-center text-slate-600 dark:text-slate-300">
                  {subject.exam}
                </td>
                <td className="p-4 text-center font-bold text-slate-900 dark:text-white">
                  {subject.total}
                </td>
                <td className="p-4 text-center">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${getGradeColor(subject.gradeColor)}`}>
                    {subject.grade}
                  </span>
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-400">
                  {subject.remark}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { BarChart } from 'lucide-react'
import { Card } from './ui/Card'

const subjects = [
  { name: 'Math', score: 85, color: 'bg-primary/80 hover:bg-primary' },
  { name: 'Science', score: 92, color: 'bg-primary/80 hover:bg-primary' },
  { name: 'English', score: 78, color: 'bg-primary/80 hover:bg-primary' },
  { name: 'History', score: 88, color: 'bg-primary/80 hover:bg-primary' },
  { name: 'Art', score: 96, color: 'bg-primary/80 hover:bg-primary' },
]

export default function AcademicProgress() {
  const [selectedTerm, setSelectedTerm] = useState('Mid Term')

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart className="text-primary" />
          Subject Performance
        </h3>
        <div className="flex gap-2">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-lg border-none focus:ring-0 py-1 pl-2 pr-6"
          >
            <option>Mid Term</option>
            <option>Finals</option>
          </select>
        </div>
      </div>

      {/* Simplified Bar Chart */}
      <div className="flex items-end justify-between h-48 gap-4 px-2 mt-4 pb-2 border-b border-slate-200 dark:border-slate-700 relative">
        {/* Y-Axis Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-xs text-slate-300">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="border-t border-dashed border-slate-200 dark:border-slate-800 w-full h-0"
            />
          ))}
        </div>

        {/* Bars */}
        {subjects.map((subject) => (
          <div key={subject.name} className="flex flex-col items-center gap-2 flex-1 z-10 group">
            <div className="relative w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg h-full flex items-end overflow-hidden">
              <div
                className={`w-full transition-all rounded-t-lg relative ${subject.color}`}
                style={{ height: `${subject.score}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {subject.score}%
                </div>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-500">{subject.name}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
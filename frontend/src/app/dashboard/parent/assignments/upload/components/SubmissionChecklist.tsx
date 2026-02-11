'use client'

import { useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { Card } from './ui/Card'
import { ProgressBar } from './ui/ProgressBar'

interface ChecklistItem {
  id: number
  text: string
  completed: boolean
}

const initialChecklist: ChecklistItem[] = [
  { id: 1, text: 'Research paper uploaded (PDF)', completed: true },
  { id: 2, text: 'Experiment video included', completed: false },
  { id: 3, text: 'Parent confirmation note', completed: false },
]

export default function SubmissionChecklist() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist)

  const toggleItem = (id: number) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ))
  }

  const completedCount = checklist.filter(item => item.completed).length
  const completionPercentage = Math.round((completedCount / checklist.length) * 100)

  return (
    <Card className="overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-3 border-b border-[#e8ebf3] dark:border-gray-800">
        <h3 className="text-base font-bold text-text-main-light dark:text-text-main-dark">
          Submission Checklist
        </h3>
      </div>
      
      <div className="p-5 flex flex-col gap-4">
        {checklist.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 items-start cursor-pointer"
            onClick={() => toggleItem(item.id)}
          >
            <div className="mt-0.5">
              {item.completed ? (
                <CheckCircle2 className="text-green-500 size-5" />
              ) : (
                <Circle className="text-gray-400 size-5" />
              )}
            </div>
            <p className={`text-sm ${item.completed ? 'text-text-main-light dark:text-text-main-dark' : 'text-text-main-light dark:text-text-main-dark opacity-50'}`}>
              {item.text}
            </p>
          </div>
        ))}
        
        <div className="mt-2 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-sec-light dark:text-text-sec-dark">Completion</span>
            <span className="font-bold text-primary">{completionPercentage}%</span>
          </div>
          <ProgressBar
            value={completionPercentage}
            className="mt-2 h-2"
            showLabel={false}
          />
        </div>
      </div>
    </Card>
  )
}
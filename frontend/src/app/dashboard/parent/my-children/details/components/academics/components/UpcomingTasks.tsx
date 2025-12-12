'use client'

import { useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { Checkbox } from './ui/Checkbox'

interface Task {
  id: number
  title: string
  dueDate: string
  isUrgent: boolean
  completed: boolean
}

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Geometry Project: Shapes',
    dueDate: 'Due Tomorrow, 11:59 PM',
    isUrgent: true,
    completed: false,
  },
  {
    id: 2,
    title: 'Chapter 5 Reading',
    dueDate: 'Due Friday, Oct 20',
    isUrgent: false,
    completed: false,
  },
]

export default function UpcomingTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold flex items-center gap-2">
          <ClipboardList className="text-primary size-5" />
          Upcoming Tasks
        </h4>
        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full font-medium">
          2 Due Soon
        </span>
      </div>

      <ul className="flex flex-col gap-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-start gap-3 pb-3 border-b border-border-light dark:border-border-dark last:border-0 last:pb-0"
          >
            <Checkbox
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-text-main-light dark:text-text-main-dark">
                {task.title}
              </p>
              <p className={`text-xs font-medium mt-0.5 ${
                task.isUrgent ? 'text-red-500' : 'text-text-secondary-light dark:text-text-secondary-dark'
              }`}>
                {task.dueDate}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
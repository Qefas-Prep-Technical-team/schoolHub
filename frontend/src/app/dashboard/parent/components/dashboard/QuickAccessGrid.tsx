import React from 'react'

interface QuickAccessItem {
  icon: string
  label: string
  color: string
}

const quickAccessItems: QuickAccessItem[] = [
  { icon: 'description', label: 'Results', color: 'bg-blue-50 dark:bg-blue-900/20 text-primary' },
  { icon: 'folder_open', label: 'Documents', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
  { icon: 'payments', label: 'Fees', color: 'bg-green-50 dark:bg-green-900/20 text-green-600' },
  { icon: 'psychology', label: 'Behaviour', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' },
  { icon: 'directions_bus', label: 'Transport', color: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600' },
  { icon: 'local_library', label: 'Library', color: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600' },
]

export default function QuickAccessGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {quickAccessItems.map((item, index) => (
        <button
          key={index}
          className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm hover:shadow-md hover:border-primary/50 transition-all group"
        >
          <div className={`p-3 rounded-full ${item.color} group-hover:scale-110 transition-transform`}>
            <span className="material-symbols-outlined">{item.icon}</span>
          </div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
        </button>
      ))}
    </div>
  )
}
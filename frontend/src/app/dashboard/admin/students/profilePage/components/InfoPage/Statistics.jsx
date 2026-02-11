// app/components/Statistics.jsx
export default function Statistics() {
  const stats = [
    { icon: 'task_alt', value: '98%', label: 'Attendance', color: 'green' },
    { icon: 'grade', value: '85%', label: 'Avg. Grade', color: 'yellow' },
    { icon: 'sentiment_satisfied', value: 'Good', label: 'Behaviour', color: 'primary' },
    { icon: 'receipt_long', value: 'Overdue', label: 'Payments', color: 'red' },
  ]

  const getColorClasses = (color) => {
    const colors = {
      green: 'text-green-500',
      yellow: 'text-yellow-500',
      primary: 'text-primary',
      red: 'text-red-500'
    }
    return colors[color] || 'text-primary'
  }

  const getTextColorClasses = (color) => {
    const colors = {
      green: 'text-green-600 dark:text-green-400',
      yellow: 'text-yellow-600 dark:text-yellow-400',
      primary: 'text-primary',
      red: 'text-red-600 dark:text-red-400'
    }
    return colors[color] || 'text-primary'
  }

  return (
    <div className="bg-white dark:bg-[#1C252E] rounded-xl shadow-sm p-6">
      <h2 className="text-[#0e141b] dark:text-slate-200 text-lg font-bold leading-tight tracking-[-0.015em] mb-4">
        Statistics
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
            <span className={`material-symbols-outlined ${getColorClasses(stat.color)} text-3xl`}>
              {stat.icon}
            </span>
            <p className={`text-2xl font-bold ${getTextColorClasses(stat.color)} mt-1`}>
              {stat.value}
            </p>
            <p className="text-xs text-[#4e7397] dark:text-slate-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
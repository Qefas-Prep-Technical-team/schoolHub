// app/student/classes/components/ClassesStats.tsx
interface ClassesStatsProps {
  totalClasses: number
  activeClasses: number
  assignmentsDue: number
  avgProgress: number
}

export default function ClassesStats({ 
  totalClasses, 
  activeClasses, 
  assignmentsDue, 
  avgProgress 
}: ClassesStatsProps) {
  const stats = [
    {
      label: 'Total Classes',
      value: totalClasses.toString(),
      icon: '📚',
      color: 'text-blue-600'
    },
    {
      label: 'Active Classes',
      value: activeClasses.toString(),
      icon: '🎯',
      color: 'text-green-600'
    },
    {
      label: 'Assignments Due',
      value: assignmentsDue.toString(),
      icon: '📝',
      color: 'text-orange-600'
    },
    {
      label: 'Avg. Progress',
      value: `${avgProgress}%`,
      icon: '📈',
      color: 'text-purple-600'
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{stat.icon}</span>
            <span className={`text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  )
}
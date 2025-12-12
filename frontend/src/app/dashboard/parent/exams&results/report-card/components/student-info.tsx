"use client"

interface StudentInfo {
  name: string
  studentId: string
  grade: string
  age: number
  avatar: string
}

interface StatCard {
  title: string
  value: string
  unit: string
  description: string
  trend?: string
  icon: string
  color: string
  bgColor: string
  borderColor: string
  textColor: string
}

export default function StudentInfo() {
  const student: StudentInfo = {
    name: 'Alex Doe',
    studentId: 'STU-2023-042',
    grade: 'Grade 5-B',
    age: 11,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXw3iuBlRx86Js8a1_U39P-ZPm8vimarW8cauo5g4fB-aWsGQidD_mZzgn5OzIWdQm6LDLjJ1CEe6IxD5ES2fuXp8rsRN5En_YFndPwbjYCblPzmy3U7zbDADACcGkpxjqI8DUGpxPdlGfqvtaXb5H4m8Pcar2JvVvYsV9O7oKtf5_OudiWo1o_lVPOUM7cysFWHKTRlcXcb0tof-aGsNbKC8g9X2HnarjcprLeRqPVEnAg1a8RJKCkSC7NPXARPsYYUvn2rFtwjs'
  }

  const stats: StatCard[] = [
    {
      title: 'Average Score',
      value: '82.5',
      unit: '%',
      description: '+2.4% vs last term',
      trend: 'trending_up',
      icon: 'monitoring',
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/10',
      borderColor: 'border-blue-100 dark:border-blue-900/30',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Class Position',
      value: '4',
      unit: 'th',
      description: 'Top 15% of class',
      icon: 'military_tech',
      color: 'purple',
      bgColor: 'bg-purple-50 dark:bg-purple-900/10',
      borderColor: 'border-purple-100 dark:border-purple-900/30',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Attendance',
      value: '96',
      unit: '%',
      description: '58 / 60 Days present',
      icon: 'check_circle',
      color: 'teal',
      bgColor: 'bg-teal-50 dark:bg-teal-900/10',
      borderColor: 'border-teal-100 dark:border-teal-900/30',
      textColor: 'text-teal-600 dark:text-teal-400'
    }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      {/* Student Details */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <div className="flex gap-4 items-center">
          <div 
            className="w-20 h-20 rounded-xl bg-cover bg-center border-2 border-slate-100 dark:border-slate-700 shadow-sm"
            style={{ backgroundImage: `url('${student.avatar}')` }}
          />
          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              {student.name}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              ID: <span className="font-mono text-slate-700 dark:text-slate-300">{student.studentId}</span>
            </p>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 rounded">
                {student.grade}
              </span>
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 rounded">
                Age: {student.age}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Stats Cards */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`p-4 rounded-xl ${stat.bgColor} border ${stat.borderColor} flex flex-col justify-between`}
          >
            <div className="flex justify-between items-start mb-2">
              <p className={`text-xs font-semibold ${stat.textColor} uppercase`}>
                {stat.title}
              </p>
              <span className={`material-symbols-outlined text-xl text-${stat.color}-500`}>
                {stat.icon}
              </span>
            </div>
            
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stat.value}
                {stat.unit === 'th' ? (
                  <span className="text-base align-super">{stat.unit}</span>
                ) : (
                  <span className="text-lg text-slate-400 dark:text-slate-500 font-medium">
                    {stat.unit}
                  </span>
                )}
              </p>
            </div>
            
            <p className={`text-xs ${stat.textColor} mt-1 flex items-center gap-1`}>
              {stat.trend && (
                <span className="material-symbols-outlined text-sm">
                  {stat.trend}
                </span>
              )}
              {stat.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
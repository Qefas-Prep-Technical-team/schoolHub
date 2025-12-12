import Image from 'next/image'
import { Button } from './ui/Button'
import { Mail, Calendar, Download, Verified, School } from 'lucide-react'

interface ProfileHeaderProps {
  childName: string
  className: string
  studentId: string
  age: number
  attendance: number
  averageScore: number
  rank: number
  standing: string
}

export default function ProfileHeader({
  childName = 'Alex Johnson',
  className = 'Class 5-B',
  studentId = '2023-445',
  age = 10,
  attendance = 94,
  averageScore = 88,
  rank = 5,
  standing = 'Excellent Standing',
}: ProfileHeaderProps) {
  return (
    <div className="bg-white dark:bg-[#1a2230] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 justify-between">
        {/* Child Info */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="relative">
            <div className="relative size-32">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5TJ-iqhu-nEUjEDgQcoYQ1FSJmYtxUoTFJEOmbgEuZp3AAX4VlT_PGEGfa00wXpXtv0GLo68iNB2PkxuU-7h5r6LlMEjDTHFJMebEb43r_Qx6bSgx7J0C9wBse1sCU1L_gwQMXTyg__4JDjemopZVROrz11Ltmr7f5kkWm7PgJzME1KHOvfXvNLPxY0YcJ8E_77aQwHvJeW01afMD264esnJd3NDaLmE7wLGoR8OWulZwHHxIT6k9CuEevgcGiMDbbmUXHCFoDgA"
                alt="Portrait of a young student boy smiling"
                fill
                className="rounded-2xl shadow-inner border border-slate-100 dark:border-slate-700 object-cover"
              />
            </div>
            <div className="absolute -bottom-3 -right-3 bg-white dark:bg-[#1a2230] p-1 rounded-full">
              <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full p-1.5 flex items-center justify-center border border-green-200 dark:border-green-800">
                <Verified className="size-5" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-slate-900 dark:text-white text-2xl sm:text-3xl font-bold tracking-tight">
                  {childName}
                </h1>
                <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200 dark:border-green-800 flex items-center gap-1">
                  <School className="size-3" />
                  {standing}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-base">
                {className} • ID: {studentId} • {age} Years Old
              </p>
            </div>

            <div className="flex flex-wrap gap-4 mt-1">
              <div className="flex flex-col gap-1 pr-4 border-r border-slate-200 dark:border-slate-700">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Attendance
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {attendance}%
                  </span>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    +2%
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1 pr-4 border-r border-slate-200 dark:border-slate-700">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Avg Score
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {averageScore}%
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    B+
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Rank
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {rank}
                    <span className="text-sm font-normal text-slate-500">th</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-row lg:flex-col items-stretch lg:items-end gap-3 w-full lg:w-auto mt-4 lg:mt-0">
          <Button className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5">
            <Mail className="size-5" />
            <span>Message Teacher</span>
          </Button>

          <div className="flex gap-3 flex-1 lg:flex-none">
            <Button
              variant="secondary"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5"
            >
              <Calendar className="size-5" />
              <span className="hidden sm:inline">Timetable</span>
            </Button>

            <Button
              variant="secondary"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5"
            >
              <Download className="size-5" />
              <span className="hidden sm:inline">Report Card</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
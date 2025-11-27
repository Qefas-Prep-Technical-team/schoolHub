import Card from './ui/Card'

interface KeyStats {
  totalClasses: number
  totalStudents: number
  attendanceRate: string
  yearsOfExperience: number
}

interface KeyStatsCardProps {
  stats: KeyStats
}

export default function KeyStatsCard({ stats }: KeyStatsCardProps) {
  return (
    <Card className="p-6 flex flex-col gap-4">
      <h3 className="font-bold text-lg text-[#343A40] dark:text-white">
        Key Stats
      </h3>
      <div className="flex flex-col gap-4 border-t border-gray-200/60 dark:border-gray-800 pt-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-[#6C757D]">Total Classes</p>
          <p className="font-bold text-lg text-primary">{stats.totalClasses}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-[#6C757D]">Total Students</p>
          <p className="font-bold text-lg text-primary">{stats.totalStudents}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-[#6C757D]">Attendance Rate</p>
          <p className="font-bold text-lg text-primary">{stats.attendanceRate}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-[#6C757D]">Years of Experience</p>
          <p className="font-bold text-lg text-primary">{stats.yearsOfExperience}</p>
        </div>
      </div>
    </Card>
  )
}
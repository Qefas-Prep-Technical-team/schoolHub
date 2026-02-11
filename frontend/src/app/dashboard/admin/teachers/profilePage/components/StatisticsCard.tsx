import Card from './ui/Card'
import StatCard from './ui/StatCard'


interface Statistics {
  classPerformance: string
  attendanceRate: string
  upcomingClasses: string
  studentsTaught: string
}

interface StatisticsCardProps {
  statistics: Statistics
}

export default function StatisticsCard({ statistics }: StatisticsCardProps) {
  return (
    <Card className="p-6 flex flex-col gap-4">
      <h3 className="text-text-primary-light dark:text-text-primary-dark text-xl font-bold leading-tight">
        Statistics
      </h3>
      <StatCard
        icon="pie_chart" 
        value={statistics.classPerformance}
        label="Class Performance Avg."
      />
      <StatCard 
        icon="checklist" 
        value={statistics.attendanceRate}
        label="Attendance Rate"
      />
      <StatCard 
        icon="event_upcoming" 
        value={statistics.upcomingClasses}
        label="Upcoming Classes Today"
      />
      <StatCard 
        icon="groups" 
        value={statistics.studentsTaught}
        label="Students Taught"
      />
    </Card>
  )
}
"use client"
import { useState } from 'react'
import TimetableToolbar from './TimetableToolbar'
import WeeklyTimetable from './WeeklyTimetable'
import AddScheduleModal from './AddScheduleModal'
import { useTeacherTimetable } from '@/lib/api/hooks/useAdmin'
import { Loader2 } from 'lucide-react'

interface SchedulePageProps {
  teacher: any
  teacherId: string
}

export default function SchedulePage({ teacher, teacherId }: SchedulePageProps) {
  const { data: timetableData, isLoading } = useTeacherTimetable(teacherId)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null)
  
  // Hardcoded for now as it's not dynamic in the current UI design
  const [currentWeek] = useState('Current Week Schedule')

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-slate-500 font-medium">Loading schedule...</p>
      </div>
    )
  }

  const handlePreviousWeek = () => {
    console.log('Previous week')
  }

  const handleNextWeek = () => {
    console.log('Next week')
  }

  const handleAddClass = () => {
    setSelectedPeriod(null)
    setIsModalOpen(true)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleClassClick = (periodId: string) => {
    const period = timetableData.find((p: any) => p.id === periodId)
    if (period) {
      setSelectedPeriod({
        id: period.id,
        classId: period.classId,
        subjectId: period.subjectId,
        day: period.day,
        startTime: period.startTime,
        endTime: period.endTime,
        room: period.room,
      })
      setIsModalOpen(true)
    }
  }

  // Map backend timetable to WeeklyTimetable format
  const formattedClasses = (timetableData || []).map((period: any) => ({
    id: period.id,
    course: period.subject?.name || 'Unknown',
    time: `${period.startTime} - ${period.endTime}`,
    room: period.room || 'TBD',
    color: 'primary', // Default color
    day: period.day,
    startTime: period.startTime,
    // Calculate duration in hours
    duration: calculateDuration(period.startTime, period.endTime)
  }))

  function calculateDuration(start: string, end: string) {
    const [startH, startM] = start.split(':').map(Number)
    const [endH, endM] = end.split(':').map(Number)
    const startTotal = startH * 60 + startM
    const endTotal = endH * 60 + endM
    return (endTotal - startTotal) / 60
  }

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
      <TimetableToolbar
        currentWeek={currentWeek}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onAddClass={handleAddClass}
        onPrint={handlePrint}
      />
      
      <WeeklyTimetable
        classes={formattedClasses}
        onClassClick={handleClassClick}
      />

      <AddScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        teacherId={teacherId}
        teacherSubjects={teacher.professionalInfo?.subjectObjects || []}
        initialData={selectedPeriod}
      />
    </div>
  )
}

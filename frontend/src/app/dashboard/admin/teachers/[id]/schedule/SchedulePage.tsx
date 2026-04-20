"use client"
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/app/(auth)/login/services/auth-store'
import TimetableToolbar from './TimetableToolbar'
import WeeklyTimetable from './WeeklyTimetable'
import AddScheduleModal from './AddScheduleModal'

export default function SchedulePage() {
  const { id: teacherId } = useParams()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const schoolId = user?.schools?.[0]?.schoolId || user?.defaultTenantId || ''
  
  const [currentWeek, setCurrentWeek] = useState('Current Semester Schedule')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch real timetable data
  const { data: timetableResponse, isLoading } = useQuery({
    queryKey: ['teacher-timetable', teacherId],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/teachers/${teacherId}/timetable`)
      return response.data
    },
    enabled: !!teacherId
  })

  const rawPeriods = timetableResponse?.data || []

  // Map backend TimetablePeriod to frontend ClassSchedule format
  const mappedClasses = rawPeriods.map((p: any) => {
    // Parse times (Expected format: HH:mm)
    const [startH, startM] = p.startTime.split(':').map(Number)
    const [endH, endM] = p.endTime.split(':').map(Number)
    
    // Calculate duration in hours
    const startDecimal = startH + startM / 60
    const endDecimal = endH + endM / 60
    const duration = endDecimal - startDecimal

    // Format time for display (e.g., '09:00 AM')
    const formatTime = (h: number, m: number) => {
      const period = h >= 12 ? 'PM' : 'AM'
      const displayH = h % 12 || 12
      return `${displayH}:${m.toString().padStart(2, '0')} ${period}`
    }

    // Determine color based on subject (simple heuristic)
    const getSubjectColor = (name: string) => {
      const n = name.toLowerCase()
      if (n.includes('math')) return 'math'
      if (n.includes('hist')) return 'history'
      if (n.includes('chem') || n.includes('sci')) return 'chemistry'
      if (n.includes('eng')) return 'english'
      return 'math' // default
    }

    return {
      id: p.id,
      course: `${p.subject.name} - ${p.class.name}`,
      time: `${formatTime(startH, startM)} - ${formatTime(endH, endM)}`,
      room: p.room || 'TBD',
      color: getSubjectColor(p.subject.name),
      day: p.day,
      startTime: formatTime(startH, startM),
      duration: duration > 0 ? duration : 1, // fallback to 1 hour
      hasConflict: false
    }
  })

  const handlePreviousWeek = () => {
    console.log('Previous week')
  }

  const handleNextWeek = () => {
    console.log('Next week')
  }

  const handleAddClass = () => {
    setIsModalOpen(true)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleClassClick = (classId: string) => {
    console.log('Class clicked:', classId)
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-6 lg:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
      <TimetableToolbar
        currentWeek={currentWeek}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onAddClass={handleAddClass}
        onPrint={handlePrint}
      />
      
      <WeeklyTimetable
        classes={mappedClasses}
        onClassClick={handleClassClick}
      />

      <AddScheduleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        teacherId={teacherId as string}
        schoolId={schoolId}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['teacher-timetable', teacherId] })}
      />
    </div>
  )
}
"use client"
import { useState } from 'react'
import TimetableToolbar from './TimetableToolbar'
import WeeklyTimetable from './WeeklyTimetable'


const mockTeacherData = {
  id: '1',
  name: 'Ms. Eleanor Vance',
  title: 'Senior Maths Teacher',
  teacherId: 'T-82156',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmpuwUGDmWSnAYeiA59QIA5gfVXUhS6H7pZO1WzZlqF3adpaWXJWW1LhbSfCvkLKbDk96GKyea0u9cA42tCe3p4IMPYKudGRDle-HwMoAxJhqvA47-xEunmEA4ZpF1PFdvRbgam9WJDxxORkuvsjUdjZTmhFONOGXepi9sLF9QL5Bi9nKeIeuMyduwU7uSxNLU8YH7HIm_fzDDU7O2wIE_-QHRr1q84JU28DpncIjSRBPhP6AxKFxA4GcedQumfEdEiw6CafTxKK0',
  status: 'active' as const,
  personalInfo: {
    fullName: 'Dr. Eleanor Vance',
    gender: 'Female',
    email: 'e.vance@university.edu',
    phone: '+1 (234) 567-8901',
    address: '123 University Drive, Scholarstown, ST 12345',
    highestQualification: 'Ph.D. in Mathematics',
    yearsOfExperience: '12 Years'
  },
  professionalInfo: {
    department: 'Mathematics',
    subjects: ['Algebra', 'Calculus', 'Geometry'],
    assignedClasses: ['Grade 10 - Section A', 'Grade 11 - Section B', 'Grade 12 - Section A']
  },
  statistics: {
    classPerformance: '87%',
    attendanceRate: '98%',
    upcomingClasses: '4',
    studentsTaught: '85'
  }
}

const timetableClasses = [
  {
    id: '1',
    course: 'MATH 101',
    time: '11:00 - 12:30',
    room: 'Room 4A',
    color: 'math',
    day: 'Monday',
    startTime: '11:00 AM',
    duration: 1.5
  },
  {
    id: '2',
    course: 'HIST 202',
    time: '01:00 - 02:00',
    room: 'Room 2C',
    color: 'history',
    day: 'Monday',
    startTime: '01:00 PM',
    duration: 1
  },
  {
    id: '3',
    course: 'CHEM 101',
    time: '09:30 - 11:00',
    room: 'Lab 1',
    color: 'chemistry',
    day: 'Tuesday',
    startTime: '09:30 AM',
    duration: 1.5
  },
  {
    id: '4',
    course: 'HIST 202',
    time: '10:00 - 11:00',
    room: 'Room 2C',
    color: 'history',
    day: 'Wednesday',
    startTime: '10:00 AM',
    duration: 1
  },
  {
    id: '5',
    course: 'ENG 301',
    time: '11:00 - 12:30',
    room: 'Room 5B',
    color: 'english',
    day: 'Wednesday',
    startTime: '11:00 AM',
    duration: 1.5,
    hasConflict: true
  },
  {
    id: '6',
    course: 'MATH 101',
    time: '11:00 - 12:30',
    room: 'Room 4A',
    color: 'math',
    day: 'Wednesday',
    startTime: '11:00 AM',
    duration: 1.5
  },
  {
    id: '7',
    course: 'CHEM 101',
    time: '08:45 - 10:15',
    room: 'Lab 1',
    color: 'chemistry',
    day: 'Thursday',
    startTime: '08:45 AM',
    duration: 1.5
  }
]

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'timetable', label: 'Timetable' },
  { id: 'courses', label: 'Courses' },
  { id: 'leave', label: 'Leave Requests' }
]

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState('timetable')
  const [currentWeek, setCurrentWeek] = useState('Oct 21 - Oct 25, 2024')

  const breadcrumbItems = [
    { label: 'Teachers', href: '/dashboard/admin/teachers' },
    { label: mockTeacherData.name, href: '#' },
    { label: 'Timetable', active: true }
  ]

  const handlePreviousWeek = () => {
    // Implement week navigation logic
    console.log('Previous week')
  }

  const handleNextWeek = () => {
    // Implement week navigation logic
    console.log('Next week')
  }

  const handleAddClass = () => {
    // Implement add class logic
    console.log('Add class')
  }

  const handlePrint = () => {
    // Implement print logic
    window.print()
  }

  const handleClassClick = (classId: string) => {
    // Implement class click logic
    console.log('Class clicked:', classId)
  }

  return (
  
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        

          
            <>
              <TimetableToolbar
                currentWeek={currentWeek}
                onPreviousWeek={handlePreviousWeek}
                onNextWeek={handleNextWeek}
                onAddClass={handleAddClass}
                onPrint={handlePrint}
              />
              
              <WeeklyTimetable
                classes={timetableClasses}
                onClassClick={handleClassClick}
              />
            </>
       

          

         
        </div>
    
   
  )
}
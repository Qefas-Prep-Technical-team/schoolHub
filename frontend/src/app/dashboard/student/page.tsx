'use client'

import { AIAssistantCard } from "./components/dashboard/AIAssistantCard"
import { AnnouncementsList } from "./components/dashboard/AnnouncementsList"
import { AssignmentsList } from "./components/dashboard/AssignmentsList"
import { ExamResults } from "./components/dashboard/ExamResults"
import { DashboardHeader } from "./components/dashboard/Header"
import { StatCard } from "./components/dashboard/StatCard"
import { TodayClasses } from "./components/dashboard/TodayClasses"
import { Announcement, Assignment, ExamResult, StatCardT, Student, TodayClass } from "./components/dashboard/types"
import { WelcomeBanner } from "./components/dashboard/WelcomeBanner"


// Mock data
const mockStudent: Student = {
  id: '1',
  name: 'Alex',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJx6QXUn2fi3zMdfbBK5u-f46iS_H3gM1OpJNFF24lUXHogmHF_7lPoIKxElabKKAl9TRRw3d6dYDjY3kdTVQmqn8EQHSMOznJyXcIDI6k1Gr7PMbUEwwyuwR5ffH3f5SG1nCFHgjtb9UarH_nUZQFiUKK2MPdvtLuSpEvdqZU0cPr1RDdkBsYxH-LRZOEhWjw3qGX1r_RZZhfb0Kw5CSvuIkREK7GfqMYjAL5gvF6123DXfbXIgVdkfPc-cDFkym3hHFXEGL8FPk',
  email: 'alex@school.edu',
  gradeLevel: 'Grade 11',
  studentId: 'STU2024115'
}

const statCards: StatCardT[] = [
  {
    id: 'attendance',
    title: 'Attendance',
    value: '95%',
    icon: 'check_circle',
    color: 'text-green-500',
    chartData: [80, 100, 60, 100, 30]
  },
  {
    id: 'assignments',
    title: 'Upcoming Assignments',
    value: 3,
    icon: 'assignment',
    color: 'text-yellow-500',
    link: '/student/assignments',
    linkText: 'View All'
  },
  {
    id: 'results',
    title: 'Recent Result',
    value: '88%',
    icon: 'quiz',
    color: 'text-blue-500',
    secondaryValue: '-2.0% from last'
  },
  {
    id: 'messages',
    title: 'Unread Messages',
    value: 2,
    icon: 'mark_email_unread',
    color: 'text-red-500',
    link: '/student/messages',
    linkText: 'Go to Inbox'
  }
]

const todayClasses: TodayClass[] = [
  {
    id: '1',
    subject: 'Chemistry',
    teacher: 'Mr. Davison',
    room: 'Room 301',
    time: '09:00 - 10:00 AM',
    status: 'completed'
  },
  {
    id: '2',
    subject: 'History',
    teacher: 'Ms. Albright',
    room: 'Room 204',
    time: '10:00 - 11:00 AM',
    status: 'ongoing'
  },
  {
    id: '3',
    subject: 'Mathematics',
    teacher: 'Mrs. Turing',
    room: 'Room 402',
    time: '11:00 - 12:00 PM',
    status: 'next'
  },
  {
    id: '4',
    subject: 'Physics',
    teacher: 'Dr. Feynman',
    room: 'Lab 7',
    time: '01:00 - 02:00 PM',
    status: 'next'
  }
]

const upcomingAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Essay on the Renaissance Period',
    subject: 'History',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    status: 'in-progress',
    totalPoints: 100
  },
  {
    id: '2',
    title: 'Algebra Worksheet 5.2',
    subject: 'Mathematics',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    status: 'not-started',
    totalPoints: 50
  }
]

const examResults: ExamResult[] = [
  {
    id: '1',
    title: 'Mid-term Exam',
    subject: 'Chemistry',
    score: 88,
    total: 100,
    average: 82,
    date: new Date('2024-10-25'),
    trend: 'up'
  },
  {
    id: '2',
    title: 'Quiz 3: Forces',
    subject: 'Physics',
    score: 75,
    total: 100,
    average: 85,
    date: new Date('2024-10-22'),
    trend: 'down'
  }
]

const announcements: Announcement[] = [
  {
    id: '1',
    title: 'Parent-Teacher Meeting Schedule',
    author: 'Admin',
    date: new Date('2024-10-25'),
    priority: 'medium'
  },
  {
    id: '2',
    title: 'Annual Sports Day Registration',
    author: 'Sports Dept.',
    department: 'Sports Department',
    date: new Date('2024-10-24'),
    priority: 'high'
  },
  {
    id: '3',
    title: 'Library Closure for Maintenance',
    author: 'Admin',
    date: new Date('2024-10-22'),
    priority: 'medium'
  }
]

export default function StudentDashboardPage() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
            <DashboardHeader
              student={mockStudent}
              currentTerm="Fall 2024"
            />

            <WelcomeBanner studentName={mockStudent.name} />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 md:p-6 pt-0">
              {statCards.map((stat) => (
                <StatCard
                  key={stat.id}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                  secondaryValue={stat.secondaryValue}
                  link={stat.link}
                  linkText={stat.linkText}
                  chartData={stat.chartData}
                />
              ))}
            </div>

            {/* Today's Classes */}
            <TodayClasses classes={todayClasses} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6">
              {/* Left Column - 2/3 width */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <AssignmentsList
                  assignments={upcomingAssignments}
                  title="Upcoming Assignments"
                  viewAllLink="/student/assignments"
                />

                <ExamResults
                  results={examResults}
                  title="Latest Exam Results"
                  viewAllLink="/student/grades"
                />
              </div>

              {/* Right Column - 1/3 width */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <AIAssistantCard />

                <AnnouncementsList
                  announcements={announcements}
                  title="Announcements"
                  viewAllLink="/student/announcements"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
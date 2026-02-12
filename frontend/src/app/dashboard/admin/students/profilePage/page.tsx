// StudentProfilePage.jsx
import React from 'react'
import StudentHeroCard from './components/StudentHeroCard'
import StudentTabs from './components/StudentTabs'

// Example dynamic student data
const studentData = {
  name: 'Brooklyn Simmons',
  grade: 'Grade 11',
  id: 'STU-84512',
  status: 'Active',
  profilePicture: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUiOgisiC6ed25fUHnp5UFFxvkgJyJxUOncm27jCtLYuvguXfUqRF4pXifTXGLNwpalyGwL7RSGOEP3FAx7Ehfk81Na0jsIjzeuLi_O2lR5cYvprWrGLVMIgfJdOmK6mRDp9n_bycr5b96Te7Akyzu619xu9-9GYfHR1FbbCneC-UyS5PUzQKX5Wh_QHldL2ZGaOlmxBCMTEgH-Zi1UEh6y9yr6xnvPY5S92vtIe48LcbrtPwB3S4_lqCk6BDyz7yDPzss-631XEw',
  stats: {
    gpa: 3.85,
    attendance: 97,
    incidents: 2,
    balance: 250.0
  },
  behaviorNotes: [
    { type: 'warning' as const, title: 'Minor Disruption in Class', detail: 'Reported by Mr. Harrison on May 15, 2024. Action: Verbal warning.' },
    { type: 'positive' as const, title: 'Excellent Peer Leadership', detail: 'Observed by Ms. Davis on May 10, 2024 during a group project.' }
  ]
}

export default function StudentProfilePage() {
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background-light dark:bg-background-dark">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <a className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary" href="#">
          Dashboard
        </a>
        <span className="text-sm text-gray-500 dark:text-gray-400">/</span>
        <a className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary" href="#">
          Students
        </a>
        <span className="text-sm text-gray-500 dark:text-gray-400">/</span>
        <span className="text-sm font-medium text-text-light dark:text-text-dark">
          {studentData.name}
        </span>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <StudentHeroCard student={studentData} />
        <div className="flex-1 min-w-0"> {/* Added min-w-0 to prevent flex item overflow */}
          <StudentTabs student={studentData} />
        </div>
      </div>
    </main>
  )
}
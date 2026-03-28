// app/page.js
import { StudentProfile } from '@/lib/api/services/studentService'
import PersonalInformation from './PersonalInformation'
import ClassInformation from './ClassInformation'
import Statistics from './Statistics'
import ParentGuardian from './ParentGuardian'

export default function InfoPage({ student }: { student: StudentProfile }) {
  return (
    <main className="flex-1 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <PersonalInformation student={student} />
            <ClassInformation student={student} />
          </div>
          
          <div className="lg:col-span-1 flex flex-col gap-8">
            <Statistics student={student} />
            <ParentGuardian student={student} />
          </div>
        </div>
      </div>
    </main>
  )
}
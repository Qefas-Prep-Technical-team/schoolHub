// app/page.js


import { StudentProfile } from "@/lib/api/services/studentService";
import Toolbar from "./Toolbar";
import SummaryCards from './SummaryCards'
import SubjectsTable from './SubjectsTable'
import TeacherComments from './TeacherComments'
import PerformanceChart from "./PerformanceChart";


export default function AcademicPerformancePage({ student }: { student: StudentProfile }) {
  return (
    <main className="flex-1 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto">

        <Toolbar />

        <div className="grid grid-cols-12 gap-8 mt-6">
          <div className="col-span-12 lg:col-span-8">
            <PerformanceChart />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <SummaryCards />
          </div>
        </div>

        <div className="mt-8">
          <SubjectsTable />
        </div>

        <div className="mt-8">
          <TeacherComments />
        </div>
      </div>
    </main>
  )
}
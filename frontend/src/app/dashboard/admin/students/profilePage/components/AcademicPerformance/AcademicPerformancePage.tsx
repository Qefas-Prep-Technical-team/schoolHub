// app/page.js

import PerformanceChart from "@/app/dashboard/admin/components/dashboard/PerformanceChart";
import Toolbar from "./Toolbar";
import SummaryCards from './SummaryCards'
import SubjectsTable from './SubjectsTable'
import TeacherComments from './TeacherComments'


export default function AcademicPerformancePage() {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
       
        <Toolbar />
        
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <PerformanceChart />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <SummaryCards />
          </div>
        </div>
        
        <div className="mt-6">
          <SubjectsTable />
        </div>
        
        <div className="mt-6">
          <TeacherComments />
        </div>
      </div>
    </main>
  )
}
// app/page.js
import ProfileHeader from './ProfileHeader'
import PersonalInformation from './PersonalInformation'
import ClassInformation from './ClassInformation'
import Statistics from './Statistics'
import ParentGuardian from './ParentGuardian'

export default function InfoPage() {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* <ProfileHeader /> */}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <PersonalInformation />
            <ClassInformation />
          </div>
          
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Statistics />
            <ParentGuardian />
          </div>
        </div>
      </div>
    </main>
  )
}
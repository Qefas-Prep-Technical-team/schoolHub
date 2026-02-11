import Breadcrumbs from './components/Breadcrumbs'
import TimerHeader from './components/TimerHeader'
import StudentContext from './components/StudentContext'
import FileUpload from './components/FileUpload'
import FilePreviewList from './components/FilePreviewList'
import NotesArea from './components/NotesArea'
import SubmissionChecklist from './components/SubmissionChecklist'
import InstructionsSummary from './components/InstructionsSummary'
import ActionFooter from './components/ActionFooter'

interface SubmissionPageProps {
  params: {
    id: string
  }
}

export default function SubmissionPage({ params }: SubmissionPageProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark font-display antialiased transition-colors duration-200">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 px-4 sm:px-6 lg:px-8">
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
            <Breadcrumbs assignmentId={params.id} />
            <TimerHeader />
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 pb-24">
              {/* Left Column: Upload & Form */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <StudentContext />
                <FileUpload />
                <FilePreviewList />
                <NotesArea />
              </div>
              
              {/* Right Column: Sidebar */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <SubmissionChecklist />
                <InstructionsSummary />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ActionFooter />
    </div>
  )
}
import Breadcrumbs from '../components/Breadcrumbs'
import PageHeader from '../components/PageHeader'
import StatsGrid from '../components/StatsGrid'
import AssignmentDetails from '../components/AssignmentDetails'
import StudentWork from '../components/StudentWork'
import TeacherFeedback from '../components/TeacherFeedback'
import ActionsCard from '../components/ActionsCard'
import UpcomingAssignments from '../components/UpcomingAssignments'
import ParentTip from '../components/ParentTip'

interface AssignmentDetailPageProps {
    params: {
        id: string
    }
}

export default function AssignmentDetailPage({ params }: AssignmentDetailPageProps) {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex overflow-hidden">
            <main className="flex-1 overflow-y-auto overflow-x-hidden h-full">
                <div className="max-w-6xl mx-auto px-6 py-8 md:px-12 md:py-10 flex flex-col gap-8">
                    <Breadcrumbs assignmentId={params.id} />
                    <PageHeader />
                    <StatsGrid />

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Content (Main) */}
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            <AssignmentDetails />
                            <StudentWork />
                            <TeacherFeedback />
                        </div>

                        {/* Right Sidebar (Tools) */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            <ActionsCard />
                            <UpcomingAssignments />
                            <ParentTip />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
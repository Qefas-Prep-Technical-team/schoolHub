"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
    Calendar as CalendarIcon, 
    ChevronLeft as ChevronLeftIcon, 
    Download as DownloadIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import KPICards from "./components/KPICards"
import DateFilters from "./components/DateFilters"
import AttendanceChart from "./components/AttendanceChart"
import LowAttendanceList from "./components/LowAttendanceList"
import AbsentStaffList from "./components/AbsentStaffList"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { useSchoolStats, useSchoolDashboardSummary } from "@/lib/api/hooks/useSchool"
import { Skeleton } from "@/components/ui/skeleton"

export default function AttendancePage() {
    const router = useRouter()
    const [showHistory, setShowHistory] = useState(false)

    const { user } = useAuthStore()
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || ""

    const { data: stats, isLoading: statsLoading } = useSchoolStats(schoolId)
    const { data: summary, isLoading: summaryLoading } = useSchoolDashboardSummary(schoolId)

    const isLoading = statsLoading || summaryLoading

    return (
        <div className="space-y-8 pb-20 max-w-[1600px] mx-auto">
            {/* Header / Hero */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                    <Button 
                        variant="ghost" 
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white -ml-4"
                        onClick={() => router.push("/dashboard/admin")}
                    >
                        <ChevronLeftIcon size={20} className="mr-2" /> Back to Ecosystem
                    </Button>
                    <div className="space-y-1">
                        <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                            Attendance Hub
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                            Real-time school-wide presence analytics & trend monitoring
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button 
                        variant="outline" 
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 h-14 px-6 rounded-2xl font-bold shadow-sm"
                        onClick={() => setShowHistory(!showHistory)}
                    >
                        <CalendarIcon size={18} className="mr-2" /> 
                        {showHistory ? "Hide History" : "View Analytics History"}
                    </Button>
                    <Button 
                        className="bg-primary hover:bg-primary text-white h-14 px-8 rounded-2xl font-bold shadow-xl shadow-primary/20 gap-2"
                    >
                        <DownloadIcon size={18} />
                        Generate Executive Report
                    </Button>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-4 shadow-sm">
                <DateFilters />
            </div>

            {/* KPI Section */}
            <KPICards stats={stats} isLoading={statsLoading} />

            {/* Main Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Charts */}
                <div className="lg:col-span-2 space-y-8">
                    <AttendanceChart stats={stats} isLoading={statsLoading} />
                </div>

                {/* Right Column: Attention Lists */}
                <div className="space-y-8">
                    <LowAttendanceList summary={summary} isLoading={summaryLoading} />
                    <AbsentStaffList summary={summary} isLoading={summaryLoading} />
                </div>
            </div>
        </div>
    )
}


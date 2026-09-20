"use client"

import { useState } from "react"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { useSchoolSettings } from "@/lib/api/hooks/useSchool"
import { usePendingAdmins } from "@/lib/api/hooks/useAdmin"
import { Shield, Users, Clock, Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ActiveMembersTable from "./components/ActiveMembersTable"
import PendingRequestsTable from "./components/PendingRequestsTable"

export default function TeamPage() {
    const { user } = useAuthStore()
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || ""

    const { data: settings } = useSchoolSettings(schoolId)
    const { data: pendingData } = usePendingAdmins(schoolId)
    const primaryColor = settings?.themeColor || "#2563eb"

    const pendingCount: number = pendingData?.data?.length || 0

    const [searchTerm, setSearchTerm] = useState("")
    const [activeTab, setActiveTab] = useState("members")

    return (
        <div className="min-h-screen bg-transparent p-4 md:p-6 lg:p-8">
            <div className="max-w-[1600px] mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
                        <Shield size={14} /> Team Management
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Admin Team
                            </h1>
                            <p className="text-sm text-slate-500 font-medium mt-1">
                                Manage who has access to your school dashboard, their roles, and approve or reject new join requests.
                            </p>
                        </div>

                        <div className="relative group min-w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search team members..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-11 pl-11 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                </header>

                {/* Tabs & Tables */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                    <TabsList className="bg-slate-100 dark:bg-slate-800/50 p-1 rounded-full h-auto inline-flex w-fit">
                        <TabsTrigger
                            value="members"
                            className="rounded-full px-6 py-2 text-sm font-medium text-slate-500 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                        >
                            <div className="flex flex-row items-center justify-center gap-2">
                                <Users size={16} /> Active Members
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="pending"
                            className="rounded-full px-6 py-2 text-sm font-medium text-slate-500 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                        >
                            <div className="flex flex-row items-center justify-center gap-2">
                                <Clock size={16} />
                                Pending Requests
                                {pendingCount > 0 && (
                                    <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-white">
                                        {pendingCount}
                                    </span>
                                )}
                            </div>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="members" className="mt-0 outline-none">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                            <ActiveMembersTable schoolId={schoolId} searchTerm={searchTerm} />
                        </div>
                    </TabsContent>

                    <TabsContent value="pending" className="mt-0 outline-none">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                            <PendingRequestsTable schoolId={schoolId} searchTerm={searchTerm} />
                        </div>
                    </TabsContent>
                </Tabs>

            </div>
        </div>
    )
}

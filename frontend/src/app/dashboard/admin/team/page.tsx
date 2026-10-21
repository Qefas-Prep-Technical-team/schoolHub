"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { useSchoolSettings } from "@/lib/api/hooks/useSchool"
import { useSchoolAdmins, usePendingAdmins } from "@/lib/api/hooks/useAdmin"
import { Shield, Users, Clock, Search, Info, Crown, X, UserCheck } from "lucide-react"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ActiveMembersTable from "./components/ActiveMembersTable"
import PendingRequestsTable from "./components/PendingRequestsTable"
import { cn } from "@/lib/utils"

function TeamPageContent() {
    const { user } = useAuthStore()
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || ""
    const searchParams = useSearchParams()

    const { data: settings } = useSchoolSettings(schoolId)
    const { data: adminsData, isLoading: isLoadingAdmins } = useSchoolAdmins(schoolId)
    const { data: pendingData, isLoading: isLoadingPending } = usePendingAdmins(schoolId)
    const primaryColor = settings?.themeColor || "#2563eb"

    const activeCount: number = adminsData?.data?.length || 0
    const pendingCount: number = pendingData?.data?.length || 0
    const owner = adminsData?.data?.find(
        (m: any) => m.role === "SCHOOL_OWNER" || m.adminRole === "SCHOOL_OWNER"
    )

    const [searchTerm, setSearchTerm] = useState("")
    const [activeTab, setActiveTab] = useState("members")

    // Sync tab with ?tab= query parameter on mount or change
    useEffect(() => {
        const tabParam = searchParams.get("tab")
        if (tabParam === "pending" || tabParam === "members") {
            setActiveTab(tabParam)
        }
    }, [searchParams])

    const myRoleLabel = user?.adminRole || user?.role || "Staff"

    return (
        <div className="min-h-screen bg-transparent p-3.5 sm:p-6 lg:p-8 font-sans pb-24">
            <div className="w-full max-w-[1600px] mx-auto space-y-6">

                {/* Header */}
                <header className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
                        <Shield size={14} /> Team & Governance
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    Admin Team
                                </h1>
                                <TooltipProvider>
                                    <Tooltip delayDuration={300}>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                className="text-slate-400 hover:text-primary transition-colors focus:outline-none mt-1"
                                                aria-label="Information about team management"
                                            >
                                                <Info size={19} />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="max-w-xs p-3 text-xs leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                                            Central hub for managing institutional access rights. Regulate active system operators, assign administrative roles, and carefully review pending staff authorization requests.
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-2xl">
                                Regulate who has access to your school dashboard, manage role permissions, and approve or decline incoming staff requests.
                            </p>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name, email, or role..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-10 sm:h-11 pl-10 pr-9 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 shadow-2xs"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    title="Clear search"
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                {/* Team Overview Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {/* Stat 1: Active Admins */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
                                <Users size={18} strokeWidth={2.5} />
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                                Active
                            </span>
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Active Members
                            </span>
                            <div className="flex items-baseline justify-between mt-0.5">
                                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {isLoadingAdmins ? "—" : activeCount}
                                </h3>
                                <span className="text-xs text-slate-400 font-medium">Operators</span>
                            </div>
                        </div>
                    </div>

                    {/* Stat 2: Pending Join Requests */}
                    <div className={cn(
                        "bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-all",
                        pendingCount > 0 
                            ? "border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-white to-amber-50/30 dark:from-slate-900 dark:to-amber-950/10" 
                            : "border-slate-200/80 dark:border-slate-800"
                    )}>
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <div className={cn(
                                "size-10 rounded-xl flex items-center justify-center border",
                                pendingCount > 0 
                                    ? "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" 
                                    : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                            )}>
                                <Clock size={18} strokeWidth={2.5} />
                            </div>
                            {pendingCount > 0 ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white animate-pulse">
                                    Action Required
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
                                    Clear
                                </span>
                            )}
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Pending Requests
                            </span>
                            <div className="flex items-baseline justify-between mt-0.5">
                                <h3 className={cn(
                                    "text-2xl sm:text-3xl font-black tracking-tight",
                                    pendingCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white"
                                )}>
                                    {isLoadingPending ? "—" : pendingCount}
                                </h3>
                                <span className="text-xs text-slate-400 font-medium">Awaiting</span>
                            </div>
                        </div>
                    </div>

                    {/* Stat 3: School Owner */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900/40">
                                <Crown size={18} strokeWidth={2.5} />
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
                                Primary
                            </span>
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                School Owner
                            </span>
                            <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate mt-0.5">
                                {owner?.name || "Institution Owner"}
                            </h4>
                            <p className="text-[11px] text-slate-400 truncate font-mono">
                                {owner?.email || "owner@school"}
                            </p>
                        </div>
                    </div>

                    {/* Stat 4: Your Role */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="size-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-100 dark:border-violet-900/40">
                                <UserCheck size={18} strokeWidth={2.5} />
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-900/40">
                                Current User
                            </span>
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Your Access Level
                            </span>
                            <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate mt-0.5">
                                {myRoleLabel.replace(/_/g, " ")}
                            </h4>
                            <p className="text-[11px] text-slate-400 truncate font-medium">
                                {user?.name || "Logged in"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs & Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-1 sm:p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs inline-flex w-full sm:w-auto">
                        <TabsList className="bg-transparent p-0 h-auto flex w-full sm:w-auto gap-1">
                            <TabsTrigger
                                value="members"
                                className="flex-1 sm:flex-initial rounded-xl px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-slate-500 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                                <Users size={15} />
                                <span>Active Members</span>
                                <span className={cn(
                                    "px-1.5 py-0.2 rounded-md text-[10px] font-black tabular-nums",
                                    activeTab === "members" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                )}>
                                    {activeCount}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="pending"
                                className="flex-1 sm:flex-initial rounded-xl px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-slate-500 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                                <Clock size={15} />
                                <span>Pending Requests</span>
                                {pendingCount > 0 && (
                                    <span className="px-1.5 py-0.5 text-[10px] font-black rounded-md bg-amber-500 text-white tabular-nums animate-pulse">
                                        {pendingCount}
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="members" className="mt-0 outline-none">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                            <ActiveMembersTable schoolId={schoolId} searchTerm={searchTerm} />
                        </div>
                    </TabsContent>

                    <TabsContent value="pending" className="mt-0 outline-none">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                            <PendingRequestsTable schoolId={schoolId} searchTerm={searchTerm} />
                        </div>
                    </TabsContent>
                </Tabs>

            </div>
        </div>
    )
}

export default function TeamPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen p-6 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        }>
            <TeamPageContent />
        </Suspense>
    )
}

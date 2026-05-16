"use client"

import { useParams, useRouter } from "next/navigation"
import { 
    usePlatformSchoolDetails, 
    useUpdateSchoolPlan, 
    useAllPlatformPlans,
    useUpdateSchoolStatus,
    useImpersonateAdmin,
    PlatformSchoolDetails
} from "@/lib/api/hooks/usePlatformSchools"
import { useResetSchoolSubscription } from "@/lib/api/hooks/usePlatformBilling"
import { 
    Building2 as BuildingIcon, 
    Calendar as CalendarIcon, 
    ChevronLeft as ChevronLeftIcon, 
    Mail as MailIcon, 
    Phone as PhoneIcon, 
    MapPin as MapPinIcon, 
    CreditCard as CreditCardIcon, 
    Zap as ZapIcon, 
    ShieldCheck as ShieldCheckIcon, 
    ExternalLink as ExternalLinkIcon,
    Users as UsersIcon,
    BookOpen as BookOpenIcon,
    FileText as FileTextIcon,
    Save as SaveIcon,
    Clock as ClockIcon,
    Lock as LockIcon,
    Unlock as UnlockIcon,
    Cloud as CloudIcon,
    RefreshCcw as ResetIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { format } from "date-fns"

export default function SchoolDetailsPage() {
    const { id } = useParams()
    const router = useRouter()
    const { data: school, isLoading, error, refetch } = usePlatformSchoolDetails(id as string)
    const { data: plans } = useAllPlatformPlans()
    const updatePlan = useUpdateSchoolPlan()
    const toggleStatus = useUpdateSchoolStatus()
    const impersonate = useImpersonateAdmin()
    const resetSubscription = useResetSchoolSubscription()

    const [activeTab, setActiveTab] = useState("usage")
    const [selectedPlanId, setSelectedPlanId] = useState("")
    const [status, setStatus] = useState("")
    const [endDate, setEndDate] = useState("")
    const [isTrial, setIsTrial] = useState(false)

    useEffect(() => {
        if (school) {
            setSelectedPlanId(school.subscriptionPlanId || "")
            setStatus(school.subscriptionStatus || "INACTIVE")
            setEndDate(school.subscriptionEnd ? new Date(school.subscriptionEnd).toISOString().split('T')[0] : "")
            setIsTrial(school.isTrialActive || false)
        }
    }, [school])

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse p-8">
                <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem]"></div>
                        <div className="h-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem]"></div>
                    </div>
                    <div className="space-y-8">
                        <div className="h-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem]"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !school) return (
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-6 text-center px-4">
            <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                <BuildingIcon size={40} className="opacity-20" />
            </div>
            <div className="space-y-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">School not found</h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm max-w-md">
                    {error ? "We encountered an issue while retrieving this school's records. Please check the ID or try again." : "The school record you're looking for doesn't exist or has been removed from the platform."}
                </p>
            </div>
            <div className="flex items-center gap-4 pt-4">
                <Button variant="outline" className="rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => router.push("/console/schools")}>
                    Back to Schools
                </Button>
                <Button className="rounded-2xl font-black uppercase tracking-widest text-[10px] bg-indigo-600 hover:bg-indigo-700" onClick={() => refetch()}>
                    Retry Connection
                </Button>
            </div>
        </div>
    )

    const stats = [
        { label: "Students", value: school._count?.students || 0, icon: UsersIcon, color: "text-blue-400" },
        { label: "Teachers", value: school._count?.teachers || 0, icon: BookOpenIcon, color: "text-emerald-400" },
        { label: "Admins", value: school._count?.admins || 0, icon: ShieldCheckIcon, color: "text-indigo-400" },
        { label: "Exams", value: school._count?.exams || 0, icon: FileTextIcon, color: "text-orange-400" },
    ]

    const handleSavePlan = () => {
        const planData: any = {
            subscriptionPlanId: selectedPlanId,
            subscriptionStatus: status,
            subscriptionEnd: endDate ? new Date(endDate).toISOString() : null,
            isTrialActive: isTrial
        }
        
        // Find the plan type string to match the 'plan' field
        const flatPlans = plans?.flatMap((c) => c.tabs) || []
        const currentPlanObj = flatPlans.find((p) => p.id === selectedPlanId)
        if (currentPlanObj) {
            planData.plan = currentPlanObj.type.toUpperCase()
        }

        updatePlan.mutate({ id: id as string, planData })
    }

    const handleResetSubscription = () => {
        if (window.confirm(`Are you sure you want to RESET the subscription for ${school.name}? This will revert them to the FREE plan and clear all overrides and trial settings.`)) {
            resetSubscription.mutate({ schoolId: id as string })
        }
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button 
                    variant="ghost" 
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white -ml-4"
                    onClick={() => router.push("/console/schools")}
                >
                    <ChevronLeftIcon size={20} className="mr-2" /> Back to Ecosystem
                </Button>
                <div className="flex gap-3 text-white">
                    <Button 
                        variant="outline" 
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={() => impersonate.mutate(school.id)}
                    >
                        <ExternalLinkIcon size={16} className="mr-2" /> Impersonate Admin
                    </Button>
                    <Button 
                        className={cn(
                            "shadow-xl",
                            school.subscriptionStatus === "ACTIVE" 
                                ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20" 
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-400/20"
                        )}
                        onClick={() => toggleStatus.mutate({ 
                            id: school.id, 
                            status: school.subscriptionStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE" 
                        })}
                    >
                        {school.subscriptionStatus === "ACTIVE" ? <LockIcon size={16} className="mr-2" /> : <UnlockIcon size={16} className="mr-2" />}
                        {school.subscriptionStatus === "ACTIVE" ? "Suspend Access" : "Restore Access"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Info & Stats */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Identity Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-sm">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <BuildingIcon size={120} className="text-slate-500" />
                        </div>
                        
                        <div className="flex items-start gap-6 relative z-10">
                            <div className="h-24 w-24 rounded-3xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden shrink-0">
                                {school.logo ? (
                                    <Image 
                                        src={school.logo} 
                                        alt={school.name} 
                                        fill
                                        className="object-contain p-4" 
                                    />
                                ) : (
                                    <BuildingIcon size={40} className="text-slate-300 dark:text-slate-700" />
                                )}
                            </div>
                            <div className="space-y-1 min-w-0">
                                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter truncate">{school.name}</h1>
                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                    <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider">
                                        {school.schoolCode}
                                    </Badge>
                                    <code className="text-sm text-slate-500 font-mono bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5">
                                        ID: {school.tenantId}
                                    </code>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                <MailIcon size={18} className="text-indigo-500 shrink-0" />
                                <span className="text-sm font-medium truncate">{school.schoolEmail || "No official email"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                <PhoneIcon size={18} className="text-emerald-500 shrink-0" />
                                <span className="text-sm font-medium">{school.phone || "No phone listed"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                <MapPinIcon size={18} className="text-orange-500 shrink-0" />
                                <span className="text-sm font-medium truncate">{school.address || "No address data"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors shadow-sm">
                                <stat.icon size={20} className={cn("mb-3", stat.color)} />
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Detailed Info Tabs */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
                         <div className="flex items-center gap-6 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 sticky top-0 bg-white dark:bg-slate-900 z-10 overflow-x-auto no-scrollbar">
                            <button 
                                onClick={() => setActiveTab("usage")}
                                className={cn(
                                    "text-sm uppercase tracking-widest font-black pb-4 transition-all whitespace-nowrap border-b-2",
                                    activeTab === "usage" ? "text-indigo-600 border-indigo-500" : "text-slate-400 border-transparent hover:text-slate-600"
                                )}
                            >Usage Analytics</button>
                            <button 
                                onClick={() => setActiveTab("subscription")}
                                className={cn(
                                    "text-sm uppercase tracking-widest font-black pb-4 transition-all whitespace-nowrap border-b-2",
                                    activeTab === "subscription" ? "text-indigo-600 border-indigo-500" : "text-slate-400 border-transparent hover:text-slate-600"
                                )}
                            >Subscription Details</button>
                            <button 
                                onClick={() => setActiveTab("staff")}
                                className={cn(
                                    "text-sm uppercase tracking-widest font-black pb-4 transition-all whitespace-nowrap border-b-2",
                                    activeTab === "staff" ? "text-indigo-600 border-indigo-500" : "text-slate-400 border-transparent hover:text-slate-600"
                                )}
                            >Staff Directory</button>
                            <button 
                                onClick={() => setActiveTab("emails")}
                                className={cn(
                                    "text-sm uppercase tracking-widest font-black pb-4 transition-all whitespace-nowrap border-b-2",
                                    activeTab === "emails" ? "text-indigo-600 border-indigo-500" : "text-slate-400 border-transparent hover:text-slate-600"
                                )}
                            >Communication History</button>
                         </div>
                         
                         {activeTab === "usage" && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { 
                                        label: "Students", 
                                        current: school.usage?.usage?.students ?? school._count?.students ?? 0, 
                                        total: school.usage?.limits?.students ?? (school.maxStudentsOverride || school.subscriptionPlan?.maxStudents || 100), 
                                        icon: UsersIcon,
                                        color: "indigo"
                                    },
                                    { 
                                        label: "Teachers", 
                                        current: school.usage?.usage?.teachers ?? school._count?.teachers ?? 0, 
                                        total: school.usage?.limits?.teachers ?? (school.maxTeachersOverride || school.subscriptionPlan?.maxTeachers || 50), 
                                        icon: BookOpenIcon,
                                        color: "emerald"
                                    },
                                    { 
                                        label: "Exams", 
                                        current: school.usage?.usage?.exams ?? school._count?.exams ?? 0, 
                                        total: school.usage?.limits?.exams ?? (school.maxExamsOverride || school.subscriptionPlan?.maxExams || 50), 
                                        icon: FileTextIcon,
                                        color: "orange"
                                    },
                                    { 
                                        label: "Cloud Storage (GB)", 
                                        current: school.usage?.usage?.storageGb ?? 0, 
                                        total: school.usage?.limits?.storageGb ?? (school.maxStorageGbOverride || school.subscriptionPlan?.maxStorageGb || 2), 
                                        icon: CloudIcon,
                                        color: "blue"
                                    }
                                ].map((item, idx) => {
                                    const percent = item.total > 0 ? Math.min(Math.round((item.current / item.total) * 100), 100) : 0;
                                    
                                    // Map item colors to specific classes for direct use (avoiding dynamic template literals that tailwind might miss)
                                    const styles: any = {
                                        indigo: { bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400", bar: "bg-indigo-500" },
                                        emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500" },
                                        orange: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", bar: "bg-orange-500" },
                                        blue: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", bar: "bg-blue-500" }
                                    }
                                    const style = styles[item.color] || styles.indigo;

                                    return (
                                        <div key={idx} className="p-5 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", style.bg)}>
                                                        <item.icon size={20} className={style.text} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-900 dark:text-slate-200 font-bold">{item.label}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Utilization</p>
                                                    </div>
                                                </div>
                                                <span className="text-lg text-slate-900 dark:text-white font-black">{item.current} / {item.total}</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div 
                                                    className={cn("h-full transition-all duration-1000", style.bar)}
                                                    style={{ width: `${percent}%` }}
                                                ></div>
                                            </div>
                                            <p className={cn("text-[10px] font-bold uppercase mt-2", percent > 90 ? "text-red-500" : "text-slate-500")}>
                                                {percent}% CAPACITY REACHED
                                            </p>
                                        </div>
                                    )
                                })}
                              </div>
                          )}

                          {activeTab === "emails" && (
                              <div className="space-y-4">
                                 {(school.emailLogs?.length ?? 0) > 0 ? (
                                     school.emailLogs!.map((log, idx: number) => (
                                         <div key={idx} className="p-5 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 group hover:border-indigo-500/30 transition-all overflow-hidden relative">
                                             <div className="flex items-start justify-between gap-4 relative z-10">
                                                <div className="flex gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                                                        <MailIcon size={20} className="text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-900 dark:text-slate-100 font-bold truncate max-w-md">{log.subject}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                                            {new Date(log.createdAt).toLocaleString()} • RECIPIENT: {log.recipientEmail}
                                                        </p>
                                                        <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic" dangerouslySetInnerHTML={{ __html: log.body }}></div>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase px-2 py-1 rounded-lg",
                                                        log.status === "SENT" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                                                    )}>
                                                        {log.status}
                                                    </span>
                                                    <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase tracking-tighter">{log.type}</p>
                                                </div>
                                             </div>
                                         </div>
                                     ))
                                 ) : (
                                     <div className="py-20 text-center">
                                         <MailIcon size={40} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                                         <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No communications recorded</p>
                                     </div>
                                 )}
                              </div>
                          )}

                         {activeTab === "subscription" && (
                              <div className="space-y-8">
                                 {/* Plan Identity Section */}
                                 <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] relative overflow-hidden">
                                     <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                         <ShieldCheckIcon size={80} className="text-indigo-600" />
                                     </div>
                                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                         <div className="flex items-center gap-5">
                                             <div className="h-16 w-16 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                                                 <ZapIcon className="text-yellow-500" size={32} />
                                             </div>
                                             <div>
                                                 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">
                                                     {school.usage?.planName || school.subscriptionPlan?.name || school.plan || "Free Tier"}
                                                 </h3>
                                                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                     STATUS: 
                                                     <span className={cn(
                                                         "px-2 py-0.5 rounded text-[10px]",
                                                         school.subscriptionStatus === "ACTIVE" 
                                                             ? "bg-emerald-500/10 text-emerald-600" 
                                                             : "bg-red-500/10 text-red-600"
                                                     )}>
                                                         {school.subscriptionStatus}
                                                     </span>
                                                     {school.isTrialActive && (
                                                         <span className="text-indigo-500 font-black flex items-center gap-2">
                                                             ● TRIAL MODE 
                                                             {school.trialEndsAt && (
                                                                 <Badge className="bg-indigo-500/10 text-indigo-600 border-none text-[9px] h-4">
                                                                     {Math.max(0, Math.ceil((new Date(school.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} DAYS LEFT
                                                                 </Badge>
                                                             )}
                                                         </span>
                                                     )}
                                                 </p>
                                             </div>
                                         </div>
                                         <div className="text-right">
                                             <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Billing Interval</p>
                                             <p className="text-xl font-black text-slate-900 dark:text-white capitalize">{school.billingCycle || "Monthly"}</p>
                                         </div>
                                     </div>
                                 </div>

                                 {/* Resource Limits Section */}
                                 <div className="space-y-4">
                                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Resource Quotas & Entitlements</h4>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         {/* Students */}
                                         <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-white/5 group hover:bg-white dark:hover:bg-slate-900 transition-all">
                                             <div className="flex items-start justify-between">
                                                 <div className="flex items-center gap-4">
                                                     <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                                         <UsersIcon size={20} />
                                                     </div>
                                                     <div>
                                                         <p className="text-sm font-bold text-slate-900 dark:text-slate-200">Student Capacity</p>
                                                         <p className="text-[10px] text-slate-500 font-medium">Max active enrollments</p>
                                                     </div>
                                                 </div>
                                                 <div className="text-right">
                                                     <p className="text-lg font-black text-slate-900 dark:text-white">
                                                         {school.usage?.limits?.students || "Unlimited"}
                                                     </p>
                                                     {(school.maxStudentsOverride !== null && school.maxStudentsOverride !== undefined) && (
                                                         <Badge className="bg-orange-500/10 text-orange-600 border-none text-[8px] px-1.5 h-4">OVERRIDE</Badge>
                                                     )}
                                                 </div>
                                             </div>
                                         </div>

                                         {/* Teachers */}
                                         <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-white/5 group hover:bg-white dark:hover:bg-slate-900 transition-all">
                                             <div className="flex items-start justify-between">
                                                 <div className="flex items-center gap-4">
                                                     <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                                         <BookOpenIcon size={20} />
                                                     </div>
                                                     <div>
                                                         <p className="text-sm font-bold text-slate-900 dark:text-slate-200">Teacher Capacity</p>
                                                         <p className="text-[10px] text-slate-500 font-medium">Max staff accounts</p>
                                                     </div>
                                                 </div>
                                                 <div className="text-right">
                                                     <p className="text-lg font-black text-slate-900 dark:text-white">
                                                         {school.usage?.limits?.teachers || "Unlimited"}
                                                     </p>
                                                     {(school.maxTeachersOverride !== null && school.maxTeachersOverride !== undefined) && (
                                                         <Badge className="bg-orange-500/10 text-orange-600 border-none text-[8px] px-1.5 h-4">OVERRIDE</Badge>
                                                     )}
                                                 </div>
                                             </div>
                                         </div>

                                         {/* Storage */}
                                         <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-white/5 group hover:bg-white dark:hover:bg-slate-900 transition-all">
                                             <div className="flex items-start justify-between">
                                                 <div className="flex items-center gap-4">
                                                     <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                                         <SaveIcon size={20} />
                                                     </div>
                                                     <div>
                                                         <p className="text-sm font-bold text-slate-900 dark:text-slate-200">Cloud Storage</p>
                                                         <p className="text-[10px] text-slate-500 font-medium">Global disk quota</p>
                                                     </div>
                                                 </div>
                                                 <div className="text-right">
                                                     <p className="text-lg font-black text-slate-900 dark:text-white">
                                                         {school.usage?.limits?.storageGb || "Unlimited"} GB
                                                     </p>
                                                     {(school.maxStorageGbOverride !== null && school.maxStorageGbOverride !== undefined) && (
                                                         <Badge className="bg-orange-500/10 text-orange-600 border-none text-[8px] px-1.5 h-4">OVERRIDE</Badge>
                                                     )}
                                                 </div>
                                             </div>
                                         </div>

                                         {/* Exams */}
                                         <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-white/5 group hover:bg-white dark:hover:bg-slate-900 transition-all">
                                             <div className="flex items-start justify-between">
                                                 <div className="flex items-center gap-4">
                                                     <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                                         <FileTextIcon size={20} />
                                                     </div>
                                                     <div>
                                                         <p className="text-sm font-bold text-slate-900 dark:text-slate-200">Termly Exams</p>
                                                         <p className="text-[10px] text-slate-500 font-medium">Active assessment cycles</p>
                                                     </div>
                                                 </div>
                                                 <div className="text-right">
                                                     <p className="text-lg font-black text-slate-900 dark:text-white">
                                                         {school.usage?.limits?.exams || "Unlimited"}
                                                     </p>
                                                     {(school.maxExamsOverride !== null && school.maxExamsOverride !== undefined) && (
                                                         <Badge className="bg-orange-500/10 text-orange-600 border-none text-[8px] px-1.5 h-4">OVERRIDE</Badge>
                                                     )}
                                                 </div>
                                             </div>
                                         </div>

                                         {/* Classes */}
                                         <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-white/5 group hover:bg-white dark:hover:bg-slate-900 transition-all">
                                             <div className="flex items-start justify-between">
                                                 <div className="flex items-center gap-4">
                                                     <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                                         <BuildingIcon size={20} />
                                                     </div>
                                                     <div>
                                                         <p className="text-sm font-bold text-slate-900 dark:text-slate-200">Classes Capacity</p>
                                                         <p className="text-[10px] text-slate-500 font-medium">Max active classrooms</p>
                                                     </div>
                                                 </div>
                                                 <div className="text-right">
                                                     <p className="text-lg font-black text-slate-900 dark:text-white">
                                                         {school.usage?.limits?.classes || "Unlimited"}
                                                     </p>
                                                     {(school.maxClassesOverride !== null && school.maxClassesOverride !== undefined) && (
                                                         <Badge className="bg-orange-500/10 text-orange-600 border-none text-[8px] px-1.5 h-4">OVERRIDE</Badge>
                                                     )}
                                                 </div>
                                             </div>
                                         </div>

                                         {/* Parents */}
                                         <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-white/5 group hover:bg-white dark:hover:bg-slate-900 transition-all">
                                             <div className="flex items-start justify-between">
                                                 <div className="flex items-center gap-4">
                                                     <div className="h-10 w-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                                                         <UsersIcon size={20} />
                                                     </div>
                                                     <div>
                                                         <p className="text-sm font-bold text-slate-900 dark:text-slate-200">Parent Capacity</p>
                                                         <p className="text-[10px] text-slate-500 font-medium">Max linked guardians</p>
                                                     </div>
                                                 </div>
                                                 <div className="text-right">
                                                     <p className="text-lg font-black text-slate-900 dark:text-white">
                                                         {school.subscriptionPlan?.maxParents || "Unlimited"}
                                                     </p>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                 </div>

                                 {/* Timeline & Financials Section */}
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                     <div className="p-6 bg-slate-900 dark:bg-slate-950 rounded-[2rem] text-white">
                                         <div className="flex items-center gap-3 mb-6">
                                             <ClockIcon size={20} className="text-indigo-400" />
                                             <h4 className="text-sm font-black uppercase tracking-widest">Lifecycle Analytics</h4>
                                         </div>
                                         <div className="space-y-5">
                                             <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                                 <span className="text-xs text-slate-400 font-bold uppercase">Expires On</span>
                                                 <span className="text-sm font-black">{school.subscriptionEnd ? format(new Date(school.subscriptionEnd), "PPP") : "N/A"}</span>
                                             </div>
                                             <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                                 <span className="text-xs text-slate-400 font-bold uppercase">Trial Period</span>
                                                 <span className={cn("text-sm font-black", school.isTrialActive ? "text-indigo-400" : "text-slate-500")}>
                                                     {school.isTrialActive ? (school.trialEndsAt ? format(new Date(school.trialEndsAt), "PPP") : "Active") : "Expired/None"}
                                                 </span>
                                             </div>
                                             <div className="flex justify-between items-center">
                                                 <span className="text-xs text-slate-400 font-bold uppercase">Created At</span>
                                                 <span className="text-sm font-black">{format(new Date(school.createdAt), "PPP")}</span>
                                             </div>
                                         </div>
                                     </div>

                                     <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem]">
                                         <div className="flex items-center gap-3 mb-6">
                                             <CreditCardIcon size={20} className="text-emerald-500" />
                                             <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Financial Metadata</h4>
                                         </div>
                                         
                                         <div className="space-y-6">
                                             <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                                                 <span className="text-xs text-slate-400 font-bold uppercase">Last Payment</span>
                                                 <span className="text-sm font-black text-slate-900 dark:text-white">{school.lastPaymentDate ? format(new Date(school.lastPaymentDate), "PPP") : "No Payment Recorded"}</span>
                                             </div>

                                             <div className="space-y-4">
                                                 <div className="flex items-center gap-2 mb-2">
                                                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Settlement Accounts</span>
                                                     <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] px-1.5 h-4">
                                                         {school.settlementAccounts?.length || 0} CONFIGURED
                                                     </Badge>
                                                 </div>

                                                 {school.settlementAccounts && school.settlementAccounts.length > 0 ? (
                                                     <div className="space-y-3">
                                                         {school.settlementAccounts.map((settlement, idx: number) => (
                                                             <div key={settlement.id || idx} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-white/5">
                                                                 <div className="flex justify-between items-start mb-2">
                                                                     <div className="flex items-center gap-2">
                                                                         <span className="text-[10px] font-mono text-slate-500">{settlement.paystackSubaccountCode}</span>
                                                                         {settlement.isDefault && (
                                                                             <Badge className="bg-indigo-500 text-white border-none text-[8px] px-1.5 h-4">DEFAULT</Badge>
                                                                         )}
                                                                     </div>
                                                                     <Badge className={cn(
                                                                         "border-none text-[8px] font-black uppercase px-1.5 h-4",
                                                                         settlement.paystackSubaccountStatus === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-500"
                                                                     )}>
                                                                         {settlement.paystackSubaccountStatus || "pending"}
                                                                     </Badge>
                                                                 </div>
                                                                 <div className="flex justify-between items-end">
                                                                     <div>
                                                                         <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{settlement.bankName || "No Bank Name"}</p>
                                                                         <p className="text-[10px] font-mono text-slate-500">{settlement.accountNumber || "No Account Number"}</p>
                                                                     </div>
                                                                     <div className="text-right">
                                                                         <p className="text-[10px] text-slate-400 font-bold uppercase">Split Charge</p>
                                                                         <p className="text-xs font-black text-slate-900 dark:text-white">{settlement.percentageCharge || 0}%</p>
                                                                     </div>
                                                                 </div>
                                                             </div>
                                                         ))}
                                                     </div>
                                                 ) : (
                                                     <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-white/5">
                                                         <div className="flex justify-between items-center mb-2">
                                                             <span className="text-[10px] font-mono text-slate-500">{school.paystackSubaccountCode || "NOT_ASSIGNED"}</span>
                                                             <Badge className={cn(
                                                                 "border-none text-[8px] font-black uppercase px-1.5 h-4",
                                                                 school.paystackSubaccountStatus === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-500"
                                                             )}>
                                                                 {school.paystackSubaccountStatus || "pending"}
                                                             </Badge>
                                                         </div>
                                                         <p className="text-[10px] text-slate-400 italic">No detailed settlement records found. Relying on school-level metadata.</p>
                                                     </div>
                                                 )}
                                             </div>

                                             <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                                                 <span className="text-xs text-slate-400 font-bold uppercase">Customer Code</span>
                                                 <span className="text-[10px] font-mono text-slate-500">{school.paystackCustomerCode || "N/A"}</span>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                              </div>
                         )}

                         {activeTab === "staff" && (
                              <div className="py-20 text-center opacity-40">
                                  <UsersIcon size={48} className="mx-auto text-slate-400 mb-4" />
                                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Directory loading...</p>
                              </div>
                         )}
                    </div>
                </div>

                {/* Right Column: Plan Management */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl dark:shadow-2xl sticky top-8">
                        <div className="flex items-center gap-3 mb-8">
                            <CreditCardIcon className="text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">System Override</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Current Status */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-white/5">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Current Status</p>
                                <div className="flex items-center justify-between">
                                    <span className={cn(
                                        "text-sm font-bold",
                                        school.subscriptionStatus === "ACTIVE" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                                    )}>{school.subscriptionStatus}</span>
                                    {school.isTrialActive && <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none px-2 rounded font-black text-[9px]">TRIAL MODE</Badge>}
                                </div>
                            </div>

                            {/* Plan Selection */}
                            <div className="space-y-2">
                                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest ml-1">Subscription Plan</label>
                                <select 
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                                    value={selectedPlanId}
                                    onChange={(e) => setSelectedPlanId(e.target.value)}
                                >
                                    <option value="">Select a plan</option>
                                    {plans?.map((cat) => (
                                        <optgroup key={cat.category} label={cat.category.toUpperCase()} className="bg-white dark:bg-slate-900">
                                            {cat.tabs.map((p: any) => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            {/* Status Override */}
                            <div className="space-y-2">
                                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest ml-1">Force Status</label>
                                <select 
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="SUSPENDED">SUSPENDED</option>
                                    <option value="EXPIRED">EXPIRED</option>
                                    <option value="INACTIVE">INACTIVE</option>
                                </select>
                            </div>

                            {/* Expiration Date */}
                            <div className="space-y-2">
                                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest ml-1">Expiration Date</label>
                                <div className="relative">
                                    <CalendarIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input 
                                        type="date"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Trial Toggle */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/5 mt-2">
                                <div className="flex items-center gap-3">
                                    <ClockIcon size={16} className="text-indigo-600 dark:text-indigo-400" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Is Trial Active?</span>
                                </div>
                                <input 
                                    type="checkbox" 
                                    className="h-5 w-5 rounded border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                                    checked={isTrial}
                                    onChange={(e) => setIsTrial(e.target.checked)}
                                />
                            </div>

                            <Button 
                                className="w-full bg-indigo-600 hover:bg-indigo-500 h-14 rounded-2xl font-bold shadow-xl shadow-indigo-600/20 mt-4"
                                onClick={handleSavePlan}
                                disabled={updatePlan.isPending}
                            >
                                <SaveIcon size={18} className="mr-2" /> 
                                {updatePlan.isPending ? "Applying Changes..." : "Apply Manual Override"}
                            </Button>

                            <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-4" />

                            <div className="space-y-4">
                                <div className="flex flex-col gap-1">
                                    <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">Danger Zone</h4>
                                    <p className="text-[9px] text-slate-400 ml-1">destructive administrative actions</p>
                                </div>
                                
                                <Button 
                                    variant="outline"
                                    className="w-full border-red-500/20 text-red-500 hover:bg-red-500/10 h-14 rounded-2xl font-bold"
                                    onClick={handleResetSubscription}
                                    disabled={resetSubscription.isPending}
                                >
                                    <ResetIcon size={18} className={cn("mr-2", resetSubscription.isPending && "animate-spin")} /> 
                                    {resetSubscription.isPending ? "Resetting Account..." : "Reset Subscription"}
                                </Button>
                            </div>

                            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                                Note: Overriding the plan manually will bypass billing verification until the next billing cycle.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

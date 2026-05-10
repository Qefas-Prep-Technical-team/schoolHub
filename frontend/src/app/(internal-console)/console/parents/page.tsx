"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
    usePlatformParents 
} from "@/lib/api/hooks/usePlatformSchools"
import { 
    Search as SearchIcon, 
    Users as ParentIcon,
    Mail as MailIcon,
    UserCircle as UserIcon,
    Baby as BabyIcon,
    Phone as PhoneIcon,
    ExternalLink as ExternalLinkIcon,
    CreditCard,
    Lock as LockIcon,
    Shield as ShieldIcon,
    Settings2 as SettingsIcon,
    Filter as FilterIcon
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Pagination from "@/components/ui/Pagination"
import { Card } from "@/components/ui/card"

export default function PlatformParentsPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [planFilter, setPlanFilter] = useState("ALL")
    const [currentPage, setCurrentPage] = useState(1)
    const { data: response, isLoading } = usePlatformParents(searchQuery, currentPage, 10, planFilter, statusFilter)
    
    const parents = response?.data || []
    const planBreakdown = response?.planBreakdown || []
    const statusBreakdown = response?.statusBreakdown || []
    const pagination = response?.pagination

    // Status-based summary cards (Normal Style)
    const statusCards = [
        { title: "Paid Parents", value: statusBreakdown.find((s: any) => s.type === 'PAID')?.count || 0, icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { title: "Expired Subs", value: statusBreakdown.find((s: any) => s.type === 'EXPIRED')?.count || 0, icon: LockIcon, color: "text-red-500", bg: "bg-red-500/10" },
        { title: "Cancelled", value: statusBreakdown.find((s: any) => s.type === 'CANCELLED')?.count || 0, icon: ShieldIcon, color: "text-slate-500", bg: "bg-slate-500/10" },
        { title: "Active Trials", value: statusBreakdown.find((s: any) => s.type === 'TRIAL')?.count || 0, icon: SettingsIcon, color: "text-amber-500", bg: "bg-amber-500/10" },
    ]

    return (
        <div className="space-y-8 pb-20">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        Parent <span className="text-indigo-600 dark:text-indigo-500">Registry</span>
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 min-w-[450px]">
                    <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <SearchIcon className="text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        </div>
                        <Input 
                            placeholder="Search name, code, or email..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="pl-12 h-14 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-900 dark:text-white"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 h-14 shadow-sm">
                        <FilterIcon size={14} className="text-slate-400" />
                        <select 
                            value={planFilter}
                            onChange={(e) => {
                                setPlanFilter(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 focus:outline-none cursor-pointer"
                        >
                            <option value="ALL">All Plans</option>
                            {planBreakdown.map((p: any) => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <select 
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="h-14 px-6 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-black text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400 outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="EXPIRED">Expired</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Standard Summary Cards for Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statusCards.map((card, i) => (
                    <Card key={i} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", card.bg)}>
                                <card.icon size={20} className={card.color} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{card.title}</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white leading-none mt-1">
                                    {isLoading ? <Skeleton className="h-6 w-12" /> : card.value}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* ATM Style Pricing Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-[180px] w-full rounded-[2rem] bg-slate-100 dark:bg-slate-800" />
                    ))
                ) : (
                    [
                        { name: "Total Parents", count: pagination?.total || 0, type: 'TOTAL' },
                        ...planBreakdown
                    ].map((plan: any, i: number) => (
                        <div key={i} className="relative h-[180px] w-full rounded-[2rem] p-6 text-white overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] cursor-pointer group">
                            {/* Dynamic Gradient Background */}
                            <div className={cn(
                                "absolute inset-0 z-0",
                                plan.type === 'TOTAL' ? "bg-gradient-to-br from-indigo-900 via-slate-900 to-black" :
                                plan.type?.toUpperCase() === 'FREE' ? "bg-gradient-to-br from-slate-600 to-slate-900" :
                                plan.type?.toUpperCase() === 'TRIAL' ? "bg-gradient-to-br from-amber-500 to-orange-700" :
                                "bg-gradient-to-br from-indigo-500 to-purple-800"
                            )}></div>
                            
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform"></div>
                            
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                                            {plan.type === 'TOTAL' ? "Guardian Demographics" : "Subscription Plan"}
                                        </p>
                                        <h3 className="text-2xl font-black tracking-tighter mt-0.5 uppercase italic leading-tight max-w-[200px]">{plan.name}</h3>
                                    </div>
                                    <div className="h-10 w-14 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-lg shadow-inner flex items-center justify-center overflow-hidden border border-white/20">
                                        <div className="grid grid-cols-3 grid-rows-3 gap-0.5 w-full h-full p-1 opacity-40">
                                            {Array.from({ length: 9 }).map((_, j) => <div key={j} className="border border-black/10 rounded-sm"></div>)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-medium opacity-60">
                                            {plan.type === 'TOTAL' ? "Total Guardians" : "Users Enrolled"}
                                        </p>
                                        <div className="text-3xl font-mono tracking-widest font-black leading-none mt-1">
                                            {plan.count.toString().padStart(4, '0')}
                                        </div>
                                    </div>
                                    <div className="flex -space-x-4">
                                        <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                                            <ParentIcon size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Results Table */}
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
                <div className="overflow-x-auto min-w-full">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 w-16">#</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Parent Profile</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Links & Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 text-right">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={4} className="px-8 py-6"><Skeleton className="h-12 w-full rounded-xl" /></td>
                                    </tr>
                                ))
                            ) : parents?.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30 grayscale">
                                            <ParentIcon size={64} className="text-slate-400" />
                                            <p className="text-xl font-bold text-slate-500">No parents found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                parents?.map((parent: any, index: number) => (
                                    <tr 
                                        key={parent.id}
                                        className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/console/parents/${parent.id}`)}
                                    >
                                        <td className="px-8 py-6 text-xs font-black text-slate-400 dark:text-slate-600">
                                            {(index + 1).toString().padStart(2, '0')}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0 border border-indigo-500/10 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                                                    <UserIcon size={20} />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-base font-black text-slate-900 dark:text-white truncate tracking-tight">
                                                        {parent.fullName}
                                                    </span>
                                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                                        <span className="text-indigo-500">{parent.parentCode}</span>
                                                        <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                                        <span className="truncate flex items-center gap-1">
                                                            <MailIcon size={10} />
                                                            {parent.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-indigo-500/10 text-indigo-500 border-none px-2 py-0.5 rounded-full flex items-center gap-1.5 font-bold text-[10px]">
                                                        <BabyIcon size={10} />
                                                        {parent._count?.children || 0} Linked Children
                                                    </Badge>
                                                    <Badge className={cn(
                                                        "rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-widest border-none",
                                                        parent.subscriptionStatus === 'ACTIVE' 
                                                            ? "bg-emerald-500/10 text-emerald-500" 
                                                            : "bg-amber-500/10 text-amber-500"
                                                    )}>
                                                        {parent.subscriptionStatus}
                                                    </Badge>
                                                </div>
                                                {parent.phone && (
                                                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                                        <PhoneIcon size={10} className="text-slate-400" />
                                                        {parent.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    {format(new Date(parent.createdAt), 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {!isLoading && pagination && pagination.total > 0 && (
                <Pagination 
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit || 10}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    )
}

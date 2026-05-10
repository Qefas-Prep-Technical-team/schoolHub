"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { usePlatformSchools, useUpdateSchoolStatus, useImpersonateAdmin } from "@/lib/api/hooks/usePlatformSchools"
import { cn } from "@/lib/utils"
import { 
    Search as SearchIcon, 
    MoreVertical as MoreVerticalIcon, 
    ExternalLink as ExternalLinkIcon, 
    Lock as LockIcon, 
    Unlock as UnlockIcon,
    Building2 as BuildingIcon,
    Filter as FilterIcon,
    Settings2 as SettingsIcon,
    CreditCard
} from "lucide-react"
import { LimitsModal } from "./components/LimitsModal"
import { Card } from "@/components/ui/card"
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import Pagination from "@/components/ui/Pagination"

export default function SchoolsManagementPage() {
    const router = useRouter()
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [planFilter, setPlanFilter] = useState("ALL")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const limit = 10

    const { data: response, isLoading } = usePlatformSchools(search, page, limit, planFilter, statusFilter)
    const schools = response?.data || []
    const planBreakdown = response?.planBreakdown || []
    const statusBreakdown = response?.statusBreakdown || []
    const pagination = response?.pagination || { total: 0, totalPages: 1 }

    const toggleStatus = useUpdateSchoolStatus()
    const impersonate = useImpersonateAdmin()
    const [selectedSchool, setSelectedSchool] = useState<any>(null)
    const [isLimitsModalOpen, setIsLimitsModalOpen] = useState(false)
    // Status-based summary cards (Normal Style)
    const statusCards = [
        { title: "Paid Institutions", value: response?.statusBreakdown?.find((s: any) => s.type === 'PAID')?.count || 0, icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { title: "Expired Institutions", value: response?.statusBreakdown?.find((s: any) => s.type === 'EXPIRED')?.count || 0, icon: LockIcon, color: "text-red-500", bg: "bg-red-500/10" },
        { title: "Cancelled Plans", value: response?.statusBreakdown?.find((s: any) => s.type === 'CANCELLED')?.count || 0, icon: BuildingIcon, color: "text-slate-500", bg: "bg-slate-500/10" },
        { title: "Active Trials", value: response?.statusBreakdown?.find((s: any) => s.type === 'TRIAL')?.count || 0, icon: SettingsIcon, color: "text-amber-500", bg: "bg-amber-500/10" },
    ]

    return (
        <div className="space-y-8 pb-20">
            {/* Title Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Institution Hub</h1>
                    <p className="text-slate-500 font-medium mt-1">Real-time subscription monitoring for all schools.</p>
                </div>
                <div className="flex items-center gap-3">
                     <Button className="bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 text-white">
                        Deploy New Tenant
                     </Button>
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
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-[180px] w-full rounded-[2rem] bg-slate-100 dark:bg-slate-800" />
                    ))
                ) : (
                    [
                        { name: "Total Institutions", count: pagination.total, type: 'TOTAL' },
                        ...planBreakdown
                    ].map((plan: any, i: number) => (
                        <div key={i} className="relative h-[180px] w-full rounded-[2rem] p-6 text-white overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] cursor-pointer group">
                            {/* Dynamic Gradient Background */}
                            <div className={cn(
                                "absolute inset-0 z-0",
                                plan.type === 'TOTAL' ? "bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900" :
                                plan.type?.toUpperCase() === 'FREE' ? "bg-gradient-to-br from-slate-600 to-slate-900" :
                                plan.type?.toUpperCase() === 'TRIAL' ? "bg-gradient-to-br from-amber-500 to-orange-700" :
                                "bg-gradient-to-br from-indigo-500 to-purple-800"
                            )}></div>
                            
                            {/* Decorative Elements */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform"></div>
                            
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                                            {plan.type === 'TOTAL' ? "Ecosystem Overview" : "Institutional Plan"}
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
                                            {plan.type === 'TOTAL' ? "Total Deployed" : "Schools Enrolled"}
                                        </p>
                                        <div className="text-3xl font-mono tracking-widest font-black leading-none mt-1">
                                            {plan.count.toString().padStart(4, '0')}
                                        </div>
                                    </div>
                                    <div className="flex -space-x-4">
                                        <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                                            <BuildingIcon size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Filters Header */}
            <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
                <div className="relative group flex-1 max-w-xl">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input
                        type="search"
                        placeholder="Search by school name, tenant ID, or code..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setPage(1) // Reset to page 1 on search
                        }}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:bg-white/10 transition-all font-medium shadow-sm"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
                        <FilterIcon size={14} className="text-slate-400" />
                        <select 
                            value={planFilter}
                            onChange={(e) => {
                                setPlanFilter(e.target.value)
                                setPage(1)
                            }}
                            className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
                        >
                            <option value="ALL">All Plans</option>
                            {planBreakdown.map((p: any) => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                            <option value="FREE">Free Tier (Generic)</option>
                            <option value="TRIAL">Trial Mode (Generic)</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
                        <SettingsIcon size={14} className="text-slate-400" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value)
                                setPage(1)
                            }}
                            className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="EXPIRED">Expired</option>
                            <option value="SUSPENDED">Suspended</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Schools Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-xl dark:shadow-2xl">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-950/50">
                        <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                            <TableHead className="py-6 pl-8 text-slate-500 font-bold uppercase tracking-widest text-[10px] w-12">#</TableHead>
                            <TableHead className="py-6 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Institution</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Tenant ID</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Plan</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Status</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Joined</TableHead>
                            <TableHead className="text-right pr-8 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="border-slate-800">
                                    <TableCell className="pl-8 py-4"><Skeleton className="h-6 w-4 bg-slate-800" /></TableCell>
                                    <TableCell className="py-4"><Skeleton className="h-10 w-40 bg-slate-800" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 bg-slate-800" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16 bg-slate-800" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16 bg-slate-800 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 bg-slate-800" /></TableCell>
                                    <TableCell className="pr-8 text-right"><Skeleton className="h-8 w-8 ml-auto bg-slate-800 rounded-lg" /></TableCell>
                                </TableRow>
                            ))
                        ) : schools?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-40 text-center text-slate-500 font-medium">
                                    No institutions found matching your search.
                                </TableCell>
                            </TableRow>
                        ) : (
                            schools?.map((school: any, index: number) => (
                                <TableRow 
                                    key={school.id} 
                                    className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                    onClick={() => router.push(`/console/schools/${school.id}`)}
                                >
                                    <TableCell className="pl-8 py-6 text-slate-500 font-mono text-xs">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </TableCell>
                                    <TableCell className="py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center border border-white/5">
                                                <BuildingIcon size={18} className="text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white leading-tight">{school.name}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{school.schoolCode}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <code className="text-xs bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-md text-indigo-600 dark:text-indigo-400 font-mono">
                                            {school.tenantId}
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg px-2">
                                            {school.plan || "N/A"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "h-2 w-2 rounded-full",
                                                school.subscriptionStatus === "ACTIVE" ? "bg-emerald-500" : "bg-red-500"
                                            )}></div>
                                            <span className={cn(
                                                "text-xs font-bold",
                                                school.subscriptionStatus === "ACTIVE" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                                            )}>
                                                {school.subscriptionStatus}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-400 font-medium">
                                        {new Date(school.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="pr-8 text-right">
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="hover:bg-white/5 text-slate-500">
                                                        <MoreVerticalIcon size={18} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-2xl shadow-2xl p-2 pb-1">
                                                    <DropdownMenuItem 
                                                        className="rounded-xl py-3 cursor-pointer hover:bg-white/5 focus:bg-white/5"
                                                        onClick={() => router.push(`/console/schools/${school.id}`)}
                                                    >
                                                        <SearchIcon size={16} className="mr-3 text-slate-400" />
                                                        <span className="font-medium">View Full Details</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        className="rounded-xl py-3 cursor-pointer hover:bg-white/5 focus:bg-white/5"
                                                        onClick={() => impersonate.mutate(school.id)}
                                                    >
                                                        <ExternalLinkIcon size={16} className="mr-3 text-indigo-400" />
                                                        <span className="font-medium">Impersonate Admin</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        className="rounded-xl py-3 cursor-pointer hover:bg-white/5 focus:bg-white/5"
                                                        onClick={() => {
                                                            setSelectedSchool(school)
                                                            setIsLimitsModalOpen(true)
                                                        }}
                                                    >
                                                        <SettingsIcon size={16} className="mr-3 text-orange-400" />
                                                        <span className="font-medium">Manage Limits</span>
                                                    </DropdownMenuItem>
                                                    <div className="h-[1px] bg-white/5 my-1 mx-2" />
                                                    {school.subscriptionStatus === "ACTIVE" ? (
                                                        <DropdownMenuItem 
                                                            className="rounded-xl py-3 cursor-pointer text-red-400 hover:bg-red-400/10 focus:bg-red-400/10"
                                                            onClick={() => toggleStatus.mutate({ id: school.id, status: "SUSPENDED" })}
                                                        >
                                                            <LockIcon size={16} className="mr-3" />
                                                            <span className="font-medium">Suspend Access</span>
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem 
                                                            className="rounded-xl py-3 cursor-pointer text-emerald-400 hover:bg-emerald-400/10 focus:bg-emerald-400/10"
                                                            onClick={() => toggleStatus.mutate({ id: school.id, status: "ACTIVE" })}
                                                        >
                                                            <UnlockIcon size={16} className="mr-3" />
                                                            <span className="font-medium">Restore Access</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {pagination.total > 0 && (
                <div className="flex justify-center pt-8">
                    <Pagination 
                        currentPage={page}
                        totalItems={pagination.total}
                        itemsPerPage={limit}
                        totalPages={pagination.totalPages}
                        onPageChange={(p) => setPage(p)}
                    />
                </div>
            )}

            <LimitsModal 
                isOpen={isLimitsModalOpen}
                onClose={() => setIsLimitsModalOpen(false)}
                school={selectedSchool}
            />
        </div>
    )
}

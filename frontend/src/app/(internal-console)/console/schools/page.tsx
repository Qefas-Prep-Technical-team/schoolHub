"use client"

import { useState } from "react"
import { usePlatformSchools, useUpdateSchoolStatus, useImpersonateAdmin } from "@/lib/api/hooks/usePlatformSchools"
import { cn } from "@/lib/utils"
import { 
    Search, 
    MoreVertical, 
    ShieldAlert, 
    ExternalLink, 
    Lock, 
    Unlock,
    Building2,
    Filter,
    Settings2
} from "lucide-react"
import { LimitsModal } from "./components/LimitsModal"
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

export default function SchoolsManagementPage() {
    const [search, setSearch] = useState("")
    const { data: schools, isLoading } = usePlatformSchools(search)
    const toggleStatus = useUpdateSchoolStatus()
    const impersonate = useImpersonateAdmin()
    const [selectedSchool, setSelectedSchool] = useState<any>(null)
    const [isLimitsModalOpen, setIsLimitsModalOpen] = useState(false)

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Tenant Ecosystem</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage and monitor all school institutions.</p>
                </div>
                <div className="flex items-center gap-3">
                     <Button variant="outline" className="bg-slate-900 border-slate-800 text-slate-400 hover:text-white">
                        <Filter size={16} className="mr-2" /> Filter
                     </Button>
                     <Button className="bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/20">
                        Deploy New Tenant
                     </Button>
                </div>
            </div>

            {/* Search Header */}
            <div className="relative group max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                    type="search"
                    placeholder="Search by school name, tenant ID, or code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 transition-all font-medium"
                />
            </div>

            {/* Schools Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-slate-950/50">
                        <TableRow className="border-slate-800 hover:bg-transparent">
                            <TableHead className="py-6 pl-8 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Institution</TableHead>
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
                                    <TableCell className="pl-8 py-4"><Skeleton className="h-10 w-40 bg-slate-800" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 bg-slate-800" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16 bg-slate-800" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16 bg-slate-800 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 bg-slate-800" /></TableCell>
                                    <TableCell className="pr-8 text-right"><Skeleton className="h-8 w-8 ml-auto bg-slate-800 rounded-lg" /></TableCell>
                                </TableRow>
                            ))
                        ) : schools?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center text-slate-500 font-medium">
                                    No institutions found matching your search.
                                </TableCell>
                            </TableRow>
                        ) : (
                            schools?.map((school: any) => (
                                <TableRow key={school.id} className="border-slate-800 hover:bg-white/[0.02] transition-colors group">
                                    <TableCell className="pl-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center border border-white/5">
                                                <Building2 size={18} className="text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white leading-tight">{school.name}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{school.schoolCode}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <code className="text-xs bg-slate-950 px-2 py-1 rounded-md text-indigo-400 font-mono">
                                            {school.tenantId}
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-slate-950 border-slate-700 text-slate-300 rounded-lg px-2">
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
                                                school.subscriptionStatus === "ACTIVE" ? "text-emerald-400" : "text-red-400"
                                            )}>
                                                {school.subscriptionStatus}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-400 font-medium">
                                        {new Date(school.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="pr-8 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="hover:bg-white/5 text-slate-500">
                                                    <MoreVertical size={18} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 text-slate-200 rounded-2xl shadow-2xl p-2 pb-1">
                                                <DropdownMenuItem 
                                                    className="rounded-xl py-3 cursor-pointer hover:bg-white/5 focus:bg-white/5"
                                                    onClick={() => impersonate.mutate(school.id)}
                                                >
                                                    <ExternalLink size={16} className="mr-3 text-indigo-400" />
                                                    <span className="font-medium">Impersonate Admin</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="rounded-xl py-3 cursor-pointer hover:bg-white/5 focus:bg-white/5"
                                                    onClick={() => {
                                                        setSelectedSchool(school)
                                                        setIsLimitsModalOpen(true)
                                                    }}
                                                >
                                                    <Settings2 size={16} className="mr-3 text-orange-400" />
                                                    <span className="font-medium">Manage Limits</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="rounded-xl py-3 cursor-pointer hover:bg-white/5 focus:bg-white/5">
                                                    <ShieldAlert size={16} className="mr-3 text-blue-400" />
                                                    <span className="font-medium">View Usage Stats</span>
                                                </DropdownMenuItem>
                                                <div className="h-[1px] bg-white/5 my-1 mx-2" />
                                                {school.subscriptionStatus === "ACTIVE" ? (
                                                    <DropdownMenuItem 
                                                        className="rounded-xl py-3 cursor-pointer text-red-400 hover:bg-red-400/10 focus:bg-red-400/10"
                                                        onClick={() => toggleStatus.mutate({ id: school.id, status: "SUSPENDED" })}
                                                    >
                                                        <Lock size={16} className="mr-3" />
                                                        <span className="font-medium">Suspend Access</span>
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem 
                                                        className="rounded-xl py-3 cursor-pointer text-emerald-400 hover:bg-emerald-400/10 focus:bg-emerald-400/10"
                                                        onClick={() => toggleStatus.mutate({ id: school.id, status: "ACTIVE" })}
                                                    >
                                                        <Unlock size={16} className="mr-3" />
                                                        <span className="font-medium">Restore Access</span>
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <LimitsModal 
                isOpen={isLimitsModalOpen}
                onClose={() => setIsLimitsModalOpen(false)}
                school={selectedSchool}
            />
        </div>
    )
}

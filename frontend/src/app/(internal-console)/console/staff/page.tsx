"use client"

import { useState } from "react"
import { usePlatformStaffList, useUpdateStaffRole, useResetStaffCredentials } from "@/lib/api/hooks/usePlatformStaff"
import { 
    Users, 
    ShieldCheck, 
    UserPlus, 
    MoreVertical, 
    Mail, 
    Lock,
    Key,
    ShieldAlert,
    History,
    ChevronLeft,
    ChevronRight,
    Search,
    Shield
} from "lucide-react"
import { usePlatformAuditLogs } from "@/lib/api/hooks/usePlatformGovernance"
import { formatDistanceToNow } from "date-fns"
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
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuPortal
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateStaffModal } from "./components/CreateStaffModal"

export default function PlatformStaffPage() {
    const [staffPage, setStaffPage] = useState(1)
    const [logsPage, setLogsPage] = useState(1)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const { mutate: updateRole, isPending: updatingRole } = useUpdateStaffRole()
    const { mutate: resetCredentials, isPending: resetting } = useResetStaffCredentials()

    const { data: staffData, isLoading: staffLoading } = usePlatformStaffList(staffPage, 8)
    const { data: logsData } = usePlatformAuditLogs(logsPage, 5)
    
    const staff = staffData?.data
    const staffMeta = staffData?.meta
    const logs = logsData?.data
    const logsMeta = logsData?.meta

    return (
        <div className="space-y-10 pb-20">
            <CreateStaffModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Internal Workforce</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage platform staff accounts and authorization levels.</p>
                </div>
                <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-6 font-bold shadow-xl shadow-indigo-600/20 gap-2"
                >
                    <UserPlus size={18} /> Provision Staff Account
                </Button>
            </div>

            {/* Staff Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl dark:shadow-2xl">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-950/50">
                        <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                            <TableHead className="py-6 pl-8 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Staff Member</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Access Role</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Status</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Last Active</TableHead>
                            <TableHead className="text-right pr-8 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Authorization</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {staffLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="border-slate-200 dark:border-slate-800">
                                    <TableCell className="pl-8 py-6"><Skeleton className="h-10 w-40 bg-slate-100 dark:bg-slate-800" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 bg-slate-100 dark:bg-slate-800" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 bg-slate-100 dark:bg-slate-800" /></TableCell>
                                    <TableCell className="pr-8 text-right"><Skeleton className="h-8 w-8 ml-auto bg-slate-100 dark:bg-slate-800 rounded-lg" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            staff?.map((member: any) => (
                                <TableRow key={member.id} className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                    <TableCell className="pl-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 font-black text-xs uppercase">
                                                {member.fullName.split(' ').map((n:any) => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white leading-tight">{member.fullName}</p>
                                                <p className="text-[10px] text-slate-500 font-medium">{member.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn(
                                            "border-none rounded-lg px-2 text-[9px] font-black uppercase tracking-widest",
                                            member.role === 'OWNER' ? "bg-purple-500/10 text-purple-400" :
                                            member.role === 'TECH_ADMIN' ? "bg-blue-500/10 text-blue-400" :
                                            member.role === 'FINANCE_ADMIN' ? "bg-emerald-500/10 text-emerald-400" :
                                            member.role === 'SUPPORT_AGENT' ? "bg-amber-500/10 text-amber-400" :
                                            "bg-indigo-500/10 text-indigo-400"
                                        )}>
                                            {member.role.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={cn("h-2 w-2 rounded-full", member.isActive ? "bg-emerald-500" : "bg-red-500")}></div>
                                            <span className={cn("text-xs font-bold uppercase tracking-tighter", member.isActive ? "text-emerald-400" : "text-red-400")}>
                                                {member.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-400 font-medium">
                                        {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleDateString() : "Never"}
                                    </TableCell>
                                    <TableCell className="pr-8 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500">
                                                    <MoreVertical size={18} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-2xl shadow-2xl p-2">
                                                <DropdownMenuItem 
                                                    disabled={resetting}
                                                    onClick={() => {
                                                        if (confirm(`Are you sure you want to request a credentials reset for ${member.fullName}?`)) {
                                                            resetCredentials(member.id);
                                                        }
                                                    }}
                                                    className="rounded-xl py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5"
                                                >
                                                    <Key size={16} className="mr-3 text-amber-400" />
                                                    <span className="font-medium">Reset Credentials</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger className="rounded-xl py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 data-[state=open]:bg-slate-50 dark:data-[state=open]:bg-white/5">
                                                        <ShieldAlert size={16} className="mr-3 text-red-500" />
                                                        <span className="font-medium">Modify Access Level</span>
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-48 p-2">
                                                            {["OWNER", "FINANCE_ADMIN", "SUPPORT_AGENT", "TECH_ADMIN"].map(r => (
                                                                <DropdownMenuItem 
                                                                    key={r}
                                                                    disabled={updatingRole}
                                                                    onClick={() => updateRole({ id: member.id, role: r })}
                                                                    className={cn(
                                                                        "rounded-lg py-2 cursor-pointer font-medium hover:bg-slate-50 dark:hover:bg-white/5",
                                                                        member.role === r ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"
                                                                    )}
                                                                >
                                                                    {r.replace('_', ' ')}
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuPortal>
                                                </DropdownMenuSub>
                                                
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                
                {/* Table Pagination */}
                <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Showing {((staffPage-1) * 8) + 1} - {Math.min(staffPage * 8, staffMeta?.total || 0)} of {staffMeta?.total || 0} Workforce
                    </p>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30"
                            onClick={() => setStaffPage(p => Math.max(1, p - 1))}
                            disabled={staffPage === 1}
                        >
                            <ChevronLeft size={14} className="text-slate-400" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30"
                            onClick={() => setStaffPage(p => p + 1)}
                            disabled={staffPage >= (staffMeta?.totalPages || 1)}
                        >
                            <ChevronRight size={14} className="text-slate-400" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Platform Audit Trail (Mini) */}
                <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl dark:shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                             <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-slate-500 border border-slate-200 dark:border-white/5">
                                <History size={20} />
                             </div>
                             <h3 className="text-xl font-black text-slate-900 dark:text-white">Global Activity Log</h3>
                        </div>
                        <Button variant="ghost" className="text-[10px] font-black uppercase text-slate-500 tracking-widest hover:text-white">View Comprehensive History</Button>
                    </div>
                    
                    <div className="space-y-4">
                        {!logs || logs.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No activity recorded yet</p>
                            </div>
                        ) : (
                            logs.map((log: any) => (
                                <div key={log.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-8 w-8 rounded-lg flex items-center justify-center",
                                            log.action.includes('SUSPEND') || log.action.includes('DELETE') ? "bg-red-500/10" : "bg-indigo-600/10"
                                        )}>
                                            {log.action.includes('SCHOOL') ? <Users size={14} className="text-indigo-400" /> : 
                                             log.action.includes('STAFF') ? <Shield size={14} className="text-blue-400" /> :
                                             <Key size={14} className="text-amber-400" />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{log.action.replace('_', ' ')}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">
                                                {log.staff?.fullName} performed {log.action.toLowerCase().replace('_', ' ')} on {log.entityType || 'system'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* Log Pagination */}
                    {logsMeta && logsMeta.totalPages > 1 && (
                        <div className="mt-8 flex justify-center gap-4">
                            <Button 
                                variant="ghost" 
                                className="text-[10px] font-black uppercase text-slate-500 tracking-widest disabled:opacity-20"
                                onClick={() => setLogsPage(p => Math.max(1, p - 1))}
                                disabled={logsPage === 1}
                            >
                                Newer
                            </Button>
                            <Button 
                                variant="ghost" 
                                className="text-[10px] font-black uppercase text-slate-500 tracking-widest disabled:opacity-20"
                                onClick={() => setLogsPage(p => p + 1)}
                                disabled={logsPage >= logsMeta.totalPages}
                            >
                                Older
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Role Definitions Reference */}
                <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] space-y-8 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Role Authority</h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                             <div className="flex items-center gap-2">
                                <Badge className="bg-purple-500/10 text-purple-400 border-none text-[8px] font-black uppercase tracking-tighter transition-all group-hover:scale-105">Owner</Badge>
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300">Absolute Authorization</span>
                             </div>
                             <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Full access to billing, tech configs, and staff management.</p>
                        </div>
                        <div className="space-y-2">
                             <div className="flex items-center gap-2">
                                <Badge className="bg-blue-500/10 text-blue-400 border-none text-[8px] font-black uppercase tracking-tighter transition-all group-hover:scale-105">Tech Admin</Badge>
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300">System Visibility</span>
                             </div>
                             <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Access to health metrics, error logs, and system debugging.</p>
                        </div>
                        <div className="space-y-2">
                             <div className="flex items-center gap-2">
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] font-black uppercase tracking-tighter transition-all group-hover:scale-105">Finance Admin</Badge>
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300">Treasury Control</span>
                             </div>
                             <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Manage payout schedules, plan pricing, and fee settlements.</p>
                        </div>
                        <div className="space-y-2">
                             <div className="flex items-center gap-2">
                                <Badge className="bg-amber-500/10 text-amber-400 border-none text-[8px] font-black uppercase tracking-tighter transition-all group-hover:scale-105">Support Agent</Badge>
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300">Issue Resolution</span>
                             </div>
                             <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Direct impersonation access for troubleshooting and ticketing.</p>
                        </div>
                    </div>
                    <div className="pt-4">
                        <Button className="w-full bg-slate-900 border border-white/5 text-[10px] font-black uppercase text-indigo-400 h-12 rounded-xl">Security Policy</Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}

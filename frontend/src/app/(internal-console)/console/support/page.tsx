"use client"

import { useState } from "react"
import { usePlatformSchools, useImpersonateAdmin } from "@/lib/api/hooks/usePlatformSchools"
import { usePlatformTickets } from "@/lib/api/hooks/usePlatformSupport"
import { 
    Search, 
    MessageCircle, 
    ShieldCheck, 
    ExternalLink, 
    UserPlus,
    Activity,
    Mail,
    Phone,
    Globe,
    Zap
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export default function SupportCenterPage() {
    const [search, setSearch] = useState("")
    const { data: schools, isLoading: schoolsLoading } = usePlatformSchools(search)
    const { data: tickets, isLoading: ticketsLoading } = usePlatformTickets()
    const impersonate = useImpersonateAdmin()

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Support Command</h1>
                    <p className="text-slate-500 font-medium mt-1">Resolve tenant inquiries and manage service availability.</p>
                </div>
                <div className="flex items-center gap-3">
                     <Button className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-6 font-bold shadow-xl shadow-indigo-600/20">
                        Create Support Ticket
                     </Button>
                </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="p-6 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center gap-4 group hover:bg-indigo-600/20 transition-all cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                        <MessageCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none mb-1">Open Tickets</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{tickets?.length || 0}</p>
                    </div>
                 </div>
                 <div className="p-6 rounded-[2rem] bg-emerald-600/10 border border-emerald-500/20 flex items-center gap-4 group hover:bg-emerald-600/20 transition-all cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none mb-1">Status Active</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{schools?.filter((s:any) => s.subscriptionStatus === 'ACTIVE').length || 0}</p>
                    </div>
                 </div>
                 <div className="p-6 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center gap-4 group hover:bg-indigo-600/20 transition-all cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                        <Zap size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none mb-1">Tunnel Active</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">0</p>
                    </div>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* School Quick Search for Support */}
                <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl dark:shadow-2xl">
                    <CardHeader className="p-0 mb-8">
                        <CardTitle className="text-xl font-black text-slate-900 dark:text-white">Institution Lookup</CardTitle>
                        <p className="text-sm text-slate-500 font-medium">Search for a school to impersonate or manage its status.</p>
                        <div className="relative mt-6 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                            <input
                                type="search"
                                placeholder="Search by name, ID, or school code..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                        {schoolsLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-20 w-full bg-slate-950/50 border border-white/5 rounded-2xl" />
                            ))
                        ) : schools?.length === 0 ? (
                            <div className="p-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                                <Globe className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
                                <p className="text-slate-400 dark:text-slate-500 font-bold">No schools found matching your search</p>
                            </div>
                        ) : (
                            schools?.map((school: any) => (
                                <div key={school.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/5">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white leading-tight">{school.name}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <Badge className="bg-slate-100 dark:bg-slate-900 text-slate-500 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0">
                                                    {school.tenantId}
                                                </Badge>
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest",
                                                    school.subscriptionStatus === 'ACTIVE' ? 'text-emerald-500' : 'text-red-500'
                                                )}>
                                                    ● {school.subscriptionStatus}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        className="h-10 px-4 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-lg gap-2 text-xs font-bold"
                                        onClick={() => impersonate.mutate(school.id)}
                                    >
                                        Impersonate <ExternalLink size={14} />
                                    </Button>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Right Column: Support Tickets & Contact */}
                <div className="space-y-6">
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl dark:shadow-2xl">
                         <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-6">Recent Tickets</h3>
                         <div className="space-y-4">
                            {ticketsLoading ? (
                                <Skeleton className="h-40 w-full bg-slate-950/50 rounded-2xl" />
                            ) : tickets?.length === 0 ? (
                                <div className="text-center py-6 text-slate-600 italic">No open tickets</div>
                            ) : (
                                tickets?.map((ticket: any) => (
                                    <div key={ticket.id} className="pb-4 border-b border-white/5 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <Badge className="bg-blue-600/10 text-blue-400 border-none text-[8px] font-black uppercase tracking-widest">
                                                {ticket.priority || 'Medium'}
                                            </Badge>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-600 font-bold">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{ticket.school?.name}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{ticket.subject || 'System Inquiry'}</p>
                                    </div>
                                ))
                            )}
                         </div>
                         <Button className="w-full mt-6 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 font-bold text-xs py-5 rounded-xl">
                            View All Tickets
                         </Button>
                    </Card>

                    <Card className="bg-gradient-to-br from-indigo-700 to-indigo-900 dark:from-indigo-900 dark:to-slate-900 border-indigo-500/20 shadow-xl dark:shadow-2xl shadow-indigo-500/5 p-8 rounded-[2.5rem] relative overflow-hidden">
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-xl font-black text-white tracking-tighter">Emergency <br/> Hotline</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-white/70">
                                    <Mail size={14} className="text-indigo-400" />
                                    <span className="text-xs font-bold">ops-support@schoolhub.io</span>
                                </div>
                                <div className="flex items-center gap-3 text-white/70">
                                    <Phone size={14} className="text-indigo-400" />
                                    <span className="text-xs font-bold">+234 810 000 0000</span>
                                </div>
                            </div>
                            <Button className="w-full h-12 bg-white text-indigo-900 font-bold text-[10px] uppercase tracking-widest rounded-xl">
                                Global Broadcast
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

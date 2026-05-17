"use client"

import { usePlatformAuditLogs, PlatformAuditLog } from "@/lib/api/hooks/usePlatformGovernance"
import { 
    History, 
    Search, 
    Filter, 
    Download, 
    ShieldCheck, 
    User, 
    HardDrive, 
    ExternalLink,
    Clock,
    ChevronLeft,
    ChevronRight,
    Eye,
    Code
} from "lucide-react"
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from "@/components/ui/dialog"
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
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function PlatformLogsPage() {
    const [page, setPage] = useState(1)
    const { data: logs, isLoading } = usePlatformAuditLogs(page, 15)
    const [selectedLog, setSelectedLog] = useState<PlatformAuditLog | null>(null)
    const [isInspectOpen, setIsInspectOpen] = useState(false)

    const totalPages = logs?.meta?.totalPages || 1

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Audit & Compliance</h1>
                    <p className="text-slate-500 font-medium mt-1">Immutable record of platform-wide staff actions and system events.</p>
                </div>
                <div className="flex items-center gap-3">
                     <Button variant="outline" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white rounded-xl h-12 px-6 gap-2 shadow-sm">
                        <Download size={18} /> Export Compliance Log
                     </Button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input 
                        placeholder="Search by action, entity ID, or staff email..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="ghost" className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 rounded-2xl h-12 px-6 gap-2 hover:text-indigo-600 dark:hover:text-white">
                        <Filter size={16} /> Filters
                    </Button>
                    <Button variant="ghost" className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 rounded-2xl h-12 px-6 gap-2 hover:text-indigo-600 dark:hover:text-white">
                        <Clock size={16} /> Time Range
                    </Button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl dark:shadow-2xl">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-950/50">
                        <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                            <TableHead className="py-6 pl-8 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Action Event</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Operator</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Entity Type</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Target ID</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Timestamp</TableHead>
                            <TableHead className="text-right pr-8 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Inspect</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 10 }).map((_, i) => (
                                <TableRow key={i} className="border-slate-100 dark:border-slate-800">
                                    <TableCell colSpan={6} className="py-4 px-8"><Skeleton className="h-8 w-full bg-slate-100 dark:bg-slate-950" /></TableCell>
                                </TableRow>
                            ))
                        ) : (logs?.data?.length ?? 0) === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-60 text-center">
                                    <div className="flex flex-col items-center gap-3 text-slate-600">
                                        <History size={48} className="opacity-10" />
                                        <p className="font-bold">No operational activities recorded recently.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs?.data?.map((log: PlatformAuditLog) => (
                                <TableRow key={log.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                    <TableCell className="pl-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-8 w-8 rounded-lg flex items-center justify-center border",
                                                log.action.includes('DELETE') ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400" :
                                                log.action.includes('CREATE') ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                                                "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
                                            )}>
                                                <ShieldCheck size={14} />
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-white text-xs tracking-tight">{log.action.replace('_', ' ')}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <User size={12} className="text-slate-400 dark:text-slate-600" />
                                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{log.staff?.fullName || "System"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className="bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-500 rounded-lg text-[9px] font-black uppercase">
                                            {log.entityType}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-[10px] text-slate-500">
                                        {log.entityId?.substring(0, 8) || "N/A"}...
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-400 font-medium">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 text-slate-400 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-white"
                                            onClick={() => {
                                                setSelectedLog(log)
                                                setIsInspectOpen(true)
                                            }}
                                        >
                                            <Eye size={14} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Showing Page <span className="text-indigo-600 dark:text-indigo-400">{page}</span> of <span className="text-slate-900 dark:text-white">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl h-10 px-4 gap-2 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white"
                    >
                        <ChevronLeft size={14} /> Prev
                    </Button>
                    <Button 
                        variant="outline" 
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl h-10 px-4 gap-2 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white"
                    >
                        Next <ChevronRight size={14} />
                    </Button>
                </div>
            </div>
            
            <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-3xl p-6 flex items-center gap-4">
                 <div className="bg-indigo-600 h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <ShieldCheck size={20} />
                 </div>
                 <div>
                    <h4 className="text-sm font-black text-white tracking-tight uppercase">Compliance Guarantee</h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">All operations within this console are signed and metadata-rich. No records can be modified after entry.</p>
                 </div>
            </div>

            {/* Log Inspection Modal */}
            <Dialog open={isInspectOpen} onOpenChange={setIsInspectOpen}>
                <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-[2rem] shadow-2xl max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black tracking-tight uppercase flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <Code size={18} />
                            </div>
                            Action Metadata
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                            Granular payload and context for the recorded operational event.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="py-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-white/5">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Action</p>
                                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{selectedLog.action}</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-white/5">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Operator</p>
                                    <p className="text-sm font-bold">{selectedLog.staff?.fullName || "System"}</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-white/5">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Entity</p>
                                    <p className="text-sm font-bold">{selectedLog.entityType} ({selectedLog.entityId?.substring(0, 8)})</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-white/5">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Timestamp</p>
                                    <p className="text-sm font-bold">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-950 rounded-2xl border border-white/5 relative group">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">JSON Payload</p>
                                <pre className="text-[11px] font-mono text-emerald-400/80 overflow-x-auto p-4 bg-black/40 rounded-xl">
                                    {JSON.stringify((selectedLog as any).details || {}, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

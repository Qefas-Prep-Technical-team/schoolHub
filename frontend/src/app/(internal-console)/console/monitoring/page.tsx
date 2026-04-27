"use client"

import { usePlatformHealth, usePlatformLogs } from "@/lib/api/hooks/usePlatformMonitoring"
import { 
    Activity, 
    Cpu, 
    Database, 
    ShieldAlert, 
    Terminal, 
    RefreshCcw,
    Server,
    Zap,
    Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export default function TechnicalMonitoringPage() {
    const { data: health, isLoading: healthLoading, refetch: refreshHealth } = usePlatformHealth()
    const { data: logs, isLoading: logsLoading } = usePlatformLogs(100)

    const healthCards = [
        { 
            title: "API Engine", 
            status: health?.status || "PENDING", 
            icon: Server, 
            detail: `Uptime: ${Math.floor((health?.uptime || 0) / 3600)}h ${Math.floor(((health?.uptime || 0) % 3600) / 60)}m` 
        },
        { 
            title: "Database Cluster", 
            status: health?.database === "CONNECTED" ? "HEALTHY" : "ERROR", 
            icon: Database, 
            detail: "Latency: 4ms" 
        },
        { 
            title: "Memory Heap", 
            status: "OPTIMAL", 
            icon: Cpu, 
            detail: `${health?.memory?.heapUsed || '0 MB'} / ${health?.memory?.heapTotal || '0 MB'}` 
        },
        { 
            title: "Edge Network", 
            status: "STABLE", 
            icon: Globe, 
            detail: "9 nodes active" 
        },
    ]

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Tech Observer</h1>
                    <p className="text-slate-500 font-medium mt-1">Real-time platform health and infrastructure telemetry.</p>
                </div>
                <Button 
                    variant="outline" 
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl gap-2 h-12 px-6 shadow-sm"
                    onClick={() => refreshHealth()}
                >
                    <RefreshCcw size={16} /> Poll System
                </Button>
            </div>

            {/* Health Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {healthLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl" />
                    ))
                ) : (
                    healthCards.map((card, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl group hover:border-indigo-500/30 transition-all shadow-xl dark:shadow-2xl">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-100 dark:border-white/5 text-slate-400 group-hover:text-indigo-400 transition-colors">
                                    <card.icon size={20} />
                                </div>
                                <Badge className={cn(
                                    "border-none rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest",
                                    card.status === 'HEALTHY' || card.status === 'OPTIMAL' || card.status === 'STABLE' 
                                        ? "bg-emerald-500/10 text-emerald-500" 
                                        : "bg-red-500/10 text-red-500"
                                )}>
                                    {card.status}
                                </Badge>
                            </div>
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400">{card.title}</h3>
                            <p className="text-xs font-medium text-slate-400 dark:text-slate-600 mt-1">{card.detail}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Error Logs Stream */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl dark:shadow-2xl">
                <CardHeader className="bg-slate-50 dark:bg-slate-950/50 p-8 border-b border-slate-100 dark:border-white/5 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                            <Terminal size={20} />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900 dark:text-white">Aggregated Error Logs</CardTitle>
                            <p className="text-xs text-slate-500 font-medium">Real-time platform-wide exception monitoring.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Listening...</span>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="max-h-[500px] overflow-y-auto font-mono text-[11px]">
                        {logsLoading ? (
                            <div className="p-10 space-y-4 bg-white dark:bg-slate-950/20">
                                <Skeleton className="h-4 w-full bg-slate-50 dark:bg-slate-950" />
                                <Skeleton className="h-4 w-3/4 bg-slate-50 dark:bg-slate-950" />
                                <Skeleton className="h-4 w-full bg-slate-50 dark:bg-slate-950" />
                            </div>
                        ) : logs?.length === 0 ? (
                            <div className="p-10 text-center text-slate-400 dark:text-slate-600 italic border-dashed border-2 m-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent">
                                <Zap size={24} className="mx-auto mb-4 opacity-20" />
                                No platform errors detected in recent logs. Optimizing system performance.
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {logs.map((log: any) => (
                                    <div key={log.id} className="p-4 hover:bg-white/[0.02] transition-colors flex gap-4 bg-slate-950/20">
                                        <div className="mt-0.5">
                                            {log.action === 'ERROR' ? <ShieldAlert size={14} className="text-red-500" /> : <Activity size={14} className="text-blue-500" />}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className="text-indigo-600 dark:text-indigo-400 font-bold">[{log.entityType}]</span>
                                                <span className="text-slate-400 dark:text-slate-600 font-medium">{new Date(log.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className="text-slate-700 dark:text-slate-200">{log.details?.message || "Operational anomaly detected"}</p>
                                            {log.details?.stack && (
                                                <pre className="mt-2 p-3 bg-slate-50 dark:bg-black/40 rounded-lg text-slate-500 leading-relaxed overflow-x-auto border border-slate-200 dark:border-white/5">
                                                    {log.details.stack.substring(0, 300)}...
                                                </pre>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

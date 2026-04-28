"use client"

import { usePlatformStats, usePlatformGrowth } from "@/lib/api/hooks/usePlatformAnalytics"
import { 
    Users, 
    Building2, 
    CreditCard, 
    Activity, 
    TrendingUp, 
    ArrowUpRight, 
    ShieldAlert,
    Cpu,
    GraduationCap,
    BookUser,
    UserRound
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
    AreaChart,
    Area,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

export default function PlatformDashboard() {
    const { data: stats, isLoading: statsLoading } = usePlatformStats()
    const { data: growth, isLoading: growthLoading } = usePlatformGrowth()

    const metricCards = [
        { 
            title: "Global Schools", 
            value: stats?.totalSchools ?? 0, 
            icon: Building2, 
            color: "text-blue-400",
            bg: "bg-blue-500/5",
            sub: `${stats?.activeSchools ?? 0} active`,
            description: "Institutions on platform"
        },
        { 
            title: "Total Students", 
            value: stats?.totalStudents ?? 0, 
            icon: GraduationCap, 
            color: "text-emerald-400",
            bg: "bg-emerald-500/5",
            sub: null,
            description: "Cross-tenant student population"
        },
        { 
            title: "Total Teachers", 
            value: stats?.totalTeachers ?? 0, 
            icon: BookUser, 
            color: "text-violet-400",
            bg: "bg-violet-500/5",
            sub: null,
            description: "Registered teaching staff"
        },
        { 
            title: "Total Parents", 
            value: stats?.totalParents ?? 0, 
            icon: UserRound, 
            color: "text-pink-400",
            bg: "bg-pink-500/5",
            sub: null,
            description: "Parent accounts"
        },
        { 
            title: "Total Users", 
            value: stats?.totalUsers ?? 0, 
            icon: Users, 
            color: "text-amber-400",
            bg: "bg-amber-500/5",
            sub: null,
            description: "All registered users"
        },
        { 
            title: "Platform Revenue", 
            value: `₦${((stats?.totalRevenue ?? 0)).toLocaleString()}`, 
            icon: CreditCard, 
            color: "text-indigo-400",
            bg: "bg-indigo-500/5",
            sub: `₦${((stats?.mrr ?? 0)).toLocaleString()} MRR`,
            description: "Gross volume (All time)"
        },
        { 
            title: "System Health", 
            value: "99.98%", 
            icon: Activity, 
            color: "text-teal-400",
            bg: "bg-teal-500/5",
            sub: "Optimal",
            description: "Average uptime (30 days)"
        },
        { 
            title: "Currency", 
            value: stats?.currency ?? "NGN", 
            icon: CreditCard, 
            color: "text-orange-400",
            bg: "bg-orange-500/5",
            sub: null,
            description: "Primary settlement currency"
        },
    ]

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Main HQ Overview</h1>
                    <p className="text-slate-500 font-medium mt-1">Global ecosystem performance &amp; health monitoring.</p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Engine Feed</span>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {metricCards.map((card, i) => (
                    <Card key={i} className={`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden relative group shadow-sm ${card.bg}`}>
                        <div className="absolute top-0 right-0 p-6 opacity-[0.04] group-hover:scale-110 transition-transform duration-500">
                           <card.icon size={100} />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                {card.title}
                            </CardTitle>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                {statsLoading ? <Skeleton className="h-8 w-20 bg-slate-100 dark:bg-slate-800" /> : card.value}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                                {card.sub && (
                                    <span className={`text-[10px] font-bold ${card.color} flex items-center`}>
                                        {card.sub} <ArrowUpRight size={10} className="ml-0.5" />
                                    </span>
                                )}
                                <span className="text-[10px] text-slate-500 font-medium truncate">{card.description}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Growth Chart */}
                <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Ecosystem Growth</h3>
                            <p className="text-xs text-slate-500 font-medium">New school acquisitions vs platform revenue trend</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                                <span className="text-[10px] font-medium text-slate-400">Schools</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                <span className="text-[10px] font-medium text-slate-400">Revenue</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-[350px] w-full">
                        {growthLoading ? (
                            <Skeleton className="h-full w-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={growth || []}>
                                    <defs>
                                        <linearGradient id="colorSchools" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                                    <XAxis 
                                        dataKey="month" 
                                        stroke="currentColor" 
                                        className="text-slate-400 dark:text-slate-600"
                                        fontSize={10} 
                                        fontWeight="500"
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis 
                                        yAxisId="left"
                                        stroke="currentColor" 
                                        className="text-slate-400 dark:text-slate-600"
                                        fontSize={10} 
                                        fontWeight="500"
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis 
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="currentColor" 
                                        className="text-slate-400 dark:text-slate-600"
                                        fontSize={10} 
                                        fontWeight="500"
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'var(--tooltip-bg, #fff)', 
                                            border: '1px solid var(--tooltip-border, #e2e8f0)', 
                                            borderRadius: '12px' 
                                        }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                        formatter={(value: any, name: string) => {
                                            if (name === 'revenue') return [`₦${Number(value).toLocaleString()}`, 'Revenue'];
                                            if (name === 'totalSchools') return [value, 'New Schools'];
                                            return [value, name];
                                        }}
                                    />
                                    <Area yAxisId="left" type="monotone" dataKey="totalSchools" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSchools)" />
                                    <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                {/* Right Column Status */}
                <div className="space-y-6">
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-indigo-500/20 shadow-xl dark:shadow-2xl shadow-slate-200/50 dark:shadow-indigo-500/5 p-8 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none rotate-12">
                            <TrendingUp size={200} />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Platform <br/> Summary</h3>
                            <div className="space-y-3">
                                {statsLoading ? (
                                    <>
                                        <Skeleton className="h-5 w-full bg-slate-100 dark:bg-slate-800" />
                                        <Skeleton className="h-5 w-full bg-slate-100 dark:bg-slate-800" />
                                        <Skeleton className="h-5 w-full bg-slate-100 dark:bg-slate-800" />
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-500">Active Schools</span>
                                            <span className="text-xs font-black text-blue-400">{stats?.activeSchools ?? 0} / {stats?.totalSchools ?? 0}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-500 rounded-full transition-all duration-700"
                                                style={{ width: stats?.totalSchools ? `${Math.round(((stats?.activeSchools ?? 0) / stats.totalSchools) * 100)}%` : '0%' }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center pt-1">
                                            <span className="text-xs font-bold text-slate-500">Total MRR</span>
                                            <span className="text-xs font-black text-emerald-400">₦{((stats?.mrr ?? 0)).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-500">Total Revenue</span>
                                            <span className="text-xs font-black text-indigo-400">₦{((stats?.totalRevenue ?? 0)).toLocaleString()}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                <ShieldAlert size={16} className="text-amber-500" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">System Alerts</h4>
                        </div>
                        <div className="space-y-4">
                            {[
                                { title: "Payment Gateway Latency", detail: "Paystack webhook delays observed in West-1 node." },
                                { title: "Monitoring Active", detail: "All nodes are being monitored. No critical failures." }
                            ].map((alert, i) => (
                                <div key={i} className="flex gap-3 pb-4 border-b border-slate-100 dark:border-white/5 last:border-0 last:pb-0">
                                    <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{alert.title}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">{alert.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                    
                    <Card className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-6 border-dashed">
                         <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                             <Cpu size={16} />
                             <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Internal Node 01 Status</span>
                         </div>
                         <div className="mt-3 flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">All Systems Operational</span>
                         </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

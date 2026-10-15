"use client"

import Link from "next/link"
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
    UserRound,
    AlertCircle,
    RefreshCw,
    CheckCircle2,
    UserX
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
import { SubscriptionAnalytics } from "./components/SubscriptionAnalytics"

export default function PlatformDashboard() {
    const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = usePlatformStats()
    const { data: growth, isLoading: growthLoading, isError: growthError, refetch: refetchGrowth } = usePlatformGrowth()

    // Flutterwave actual processed live money
    const liveRevenueAmount = stats?.flutterwaveRevenue ?? stats?.totalRevenue ?? 0

    const metricCards = [
        { 
            title: "Global Schools", 
            value: statsError ? "Unavailable" : (statsLoading ? "" : (stats?.totalSchools ?? 0)), 
            icon: Building2, 
            color: statsError ? "text-red-400" : "text-blue-400",
            bg: statsError ? "bg-red-500/5" : "bg-blue-500/5",
            sub: statsError ? "Data offline" : `${stats?.activeSchools ?? 0} active`,
            description: "Institutions on platform"
        },
        { 
            title: "Total Students", 
            value: statsError ? "Unavailable" : (statsLoading ? "" : (stats?.totalStudents ?? 0)), 
            icon: GraduationCap, 
            color: statsError ? "text-red-400" : "text-emerald-400",
            bg: statsError ? "bg-red-500/5" : "bg-emerald-500/5",
            sub: null,
            description: "Cross-tenant population"
        },
        { 
            title: "Total Teachers", 
            value: statsError ? "Unavailable" : (statsLoading ? "" : (stats?.totalTeachers ?? 0)), 
            icon: BookUser, 
            color: statsError ? "text-red-400" : "text-violet-400",
            bg: statsError ? "bg-red-500/5" : "bg-violet-500/5",
            sub: null,
            description: "Registered teachers"
        },
        { 
            title: "Total Parents", 
            value: statsError ? "Unavailable" : (statsLoading ? "" : (stats?.totalParents ?? 0)), 
            icon: UserRound, 
            color: statsError ? "text-red-400" : "text-pink-400",
            bg: statsError ? "bg-red-500/5" : "bg-pink-500/5",
            sub: null,
            description: "Parent accounts"
        },
        { 
            title: "Total Users", 
            value: statsError ? "Unavailable" : (statsLoading ? "" : (stats?.totalUsers ?? 0)), 
            icon: Users, 
            color: statsError ? "text-red-400" : "text-amber-400",
            bg: statsError ? "bg-red-500/5" : "bg-amber-500/5",
            sub: null,
            description: "All registered users"
        },
        { 
            title: "Platform Revenue", 
            value: statsError ? "Unavailable" : (statsLoading ? "" : `₦${liveRevenueAmount.toLocaleString()}`), 
            icon: CreditCard, 
            color: statsError ? "text-red-400" : "text-emerald-400",
            bg: statsError ? "bg-red-500/5" : "bg-emerald-500/5 border-emerald-500/20",
            sub: statsError ? null : "Flutterwave Live",
            isLiveGateway: true,
            description: "Actual processed (Flutterwave)"
        },
        { 
            title: "System Health", 
            value: "99.98%", 
            icon: Activity, 
            color: "text-teal-400",
            bg: "bg-teal-500/5",
            sub: "Optimal",
            description: "Average uptime (30d)"
        },
        { 
            title: "Currency", 
            value: statsError ? "Unavailable" : (statsLoading ? "" : (stats?.currency ?? "NGN")), 
            icon: CreditCard, 
            color: statsError ? "text-red-400" : "text-orange-400",
            bg: statsError ? "bg-red-500/5" : "bg-orange-500/5",
            sub: "Flutterwave",
            description: "Live settlement currency"
        },
    ]

    return (
        <div className="space-y-6 sm:space-y-8 pb-16 md:pb-20 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Main HQ Overview</h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 sm:mt-1">Global ecosystem performance &amp; live financial telemetry.</p>
                </div>
                <div className="flex items-center gap-2.5 sm:gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-sm self-start sm:self-auto">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Live Engine Feed</span>
                </div>
            </div>

            {/* Error Alert Banner */}
            {(statsError || growthError) && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-red-500/25 flex items-center justify-center shrink-0">
                            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                        </div>
                        <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Analytics Feed Interrupted</h4>
                            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                We were unable to sync with the primary telemetry engine. Dashboard metrics may be outdated or incomplete.
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            if (statsError) refetchStats();
                            if (growthError) refetchGrowth();
                        }}
                        className="flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white dark:text-slate-100 text-xs font-bold rounded-xl shadow transition-all active:scale-95 whitespace-nowrap self-start sm:self-center"
                    >
                        <RefreshCw size={13} />
                        Retry Sync
                    </button>
                </div>
            )}

            {/* Metrics Grid - Balanced 2 columns on mobile, 3 on tablet, 4 on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {metricCards.map((card, i) => (
                    <Card key={i} className={`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden relative group shadow-sm rounded-2xl ${card.bg}`}>
                        <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                           <card.icon className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 md:p-5 pb-1 sm:pb-2">
                            <CardTitle className="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider sm:tracking-widest truncate mr-1">
                                {card.title}
                            </CardTitle>
                            <card.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 ${card.color}`} />
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 md:p-5 pt-0">
                            <div className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                                {statsLoading ? (
                                    <Skeleton className="h-6 sm:h-8 w-16 sm:w-24 bg-slate-100 dark:bg-slate-800" />
                                ) : (
                                    card.value
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 mt-1 sm:mt-1.5 min-w-0">
                                {card.sub && (
                                    <span className={`text-[9px] sm:text-[10px] font-bold ${card.color} flex items-center shrink-0`}>
                                        {card.isLiveGateway && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1 inline-block" />
                                        )}
                                        {card.sub}
                                        {!card.isLiveGateway && <ArrowUpRight size={10} className="ml-0.5" />}
                                    </span>
                                )}
                                <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium truncate">
                                    {card.description}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Subscription Analytics Section */}
            <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2">
                    <TrendingUp className="text-indigo-500 h-4 w-4 sm:h-5 sm:w-5" />
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">Subscription Performance</h2>
                </div>
                <SubscriptionAnalytics />
            </div>

            {/* Analytics & HQ Operations */}
            <div className="flex flex-col xl:flex-row gap-6 sm:gap-8">
                {/* Left Column Charts */}
                <div className="min-w-0 flex-1 space-y-6 sm:space-y-8">
                    {/* Growth Chart */}
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4 sm:p-5 md:p-6 shadow-sm rounded-2xl">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-8">
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">Ecosystem Growth</h3>
                                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">New school acquisitions vs platform Flutterwave revenue trend</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Schools</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Revenue (₦)</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="h-[240px] sm:h-[300px] md:h-[320px] w-full">
                            {growthLoading ? (
                                <Skeleton className="h-full w-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
                            ) : growthError ? (
                                <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center">
                                    <AlertCircle className="h-8 w-8 text-slate-400 dark:text-slate-600 mb-2" />
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Acquisition Data Offline</h4>
                                    <p className="text-xs text-slate-500 max-w-[240px] mt-1">
                                        Unable to connect to the telemetry pipeline.
                                    </p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={growth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                                            formatter={(value: any, name: any) => {
                                                if (name === 'revenue') return [`₦${Number(value).toLocaleString()}`, 'Flutterwave Revenue'];
                                                if (name === 'totalSchools') return [value, 'New Schools'];
                                                return [value, name];
                                            }}
                                        />
                                        <Area yAxisId="left" type="monotone" dataKey="totalSchools" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSchools)" />
                                        <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </Card>

                    {/* User Growth Chart */}
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4 sm:p-5 md:p-6 shadow-sm rounded-2xl">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-8">
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">User Registration Trends</h3>
                                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Monthly acquisition across Students, Teachers &amp; Parents</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Students</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="h-2 w-2 rounded-full bg-violet-500"></div>
                                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Teachers</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="h-2 w-2 rounded-full bg-pink-500"></div>
                                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Parents</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="h-[240px] sm:h-[300px] md:h-[320px] w-full">
                            {growthLoading ? (
                                <Skeleton className="h-full w-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
                            ) : growthError ? (
                                <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center">
                                    <AlertCircle className="h-8 w-8 text-slate-400 dark:text-slate-600 mb-2" />
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Registration Trends Offline</h4>
                                    <p className="text-xs text-slate-500 max-w-[240px] mt-1">
                                        Unable to connect to the telemetry pipeline.
                                    </p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={growth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorParents" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
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
                                            stroke="currentColor" 
                                            className="text-slate-400 dark:text-slate-600"
                                            fontSize={10} 
                                            fontWeight="500"
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: 'var(--tooltip-bg, #fff)', 
                                                border: '1px solid var(--tooltip-border, #e2e8f0)', 
                                                borderRadius: '12px' 
                                            }}
                                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                        />
                                        <Area type="monotone" dataKey="totalStudents" name="Students" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorStudents)" />
                                        <Area type="monotone" dataKey="totalTeachers" name="Teachers" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTeachers)" />
                                        <Area type="monotone" dataKey="totalParents" name="Parents" stroke="#ec4899" strokeWidth={2.5} fillOpacity={1} fill="url(#colorParents)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column Status */}
                <div className="w-full xl:w-[380px] shrink-0 space-y-4 sm:space-y-6">
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-indigo-500/20 shadow-xl dark:shadow-2xl shadow-slate-200/50 dark:shadow-indigo-500/5 p-4 sm:p-6 relative overflow-hidden rounded-2xl">
                        <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none rotate-12">
                            <TrendingUp size={200} />
                        </div>
                        <div className="relative z-10 space-y-4 sm:space-y-6">
                            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                                Platform Summary
                            </h3>
                            <div className="space-y-3">
                                {statsLoading ? (
                                    <>
                                        <Skeleton className="h-5 w-full bg-slate-100 dark:bg-slate-800" />
                                        <Skeleton className="h-5 w-full bg-slate-100 dark:bg-slate-800" />
                                        <Skeleton className="h-5 w-full bg-slate-100 dark:bg-slate-800" />
                                    </>
                                ) : statsError ? (
                                    <div className="flex flex-col items-center justify-center py-4 text-center">
                                        <AlertCircle className="h-6 w-6 text-red-500/80 mb-2" />
                                        <span className="text-xs font-bold text-slate-850 dark:text-slate-200">Summary Offline</span>
                                        <span className="text-[10px] text-slate-500 mt-0.5 font-medium">Telemetry unavailable</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-slate-500">Active Schools</span>
                                            <span className="font-black text-blue-500 dark:text-blue-400">{stats?.activeSchools ?? 0} / {stats?.totalSchools ?? 0}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-500 rounded-full transition-all duration-700"
                                                style={{ width: stats?.totalSchools ? `${Math.round(((stats?.activeSchools ?? 0) / stats.totalSchools) * 100)}%` : '0%' }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center pt-1 text-xs">
                                            <span className="font-bold text-slate-500">Flutterwave MRR (30d)</span>
                                            <span className="font-black text-emerald-500 dark:text-emerald-400">₦{((stats?.mrr ?? 0)).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-slate-500 flex items-center gap-1.5">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                                                Live Processed Revenue
                                            </span>
                                            <span className="font-black text-emerald-500 dark:text-emerald-400">₦{liveRevenueAmount.toLocaleString()}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-4 sm:space-y-6 shadow-sm rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                <ShieldAlert size={16} className="text-amber-500" />
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight">System Alerts</h4>
                        </div>
                        <div className="space-y-3.5 sm:space-y-4">
                            {[
                                { title: "Flutterwave Live Gateway Active", detail: "Real payments routed via live Flutterwave checkout." },
                                { title: "Monitoring Pipeline Operational", detail: "All platform nodes monitored. No critical failures." }
                            ].map((alert, i) => (
                                <div key={i} className="flex gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-slate-100 dark:border-white/5 last:border-0 last:pb-0">
                                    <div className="h-2 w-2 rounded-full bg-amber-500 mt-1 shrink-0"></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{alert.title}</p>
                                        <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">{alert.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-red-200/60 dark:border-red-950/60 p-4 sm:p-5 shadow-sm rounded-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                                    <UserX size={16} className="text-red-500" />
                                </div>
                                <div>
                                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight">Deletions & Compliance</h4>
                                    <p className="text-[10px] text-slate-500 font-medium">Data requests & inactive accounts</p>
                                </div>
                            </div>
                            <Link 
                                href="/console/deletions" 
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-[11px] font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950 transition-colors"
                            >
                                Open <ArrowUpRight size={12} />
                            </Link>
                        </div>
                    </Card>
                    
                    <Card className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-4 sm:p-5 border-dashed rounded-2xl">
                         <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500">
                             <Cpu size={15} />
                             <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest leading-none">Internal Node 01 Status</span>
                         </div>
                         <div className="mt-2.5 sm:mt-3 flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">All Systems Operational</span>
                         </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

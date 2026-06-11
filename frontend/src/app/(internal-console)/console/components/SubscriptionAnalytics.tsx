"use client"

import { useSubscriptionStats } from "@/lib/api/hooks/usePlatformAnalytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Legend
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell } from "recharts"

export function SubscriptionAnalytics() {
    const { data: subStats, isLoading, isError } = useSubscriptionStats()

    if (isLoading) {
        return <Skeleton className="h-[400px] w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
    }

    if (isError || !subStats || !subStats.distribution) {
        return (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center min-h-[300px] text-center shadow-sm">
                <AlertCircle className="h-10 w-10 text-slate-400 dark:text-slate-600 mb-3" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Subscription Analytics Unavailable</h3>
                <p className="text-sm text-slate-500 max-w-md mt-1.5">
                    We could not retrieve current subscription distribution metrics or trends at this time.
                </p>
            </Card>
        );
    }

    const distributionData = [
        { name: "Paid", value: subStats.distribution.paid?.count ?? 0, color: "#10b981" },
        { name: "Trial", value: subStats.distribution.trial?.count ?? 0, color: "#0ea5e9" },
        { name: "Expired", value: subStats.distribution.expired?.count ?? 0, color: "#ef4444" },
        { name: "Free", value: subStats.distribution.free?.count ?? 0, color: "#6366f1" },
        { name: "Cancelled", value: subStats.distribution.cancelled?.count ?? 0, color: "#f59e0b" },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Breakdown Pie/Percentage Card */}
            <Card className="lg:col-span-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Subscription Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-3">
                        {distributionData.map((stat, i) => (
                            <div key={i} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stat.color }}></div>
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{stat.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">{stat.value}</span>
                                    <span className="text-[10px] font-medium text-slate-400">
                                        {((stat.value / (distributionData.reduce((acc, curr) => acc + curr.value, 0) || 1)) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Historical Line Chart */}
            <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm p-5">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Subscription Trends</h3>
                        <p className="text-xs text-slate-500 font-medium">Historical conversion and churn over 6 months</p>
                    </div>
                </div>
                
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={subStats?.history || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="month" 
                                fontSize={10} 
                                fontWeight="600" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8' }}
                            />
                            <YAxis 
                                fontSize={10} 
                                fontWeight="600" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8' }}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend iconType="circle" />
                            <Line 
                                type="monotone" 
                                dataKey="paid" 
                                name="Paid" 
                                stroke="#10b981" 
                                strokeWidth={3} 
                                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6 }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="trial" 
                                name="Trial" 
                                stroke="#0ea5e9" 
                                strokeWidth={3} 
                                dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6 }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="expired" 
                                name="Expired" 
                                stroke="#ef4444" 
                                strokeWidth={3} 
                                dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6 }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="free" 
                                name="Free" 
                                stroke="#6366f1" 
                                strokeWidth={3} 
                                dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    )
}

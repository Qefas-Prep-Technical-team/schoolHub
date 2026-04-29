"use client"

import { useState } from "react"
import { usePlatformPlans, useUpdatePlatformPlan as useUpdatePlan, useAssignSchoolPlan } from "@/lib/api/hooks/usePlatformBilling"
import { 
    CreditCard, 
    Zap, 
    ShieldCheck, 
    History, 
    MoreHorizontal,
    Plus,
    Save,
    Settings2,
    Users
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

export default function PlatformBillingPage() {
    const { data: plans, isLoading } = usePlatformPlans()
    const updatePlan = useUpdatePlan()
    const [editingPlan, setEditingPlan] = useState<any>(null)

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Monetization Control</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage global subscription plans and tier limits. <span className="text-indigo-500 selection:bg-indigo-500/20">Check the Dynamic Pricing Manager for global sync.</span></p>
                </div>
                <Button 
                    onClick={() => window.location.href = '/console/billing/pricing'}
                    className="bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 rounded-xl gap-2 font-bold px-6"
                >
                    <Plus size={18} /> Dynamic Pricing Manager
                </Button>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-64 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem]" />
                    ))
                ) : (
                    plans?.map((plan: any) => (
                        <Card key={plan.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden relative group border-2 border-transparent hover:border-indigo-500/30 transition-all shadow-xl dark:shadow-2xl">
                            <CardHeader className="bg-slate-50 dark:bg-slate-950 p-6 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <Badge className="bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-none px-2 py-0 text-[9px] font-black uppercase tracking-widest">
                                            Tier Layer
                                        </Badge>
                                        <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">{plan.name}</CardTitle>
                                    </div>
                                    <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer shadow-sm" onClick={() => setEditingPlan(plan)}>
                                        <Settings2 size={18} />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Stud. Limit</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{plan.maxStudents === 0 ? "Unlimited" : plan.maxStudents}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Subscribed</p>
                                        <p className="text-sm font-bold text-indigo-400">{plan._count?.schools || 0} Schools</p>
                                    </div>
                                </div>
                                <div className="h-[1px] bg-slate-100 dark:bg-white/5" />
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                                        <span>Exams Power</span>
                                        <span className="text-slate-800 dark:text-slate-200">{plan.maxExams}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                                        <span>Storage Node</span>
                                        <span className="text-slate-800 dark:text-slate-200">{plan.maxStorageGb}GB</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Plan Customizer (Manual Form) */}
                <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl dark:shadow-2xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-600/20">
                            <Zap size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Plan Configuration</h3>
                            <p className="text-sm text-slate-500 font-medium">Override tier constraints for {editingPlan?.name || "selected plan"}.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Display name</label>
                                <Input 
                                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl h-12 text-slate-900 dark:text-white font-bold"
                                    value={editingPlan?.name || ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Student Capacity</label>
                                <Input 
                                    type="number"
                                    className="bg-slate-950 border-slate-800 rounded-xl h-12 text-white font-bold"
                                    value={editingPlan?.maxStudents || 0}
                                />
                            </div>
                         </div>
                         <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Exam Limit</label>
                                <Input 
                                    type="number"
                                    className="bg-slate-950 border-slate-800 rounded-xl h-12 text-white font-bold"
                                    value={editingPlan?.maxExams || 0}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Storage (GB)</label>
                                <Input 
                                    type="number"
                                    className="bg-slate-950 border-slate-800 rounded-xl h-12 text-white font-bold"
                                    value={editingPlan?.maxStorageGb || 0}
                                />
                            </div>
                         </div>
                    </div>

                    <div className="mt-10 flex justify-end gap-3 pt-8 border-t border-slate-100 dark:border-white/5">
                        <Button variant="ghost" className="text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl h-12 px-8 font-bold">Discard</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-500 rounded-xl h-12 px-10 font-bold shadow-xl shadow-indigo-600/20 gap-2">
                            <Save size={18} /> Update Tier
                        </Button>
                    </div>
                </Card>

                {/* Manual Override Side Panel */}
                <div className="space-y-6">
                    <Card className="bg-indigo-600 border-none shadow-2xl shadow-indigo-600/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                            <ShieldCheck size={240} />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-2xl font-black text-white tracking-tighter leading-none">Manual <br/> Assignment</h3>
                            <p className="text-sm font-medium text-indigo-100 opacity-80 leading-relaxed">
                                Manually grant premium access or override subscription status for specific tenants.
                            </p>
                            <Button className="w-full h-14 bg-white text-indigo-700 font-black uppercase tracking-widest text-[11px] hover:bg-indigo-50 transition-all rounded-2xl shadow-xl shadow-black/10 mt-4">
                                Launch Override Hub
                            </Button>
                        </div>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] space-y-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <History size={20} className="text-slate-400" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Recent Modifications</h4>
                        </div>
                        <div className="space-y-4">
                            {[1].map((i) => (
                                <div key={i} className="flex gap-4 pb-4 border-b border-slate-100 dark:border-white/5 last:border-0 last:pb-0">
                                    <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center">
                                        <Users size={14} className="text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">PRO Plan Updated</p>
                                        <p className="text-[10px] text-slate-500 font-medium">Increased storage to 100GB by Owner</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

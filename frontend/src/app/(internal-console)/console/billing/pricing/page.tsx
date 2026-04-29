"use client"

import { useState } from "react"
import { 
    usePlatformPricingPlans, 
    useSavePricingPlan, 
    useSeedPricingPlans
} from "@/lib/api/hooks/usePricingManagement"
import { PRICING_PLANS } from "@/lib/constants/plansData"
import { 
    Tag, 
    Plus, 
    Database, 
    RefreshCcw, 
    Sparkles, 
    Layout, 
    Monitor, 
    Users, 
    UserCheck, 
    HardDrive,
    Save,
    X,
    ChevronRight,
    Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import PricingPlanEditorModal from "./components/PricingPlanEditorModal"

export default function PricingManagerPage() {
    const { data: categories, isLoading } = usePlatformPricingPlans()
    const seedPlans = useSeedPricingPlans()
    const [selectedCategory, setSelectedCategory] = useState("schools")
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
    const [isEditing, setIsEditing] = useState<any>(null)

    const filteredCategory = categories?.find((c: any) => c.category === selectedCategory)

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Revenue Architecture</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage global subscription plans, quotas, and premium pricing.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        onClick={() => seedPlans.mutate({ plans: PRICING_PLANS })}
                        disabled={seedPlans.isPending}
                        className="rounded-xl font-bold border-slate-200 dark:border-slate-800 gap-2"
                    >
                        <Database size={16} /> Sync Defaults
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-6 font-bold shadow-xl shadow-indigo-600/20 gap-2">
                        <Plus size={18} /> Create New Plan
                    </Button>
                </div>
            </div>

            {/* Navigation & Billing Cycle Control */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Category Navigation */}
                <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl w-fit">
                    {["schools", "teachers", "parents", "students"].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                                "px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all",
                                selectedCategory === cat 
                                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Billing Cycle Switch */}
                <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl w-fit">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={cn(
                            "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            billingCycle === 'monthly' 
                            ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                            : "text-slate-500"
                        )}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={cn(
                            "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                            billingCycle === 'yearly' 
                            ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                            : "text-slate-500"
                        )}
                    >
                        Yearly
                        {billingCycle === 'yearly' && <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] px-1.5 h-4">-20%</Badge>}
                    </button>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-80 rounded-[2.5rem] bg-slate-100 dark:bg-slate-900/50 animate-pulse border border-slate-200 dark:border-slate-800" />
                    ))
                ) : !filteredCategory || filteredCategory.tabs.length === 0 ? (
                    <Card className="col-span-full py-24 text-center bg-white dark:bg-slate-900 border-dashed border-2 border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-sm">
                        <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
                            <div className="h-20 w-20 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 rotate-12">
                                <RefreshCcw size={40} className="animate-spin-slow" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Sync Required</h3>
                                <p className="text-slate-500 font-medium mt-2 leading-relaxed">
                                    The database for <strong>{selectedCategory}</strong> is currently empty. Sync now to import the default plans from the system core.
                                </p>
                            </div>
                            <Button 
                                onClick={() => seedPlans.mutate({ plans: PRICING_PLANS })} 
                                disabled={seedPlans.isPending}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl px-10 py-7 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-600/30 gap-3 group transition-all"
                            >
                                {seedPlans.isPending ? <RefreshCcw className="animate-spin" size={18} /> : <Database size={18} className="group-hover:scale-110 transition-transform" />}
                                Sync Defaults Database
                            </Button>
                        </div>
                    </Card>
                ) : (
                    filteredCategory.tabs.map((plan: any) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group relative"
                        >
                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
                                <CardHeader className="p-8 pb-0">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center border",
                                            plan.type === 'free' ? "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-white/5" : "bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/20"
                                        )}>
                                            <Tag size={20} className={plan.type === 'free' ? "text-slate-500" : "text-white"} />
                                        </div>
                                        {plan.isPopular && (
                                            <Badge className="bg-amber-500/10 text-amber-500 border-none rounded-lg font-black text-[9px] uppercase tracking-widest px-3 py-1">Popular</Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-2xl font-black text-slate-900 dark:text-white mb-2">{plan.name}</CardTitle>
                                    <p className="text-slate-500 text-sm font-medium line-clamp-2 h-10">{plan.description}</p>
                                </CardHeader>
                                <CardContent className="p-8 pt-6">
                                    <div className="flex items-baseline gap-1 mb-8">
                                        <span className="text-4xl font-black text-slate-900 dark:text-white">₦{plan.pricing[billingCycle].toLocaleString()}</span>
                                        <span className="text-slate-500 font-bold text-sm">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                                            <div className="flex items-center gap-3">
                                                <Users size={14} className="text-slate-400" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enrolment Limit</span>
                                            </div>
                                            <span className="text-xs font-black text-slate-900 dark:text-white">{plan.maxStudents || "Unlimited"}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5">
                                            <div className="flex items-center gap-3">
                                                <HardDrive size={14} className="text-slate-400" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Storage Allocation</span>
                                            </div>
                                            <span className="text-xs font-black text-slate-900 dark:text-white">{plan.storage || "1GB"}</span>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <ul className="space-y-3">
                                            {plan.features?.map((feature: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                                                    <UserCheck size={16} className="text-indigo-500 shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Button 
                                        onClick={() => setIsEditing({ ...plan, category: selectedCategory })}
                                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl py-6 font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-transform"
                                    >
                                        Modify Parameters
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Quick Stats Panel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Active Subscriptions", value: "1,284", icon: UserCheck, color: "text-emerald-500" },
                    { label: "Revenue Target", value: "₦12.4M", icon: RefreshCcw, color: "text-blue-500" },
                    { label: "Upgrade Rate", value: "34.2%", icon: Sparkles, color: "text-indigo-500" },
                    { label: "API Health", value: "99.9%", icon: Layout, color: "text-purple-500" }
                ].map((stat, i) => (
                    <Card key={i} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm shadow-slate-200/50">
                        <div className="flex items-center gap-4">
                            <div className={cn("h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center", stat.color)}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Bottom Sync Control & Defaults Preview */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                        <Database size={20} className="text-indigo-500" /> Default Pricing
                    </h2>
                    <Badge variant="outline" className="rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400">plansData.ts</Badge>
                </div>
                
                <Card className="p-8 bg-slate-900 dark:bg-slate-950 rounded-[3rem] border-none shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Database size={240} />
                    </div>
                    
                    <div className="relative z-10 space-y-10">
                        {/* Inline Controls for Default Pricing Preview */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
                            <div className="flex flex-wrap items-center gap-2">
                                {["schools", "teachers", "parents", "students"].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={cn(
                                            "px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all",
                                            selectedCategory === cat 
                                            ? "bg-indigo-600 text-white shadow-sm" 
                                            : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                                        )}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-xl w-fit">
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                        billingCycle === 'monthly' ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setBillingCycle('yearly')}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                        billingCycle === 'yearly' ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    Yearly
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {PRICING_PLANS.find((c: any) => c.category === selectedCategory)?.tabs.map((plan: any, i: number) => (
                                <Card key={i} className="bg-slate-800 dark:bg-slate-900 border-slate-700 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-slate-600 flex flex-col h-full">
                                    <div className="p-5 pb-3 border-b border-white/5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className={cn(
                                                "h-10 w-10 rounded-2xl flex items-center justify-center border",
                                                plan.type === 'free' ? "bg-slate-700 border-slate-600" : "bg-indigo-600 border-indigo-500 shadow-md shadow-indigo-600/20"
                                            )}>
                                                <Tag size={16} className={plan.type === 'free' ? "text-slate-300" : "text-white"} />
                                            </div>
                                            {plan.isPopular && (
                                                <Badge className="bg-emerald-500/10 text-emerald-400 border-none rounded-lg font-black text-[9px] uppercase tracking-widest px-2 py-0.5">Popular</Badge>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{plan.type}</p>
                                        <p className="text-lg font-black text-white leading-tight">{plan.name}</p>
                                    </div>
                                    <div className="p-5 flex-1">
                                        <ul className="space-y-3">
                                            {plan.features?.map((feature: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-300">
                                                    <UserCheck size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="p-5 pt-4 border-t border-white/5 mt-auto bg-slate-800/50">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-white">₦{plan.pricing[billingCycle].toLocaleString()}</span>
                                            <span className="text-slate-400 font-bold text-[10px] uppercase">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-white/10">
                            <div className="max-w-xl">
                                <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-2">Synchronize Defaults to Cloud</h3>
                                <p className="text-slate-400 font-medium text-sm">
                                    Overwrite or initialize your database with the default plans shown above. This allows you to manage custom pricing via the UI.
                                </p>
                            </div>
                            <Button 
                                onClick={() => seedPlans.mutate({ plans: PRICING_PLANS })}
                                disabled={seedPlans.isPending}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl px-12 py-8 font-black uppercase tracking-widest text-[11px] gap-3 h-16 shadow-2xl shadow-indigo-600/40"
                            >
                                {seedPlans.isPending ? <RefreshCcw className="animate-spin" size={20} /> : <RefreshCcw size={20} />}
                                Sync Plans
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            <PricingPlanEditorModal 
                plan={isEditing} 
                isOpen={!!isEditing} 
                onClose={() => setIsEditing(null)} 
            />
        </div>
    )
}

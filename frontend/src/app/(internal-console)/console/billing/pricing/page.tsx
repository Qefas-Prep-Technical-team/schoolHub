"use client"

import { useState } from "react"
import { 
    usePlatformPricingPlans,
    useSavePricingPlan, 
    useSeedPricingPlans,
    usePlatformFeatures,
    usePlatformBillingStats
} from "@/lib/api/hooks/usePricingManagement"
import { usePlatformSettings, useUpdatePlatformSettings } from "@/lib/api/hooks/usePlatformGovernance"

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
    Search,
    Shield
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
    const { data: stats } = usePlatformBillingStats()
    const { data: settings } = usePlatformSettings()
    const updateSettings = useUpdatePlatformSettings()
    const seedPlans = useSeedPricingPlans()
    const [selectedCategory, setSelectedCategory] = useState("schools")
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
    const [isEditing, setIsEditing] = useState<Record<string, any> | null>(null)

    const isEnforced = settings?.[`sub_enforced_${selectedCategory}`] !== "false"

    const filteredCategory = categories?.find((c: Record<string, any>) => c.category === selectedCategory)

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
                        onClick={() => seedPlans.mutate()}
                        disabled={seedPlans.isPending}
                        className="rounded-xl font-bold border-slate-200 dark:border-slate-800 gap-2"
                    >
                        <RefreshCcw size={16} className={seedPlans.isPending ? "animate-spin" : ""} /> 
                        Sync Platform Defaults
                    </Button>
                    <Button 
                        variant={isEnforced ? "outline" : "default"}
                        onClick={() => updateSettings.mutate({ 
                            key: `sub_enforced_${selectedCategory}`, 
                            value: isEnforced ? "false" : "true" 
                        })}
                        disabled={updateSettings.isPending}
                        className={cn(
                            "rounded-xl font-bold gap-2 transition-all",
                            !isEnforced ? "bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20" : "border-slate-200 dark:border-slate-800"
                        )}
                    >
                        <Shield size={16} className={cn(!isEnforced && "animate-pulse")} /> 
                        {isEnforced ? `Enforcement Active: ${selectedCategory}` : `Enforcement Disabled: ${selectedCategory}`}
                    </Button>
                    <Button 
                        onClick={() => setIsEditing({ 
                            name: "New Plan", 
                            category: selectedCategory, 
                            type: "PAID", 
                            features: [], 
                            featureAccess: [],
                            pricing: { monthly: 0, yearly: 0 }
                        })}
                        className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-6 font-bold shadow-xl shadow-indigo-600/20 gap-2"
                    >
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
                                <Database size={40} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Empty Registry</h3>
                                <p className="text-slate-500 font-medium mt-2 leading-relaxed">
                                    No pricing plans found for <strong>{selectedCategory}</strong> in the database.
                                </p>
                            </div>
                            <Button 
                                onClick={() => seedPlans.mutate()} 
                                disabled={seedPlans.isPending}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl px-10 py-7 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-600/30 gap-3 group transition-all"
                            >
                                {seedPlans.isPending ? <RefreshCcw className="animate-spin" size={18} /> : <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />}
                                Sync Plans from Manifest
                            </Button>
                        </div>
                    </Card>
                ) : (
                    filteredCategory.tabs.map((plan: Record<string, any>) => (
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
                                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Linked Entitlements</div>
                                        <ul className="space-y-3">
                                            {/* Relational Features (Entitlements) */}
                                            {plan.featureAccess?.filter((fa: Record<string, any>) => fa.enabled).map((fa: Record<string, any>, idx: number) => (
                                                <li key={`relational-${idx}`} className="flex items-start gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    <Shield size={16} className="text-indigo-500 shrink-0" />
                                                    <div className="flex flex-col">
                                                        <span>{fa.name}</span>
                                                        <span className="text-[8px] font-mono text-slate-400">{fa.tag}</span>
                                                    </div>
                                                </li>
                                            ))}
                                            {/* Marketing Labels */}
                                            {plan.features?.map((label: string, idx: number) => (
                                                <li key={`mktg-${idx}`} className="flex items-start gap-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                    <Sparkles size={16} className="shrink-0" />
                                                    <span>{label}</span>
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
                    { label: "Active Subscriptions", value: stats?.activeSubscriptions?.toLocaleString() || "0", icon: UserCheck, color: "text-emerald-500" },
                    { label: "Monthly Revenue", value: `₦${(stats?.totalRevenue || 0).toLocaleString()}`, icon: RefreshCcw, color: "text-blue-500" },
                    { label: "Upgrade Rate", value: `${stats?.upgradeRate || "0.0"}%`, icon: Sparkles, color: "text-indigo-500" },
                    { label: "API Health", value: `${stats?.apiHealth || "0.0"}%`, icon: Layout, color: "text-purple-500" }
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

            <PricingPlanEditorModal 
                plan={isEditing} 
                isOpen={!!isEditing} 
                onClose={() => setIsEditing(null)} 
            />

            {/* System Synchronization Console */}
            <div className="pt-10 border-t border-slate-100 dark:border-white/5">
                <Card className="bg-slate-900 dark:bg-slate-950 rounded-[3rem] border-none shadow-2xl overflow-hidden relative p-12">
                    <div className="absolute top-0 right-0 p-12 opacity-5">
                        <Database size={200} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="max-w-2xl text-center md:text-left">
                            <h2 className="text-3xl font-black text-white tracking-tight mb-4 flex items-center justify-center md:justify-start gap-3">
                                <RefreshCcw size={32} className="text-indigo-500" />
                                Revenue <span className="text-indigo-500">Synchronization</span>
                            </h2>
                            <p className="text-slate-400 font-medium text-lg leading-relaxed">
                                Align your local pricing database with the system manifest. This will ensure all relational entitlements and default pricing parameters are correctly initialized.
                            </p>
                        </div>
                        <Button 
                            onClick={() => seedPlans.mutate()}
                            disabled={seedPlans.isPending}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] px-16 py-10 font-black uppercase tracking-widest text-xs gap-4 h-24 shadow-2xl shadow-indigo-600/40 group"
                        >
                            {seedPlans.isPending ? <RefreshCcw className="animate-spin" size={24} /> : <Database size={24} className="group-hover:scale-110 transition-transform" />}
                            {seedPlans.isPending ? "Synchronizing..." : "Sync System Defaults"}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}

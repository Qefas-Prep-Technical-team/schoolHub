"use client"

import { useState, useMemo } from "react"
import {
    usePlatformPricingPlans,
    useSeedPricingPlans,
    usePlatformBillingStats
} from "@/lib/api/hooks/usePricingManagement"
import { usePlatformSettings, useUpdatePlatformSettings } from "@/lib/api/hooks/usePlatformGovernance"

import {
    Plus,
    Database,
    RefreshCcw,
    Sparkles,
    Layout,
    Users,
    GraduationCap,
    School,
    BookOpen,
    UserCheck,
    Search,
    Shield,
    ShieldCheck,
    ShieldAlert,
    TrendingUp,
    Layers,
    Filter,
    ArrowUpRight,
    CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import PricingPlanEditorModal from "./components/PricingPlanEditorModal"
import PricingPlanCard, { SubscriptionPlanData } from "./components/PricingPlanCard"

const CATEGORIES = [
    { id: "schools", label: "Schools & Academies", icon: School, desc: "Institution-wide campus subscriptions" },
    { id: "teachers", label: "Teachers & Staff", icon: GraduationCap, desc: "Educator tools, gradebooks, marksheet access" },
    { id: "parents", label: "Parents & Guardians", icon: Users, desc: "Multi-child progress, reports & real-time monitoring" },
    { id: "students", label: "Students", icon: BookOpen, desc: "Self-study portal, transcript tracking & exam prep" }
] as const

export default function PricingManagerPage() {
    const { data: rawCategories, isLoading, refetch } = usePlatformPricingPlans()
    const { data: stats } = usePlatformBillingStats()
    const { data: settings } = usePlatformSettings()
    const updateSettings = useUpdatePlatformSettings()
    const seedPlans = useSeedPricingPlans()

    const [selectedCategory, setSelectedCategory] = useState<string>("schools")
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
    const [searchQuery, setSearchQuery] = useState("")
    const [filterType, setFilterType] = useState<'ALL' | 'PAID' | 'FREE'>('ALL')
    const [isEditing, setIsEditing] = useState<Record<string, unknown> | null>(null)

    const isEnforced = settings?.[`sub_enforced_${selectedCategory}`] !== "false"

    // Safe lookup comparing case-insensitively
    const activeCategoryData = useMemo(() => {
        if (!Array.isArray(rawCategories)) return null
        return rawCategories.find((c: { category?: string }) =>
            c.category?.toLowerCase() === selectedCategory.toLowerCase()
        )
    }, [rawCategories, selectedCategory])

    // Filter plans based on search & filterType
    const displayedPlans = useMemo(() => {
        if (!activeCategoryData?.tabs || !Array.isArray(activeCategoryData.tabs)) return []
        return activeCategoryData.tabs.filter((plan: SubscriptionPlanData) => {
            const matchesSearch = searchQuery.trim() === "" ||
                plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (plan.description && plan.description.toLowerCase().includes(searchQuery.toLowerCase()))

            const isFree = plan.type?.toLowerCase() === 'free' ||
                (plan.pricing?.monthly === 0 && plan.pricing?.yearly === 0)

            const matchesType = filterType === 'ALL'
                ? true
                : filterType === 'FREE'
                    ? isFree
                    : !isFree

            return matchesSearch && matchesType
        })
    }, [activeCategoryData, searchQuery, filterType])

    // Get count per category for badges
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        if (Array.isArray(rawCategories)) {
            rawCategories.forEach((cat: { category?: string; tabs?: unknown[] }) => {
                if (cat.category) {
                    counts[cat.category.toLowerCase()] = Array.isArray(cat.tabs) ? cat.tabs.length : 0
                }
            })
        }
        return counts
    }, [rawCategories])

    const handleCreateNewPlan = () => {
        setIsEditing({
            name: "New Plan",
            category: selectedCategory,
            type: "PAID",
            features: [],
            featureAccess: [],
            pricing: { monthly: 0, yearly: 0 },
            monthlyPrice: 0,
            yearlyPrice: 0,
            maxStudents: 50,
            maxStorageGb: 5,
            maxTeachers: 5,
            maxClasses: 5,
            isPopular: false
        })
    }

    return (
        <div className="space-y-10 pb-24 max-w-7xl mx-auto">
            {/* Top Bar: Title & Primary Management Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-slate-900/80 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-xl">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <Layers size={14} /> Revenue & Monetization Engine
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Pricing & Subscription Tiers
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1 max-w-2xl">
                        Design and manage global billing structures, role-based paywalls, user quotas, and entitlement matrices across the institution.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Synchronize System Defaults */}
                    <Button
                        variant="outline"
                        onClick={() => seedPlans.mutate()}
                        disabled={seedPlans.isPending}
                        className="rounded-2xl font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 gap-2 h-11 px-4 text-xs"
                        title="Sync local plans with system manifest defaults"
                    >
                        <RefreshCcw size={15} className={cn(seedPlans.isPending && "animate-spin text-indigo-600")} />
                        {seedPlans.isPending ? "Syncing Defaults..." : "Sync Defaults"}
                    </Button>

                    {/* Category Paywall Enforce Toggle */}
                    <Button
                        variant="outline"
                        onClick={() => updateSettings.mutate({
                            key: `sub_enforced_${selectedCategory}`,
                            value: isEnforced ? "false" : "true"
                        })}
                        disabled={updateSettings.isPending}
                        className={cn(
                            "rounded-2xl font-bold gap-2 transition-all h-11 px-4 text-xs border",
                            isEnforced
                                ? "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                                : "border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
                        )}
                        title="Toggle strict subscription paywall enforcement for this category"
                    >
                        {isEnforced ? (
                            <>
                                <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                                <span>Enforced: <strong className="capitalize">{selectedCategory}</strong></span>
                            </>
                        ) : (
                            <>
                                <ShieldAlert size={16} className="text-amber-600 dark:text-amber-400 animate-pulse" />
                                <span>Permissive (Unenforced)</span>
                            </>
                        )}
                    </Button>

                    {/* Create New Plan */}
                    <Button
                        onClick={handleCreateNewPlan}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl px-5 h-11 font-bold shadow-lg shadow-indigo-600/20 gap-2 text-xs transition-all"
                    >
                        <Plus size={16} /> Create Plan
                    </Button>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    {
                        label: "Active Subscriptions",
                        value: stats?.activeSubscriptions?.toLocaleString() || "0",
                        subtext: "Across all live portals",
                        icon: UserCheck,
                        color: "text-emerald-600 dark:text-emerald-400",
                        bg: "bg-emerald-50 dark:bg-emerald-950/40"
                    },
                    {
                        label: "Monthly Run Rate",
                        value: `₦${(stats?.totalRevenue || 0).toLocaleString()}`,
                        subtext: "Platform gross MRR",
                        icon: TrendingUp,
                        color: "text-blue-600 dark:text-blue-400",
                        bg: "bg-blue-50 dark:bg-blue-950/40"
                    },
                    {
                        label: "Upgrade Rate",
                        value: `${stats?.upgradeRate || "0.0"}%`,
                        subtext: "Free-to-paid conversion",
                        icon: Sparkles,
                        color: "text-indigo-600 dark:text-indigo-400",
                        bg: "bg-indigo-50 dark:bg-indigo-950/40"
                    },
                    {
                        label: "Provisioning Health",
                        value: `${stats?.apiHealth || "100"}%`,
                        subtext: "Entitlement gateway status",
                        icon: Layout,
                        color: "text-purple-600 dark:text-purple-400",
                        bg: "bg-purple-50 dark:bg-purple-950/40"
                    }
                ].map((stat, i) => (
                    <Card key={i} className="bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
                                <stat.icon size={20} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">{stat.label}</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white truncate">{stat.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Category Selector Tabs */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-black text-slate-900 dark:text-white">
                            Select Stakeholder Audience
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                            Choose which portal and role these subscription tiers target.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory.toLowerCase() === cat.id
                        const count = categoryCounts[cat.id] ?? 0
                        const Icon = cat.icon

                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={cn(
                                    "flex items-start gap-4 p-4 rounded-2xl border text-left transition-all duration-200 relative group",
                                    isSelected
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20"
                                        : "bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                                )}
                            >
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                                    isSelected
                                        ? "bg-white/20 text-white"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 group-hover:text-indigo-600"
                                )}>
                                    <Icon size={20} />
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-black truncate">{cat.label}</h3>
                                    </div>
                                    <p className={cn(
                                        "text-xs mt-0.5 line-clamp-1",
                                        isSelected ? "text-indigo-100" : "text-slate-500 dark:text-slate-400"
                                    )}>
                                        {cat.desc}
                                    </p>
                                </div>
                                <span className={cn(
                                    "absolute top-4 right-4 text-[10px] font-black px-2 py-0.5 rounded-full",
                                    isSelected
                                        ? "bg-white/20 text-white"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                )}>
                                    {count} {count === 1 ? 'plan' : 'plans'}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Filter, Search & Billing Cycle Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                {/* Search & Plan Filter */}
                <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Search ${selectedCategory} plans...`}
                            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white font-medium"
                        />
                    </div>

                    <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                        {(['ALL', 'PAID', 'FREE'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={cn(
                                    "px-3 py-1 rounded-lg text-[10px] font-black tracking-wide transition-all",
                                    filterType === type
                                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Billing Cycle Toggle */}
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
                        Preview Pricing:
                    </span>
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                                billingCycle === 'monthly'
                                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2",
                                billingCycle === 'yearly'
                                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            <span>Yearly</span>
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9px] px-1.5 py-0 h-4 font-black">
                                SAVE UP TO 20%
                            </Badge>
                        </button>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-900/60 animate-pulse border border-slate-200 dark:border-slate-800"
                            />
                        ))}
                    </div>
                ) : displayedPlans.length === 0 ? (
                    <Card className="py-20 text-center bg-white dark:bg-slate-900/60 border-dashed border-2 border-slate-200 dark:border-slate-800 rounded-3xl">
                        <div className="flex flex-col items-center gap-5 max-w-md mx-auto px-6">
                            <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Database size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {searchQuery ? "No Matching Plans Found" : "No Plans Configured Yet"}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1.5 leading-relaxed">
                                    {searchQuery
                                        ? `No plans matched "${searchQuery}". Clear your search or reset filters.`
                                        : `The registry has no pricing tiers saved under "${selectedCategory}". Click below to synchronize platform defaults or add your first tier.`
                                    }
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {searchQuery ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => setSearchQuery("")}
                                        className="rounded-xl font-bold text-xs"
                                    >
                                        Clear Search
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            onClick={() => seedPlans.mutate()}
                                            disabled={seedPlans.isPending}
                                            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 text-xs font-bold gap-2"
                                        >
                                            <RefreshCcw size={14} className={cn(seedPlans.isPending && "animate-spin")} />
                                            {seedPlans.isPending ? "Syncing..." : "Sync Manifest Defaults"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleCreateNewPlan}
                                            className="rounded-xl font-bold text-xs gap-1.5"
                                        >
                                            <Plus size={14} /> Create Tier
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedPlans.map((plan: SubscriptionPlanData) => (
                            <PricingPlanCard
                                key={plan.id || plan.name}
                                plan={plan}
                                billingCycle={billingCycle}
                                onEdit={(p) => setIsEditing({ ...p, category: selectedCategory })}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Manifest Defaults Sync Banner */}
            <div className="pt-6">
                <Card className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border-none shadow-xl overflow-hidden p-8 text-white relative">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div className="max-w-xl">
                            <span className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 mb-2">
                                <Database size={14} /> Master Manifest Sync
                            </span>
                            <h2 className="text-2xl font-black tracking-tight text-white">
                                Reset & Calibrate Pricing Manifest
                            </h2>
                            <p className="text-slate-300 text-xs font-medium mt-1 leading-relaxed">
                                Need to restore recommended tiers, quotas, and feature flags? Synchronizing reads from the system code repository and injects the baseline pricing matrix without deleting custom school accounts.
                            </p>
                        </div>
                        <Button
                            onClick={() => seedPlans.mutate()}
                            disabled={seedPlans.isPending}
                            className="bg-white hover:bg-slate-100 text-slate-950 rounded-2xl px-6 h-12 font-black uppercase tracking-wider text-xs gap-2 shrink-0 shadow-lg hover:scale-105 transition-all"
                        >
                            <RefreshCcw size={16} className={cn(seedPlans.isPending && "animate-spin text-indigo-600")} />
                            {seedPlans.isPending ? "Synchronizing Manifest..." : "Synchronize System Manifest"}
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Edit / Create Modal */}
            {isEditing && (
                <PricingPlanEditorModal
                    plan={isEditing as any}
                    isOpen={!!isEditing}
                    onClose={() => setIsEditing(null)}
                />
            )}
        </div>
    )
}

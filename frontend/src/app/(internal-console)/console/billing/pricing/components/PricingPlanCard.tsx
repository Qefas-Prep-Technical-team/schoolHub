"use client"

import React from "react"
import { motion } from "framer-motion"
import {
    Tag,
    Sparkles,
    Users,
    HardDrive,
    Shield,
    Check,
    ArrowRight,
    Edit3,
    GraduationCap,
    Clock,
    Zap,
    Layers,
    BookOpen
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface SubscriptionPlanData {
    id?: string
    name: string
    type?: string
    description?: string
    pricing?: {
        monthly?: number
        yearly?: number
    }
    monthlyPrice?: number
    yearlyPrice?: number
    isPopular?: boolean
    hasTrial?: boolean
    trialDays?: number
    maxStudents?: number
    maxStorageGb?: number
    maxTeachers?: number
    maxClasses?: number
    featureAccess?: Array<{
        name?: string
        tag?: string
        enabled?: boolean
    }>
    features?: string[]
    [key: string]: unknown
}

export interface PricingPlanCardProps {
    plan: SubscriptionPlanData
    billingCycle: "monthly" | "yearly"
    category?: string
    onEdit: (plan: SubscriptionPlanData) => void
}

export function PricingPlanCard({ plan, billingCycle, category, onEdit }: PricingPlanCardProps) {
    const isFree = plan.type === "free" || (!plan.pricing?.monthly && !plan.pricing?.yearly && !plan.monthlyPrice && !plan.yearlyPrice)

    const monthlyVal = Number(plan.pricing?.monthly ?? plan.monthlyPrice ?? 0)
    const yearlyVal = Number(plan.pricing?.yearly ?? plan.yearlyPrice ?? 0)

    // Current price to display based on selected billing cycle
    const displayPrice = billingCycle === "monthly" ? monthlyVal : yearlyVal

    // Monthly equivalent when paying yearly
    const monthlyEquivalent = yearlyVal > 0 ? Math.round(yearlyVal / 12) : 0

    // Annual savings calculation
    const annualSavings = (monthlyVal * 12) - yearlyVal
    const savingsPercent = monthlyVal > 0 && yearlyVal > 0 ? Math.round((annualSavings / (monthlyVal * 12)) * 100) : 0

    const isPopular = Boolean(plan.isPopular)

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="group relative h-full flex flex-col"
        >
            <Card className={cn(
                "h-full flex flex-col justify-between rounded-3xl transition-all duration-300 relative overflow-hidden bg-white dark:bg-slate-900 border",
                isPopular
                    ? "border-indigo-500/80 dark:border-indigo-500/60 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/20"
                    : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-md hover:shadow-lg"
            )}>
                {/* Popular Gradient Ribbon */}
                {isPopular && (
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                )}

                <div>
                    <CardHeader className="p-6 sm:p-7 pb-4 space-y-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className={cn(
                                "size-11 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-105",
                                isFree
                                    ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                                    : "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                            )}>
                                {isFree ? <Tag size={20} /> : <Zap size={20} />}
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                {isPopular && (
                                    <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-full font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5">
                                        Popular
                                    </Badge>
                                )}
                                <Badge variant="outline" className={cn(
                                    "rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                    isFree
                                        ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                                        : "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                                )}>
                                    {plan.type || (isFree ? "Free" : "Premium")}
                                </Badge>
                            </div>
                        </div>

                        <div>
                            <CardTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                <span>{plan.name}</span>
                            </CardTitle>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1.5 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                                {plan.description || "Comprehensive platform plan with configurable institutional limits."}
                            </p>
                        </div>

                        {/* Price Presentation */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                            {isFree ? (
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Free</span>
                                    <span className="text-xs font-semibold text-slate-400">/ forever</span>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                            ₦{displayPrice.toLocaleString()}
                                        </span>
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            /{billingCycle === "monthly" ? "month" : "year"}
                                        </span>
                                    </div>

                                    {billingCycle === "yearly" && (
                                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                                            {monthlyEquivalent > 0 && (
                                                <span className="text-xs text-slate-400 font-medium">
                                                    (approx. ₦{monthlyEquivalent.toLocaleString()}/mo)
                                                </span>
                                            )}
                                            {savingsPercent > 0 && (
                                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/40">
                                                    Save {savingsPercent}%
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {plan.hasTrial && (
                                <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                    <Clock size={13} />
                                    <span>Includes {plan.trialDays || 14}-day free trial</span>
                                </div>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 sm:p-7 pt-2 space-y-6">
                        {/* Quotas & Limits */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                Resource Quotas
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <Users size={13} className="shrink-0 text-slate-400" />
                                        <span className="text-[11px] font-medium">Students</span>
                                    </div>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                        {plan.maxStudents ? plan.maxStudents.toLocaleString() : "Unlimited"}
                                    </span>
                                </div>

                                <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <HardDrive size={13} className="shrink-0 text-slate-400" />
                                        <span className="text-[11px] font-medium">Storage</span>
                                    </div>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                        {plan.maxStorageGb ? `${plan.maxStorageGb} GB` : "Unlimited"}
                                    </span>
                                </div>

                                {(plan.maxTeachers !== undefined || plan.maxClasses !== undefined) && (
                                    <>
                                        <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <GraduationCap size={13} className="shrink-0 text-slate-400" />
                                                <span className="text-[11px] font-medium">Teachers</span>
                                            </div>
                                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                                {plan.maxTeachers ? plan.maxTeachers.toLocaleString() : "Unlimited"}
                                            </span>
                                        </div>

                                        <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <BookOpen size={13} className="shrink-0 text-slate-400" />
                                                <span className="text-[11px] font-medium">Classes</span>
                                            </div>
                                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                                {plan.maxClasses ? plan.maxClasses.toLocaleString() : "Unlimited"}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Entitlements & Features */}
                        <div className="space-y-2.5">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                Plan Capabilities & Entitlements
                            </span>

                            <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {/* Relational features */}
                                {plan.featureAccess?.filter((fa) => fa.enabled).map((fa, idx) => (
                                    <li key={`fa-${idx}`} className="flex items-start gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        <Shield size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <span className="truncate block">{fa.name || fa.tag}</span>
                                        </div>
                                    </li>
                                ))}

                                {/* Marketing bullet features */}
                                {plan.features?.map((f, idx) => (
                                    <li key={`mf-${idx}`} className="flex items-start gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span className="flex-1">{f}</span>
                                    </li>
                                ))}

                                {(!plan.featureAccess || plan.featureAccess.length === 0) && (!plan.features || plan.features.length === 0) && (
                                    <li className="text-xs text-slate-400 italic">Standard foundational features included.</li>
                                )}
                            </ul>
                        </div>
                    </CardContent>
                </div>

                {/* Footer Action Button */}
                <div className="p-6 sm:p-7 pt-0 mt-auto">
                    <Button
                        onClick={() => onEdit(plan)}
                        className={cn(
                            "w-full rounded-2xl h-11 font-bold text-xs gap-2 transition-all cursor-pointer shadow-sm",
                            isPopular
                                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25"
                                : "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900"
                        )}
                    >
                        <Edit3 size={14} />
                        <span>Configure & Edit Plan</span>
                    </Button>
                </div>
            </Card>
        </motion.div>
    )
}

export default PricingPlanCard

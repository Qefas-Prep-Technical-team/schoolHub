"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
    usePlatformFeatures as useEntitlementFeatures,
    useHarvestFeatures 
} from "@/lib/api/hooks/usePricingManagement"
import { useUpdatePlatformFeature } from "@/lib/api/hooks/usePlatformSchools"
import { 
    RefreshCcw, 
    Sparkles, 
    Wrench as FeatureIcon,
    Search as SearchIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { cn } from "@/lib/utils"
import FeatureCard from "./FeatureCard"

interface RoleFeaturesContentProps {
    role: string
    roleLabel: string
    icon: any
    accentColor: string
    searchQuery: string
    setSearchQuery: (q: string) => void
}

export default function RoleFeaturesContent({
    role,
    roleLabel,
    icon: Icon,
    accentColor,
    searchQuery,
    setSearchQuery
}: RoleFeaturesContentProps) {
    const queryClient = useQueryClient()
    const { data: entitlementFeatures, isLoading: isLoadingEntitlement } = useEntitlementFeatures()
    const { mutate: updateFeature } = useUpdatePlatformFeature()
    const harvestFeatures = useHarvestFeatures()
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    const handleToggle = (id: string, role: string, value: boolean) => {
        const updateData: any = {}
        updateData[`${role}Enabled`] = value
        setUpdatingId(id)
        updateFeature({ id, updateData }, {
            onSettled: () => setUpdatingId(null)
        })
    }

    const filteredFeatures = () => {
        const query = searchQuery.toLowerCase();
        const registry = entitlementFeatures || [];

        return registry.filter((f: any) => {
            const matchesSearch =
                (f.name?.toLowerCase() || "").includes(query) ||
                (f.tag?.toLowerCase() || "").includes(query) ||
                (f.marketingLabel && f.marketingLabel.toLowerCase().includes(query));

            return matchesSearch;
        })
    }

    const features = filteredFeatures()

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Role Tab Header */}
            <div className="flex items-center gap-4 py-4 border-b border-slate-100 dark:border-white/5">
                <div className={cn("p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-white/10", accentColor)}>
                    <Icon size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                        Configuring <span className={accentColor}>{roleLabel}</span>
                    </h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                        Directly Attached Features & Modules
                    </p>
                </div>

                <div className="ml-auto">
                    <Button
                        variant="outline"
                        onClick={() => harvestFeatures.mutate({ category: role.toUpperCase(), role })}
                        disabled={harvestFeatures.isPending}
                        className="border-indigo-600/20 text-indigo-600 hover:bg-indigo-50 rounded-2xl px-6 py-4 font-black uppercase tracking-widest text-[9px] gap-2"
                    >
                        {harvestFeatures.isPending ? <RefreshCcw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                        Sync {roleLabel} Features
                    </Button>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingEntitlement ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 space-y-6 animate-pulse">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-14 w-14 rounded-2xl" />
                                <Skeleton className="h-8 w-1/2" />
                            </div>
                            <Skeleton className="h-24 w-full rounded-2xl" />
                        </div>
                    ))
                ) : features.map((feature: any) => (
                    <FeatureCard 
                        key={feature.id}
                        feature={feature}
                        mode="role"
                        activeRole={role}
                        onToggle={handleToggle}
                        isUpdating={updatingId === feature.id}
                    />
                ))}
            </div>

            {/* Empty State */}
            {!isLoadingEntitlement && features.length === 0 && (
                <div className="py-40 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[3rem]">
                    <div className="bg-slate-50 dark:bg-white/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <FeatureIcon size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-400 dark:text-slate-600">
                        {(!entitlementFeatures || entitlementFeatures.length === 0) 
                            ? "Registry Empty" 
                            : `No ${role} features found`}
                    </h3>
                    <p className="text-slate-400 dark:text-slate-600 font-bold mt-2">
                        {(!entitlementFeatures || entitlementFeatures.length === 0)
                            ? "Add features in the Registry tab to see them here."
                            : "Try adjusting your search or filters."}
                    </p>
                </div>
            )}
        </div>
    )
}

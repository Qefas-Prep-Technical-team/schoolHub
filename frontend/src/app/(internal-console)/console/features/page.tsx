"use client"

import RoleFeaturesContent from "./components/RoleFeaturesContent"
import {
    useUpdatePlatformFeature
} from "@/lib/api/hooks/usePlatformSchools"
import {
    usePlatformFeatures as useEntitlementFeatures,
    useSavePlatformFeature,
    useHarvestFeatures
} from "@/lib/api/hooks/usePricingManagement"
import { platformClient } from "@/lib/api/platformClient"
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore"
import {
    Wrench as FeatureIcon,
    Shield as ShieldIcon,
    User as StudentIcon,
    Presentation as TeacherIcon,
    Users as ParentIcon,
    Lock as AdminIcon,
    Info as InfoIcon,
    Search as SearchIcon,
    Plus as PlusIcon,
    Sparkles,
    Trash2,
    RefreshCcw
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { toast } from "react-toastify"
import FeatureCard from "./components/FeatureCard"
import AddFeatureModal from "./components/AddFeatureModal"
import DeleteFeatureModal from "./components/DeleteFeatureModal"



export default function PlatformFeaturesPage() {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()
    const { data: entitlementFeatures, isLoading: isLoadingEntitlement } = useEntitlementFeatures()
    const { mutate: updateFeature } = useUpdatePlatformFeature()
    const saveEntitlementFeature = useSavePlatformFeature()
    const deleteEntitlementFeature = useMutation({
        mutationFn: async (id: string) => {
            const token = usePlatformStaffStore.getState().platform_token
            const { data } = await platformClient.delete(`/platform/pricing/features/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["platform-features"] })
            setIsDeleteModalOpen(false)
            setFeatureToDelete(null)
            toast.success("Feature deleted from registry")
        },
        onError: (err: any) => {
            console.error("Delete failed:", err)
            toast.error(err.response?.data?.message || "Failed to delete feature. Check your permissions.")
        }
    })
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [featureToDelete, setFeatureToDelete] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeRole, setActiveRole] = useState("student")
    const harvestFeatures = useHarvestFeatures()
    const [isAddingFeature, setIsAddingFeature] = useState(false)

    const handleToggle = (id: string, role: string, value: boolean) => {
        const updateData: any = {}
        updateData[`${role}Enabled`] = value
        updateFeature({ id, updateData })
    }

    const handleSaveEntitlement = async (newFeature: any) => {
        await saveEntitlementFeature.mutateAsync(newFeature)
        setIsAddingFeature(false)
    }

    const filteredFeatures = (role: string) => {
        const query = searchQuery.toLowerCase();
        const registry = entitlementFeatures || [];

        return registry.filter((f: any) => {
            const matchesSearch =
                (f.name?.toLowerCase() || "").includes(query) ||
                (f.featureKey?.toLowerCase() || "").includes(query) ||
                (f.marketingLabel && f.marketingLabel.toLowerCase().includes(query));

            return matchesSearch;
        })
    }

    const roleData = {
        student: { icon: StudentIcon, color: "text-blue-500", label: "Student Portal" },
        teacher: { icon: TeacherIcon, color: "text-emerald-500", label: "Teacher Hub" },
        parent: { icon: ParentIcon, color: "text-orange-500", label: "Parent Portal" },
        admin: { icon: AdminIcon, color: "text-indigo-500", label: "Admin Console" },
        registry: { icon: ShieldIcon, color: "text-emerald-500", label: "Entitlement Registry" }
    }

    const currentRole = roleData[activeRole as keyof typeof roleData]

    return (
        <div className="space-y-10 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <FeatureIcon size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">System Architecture</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        Feature <span className="text-indigo-600 dark:text-indigo-500">Toggles</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl">
                        Configure module visibility and permissions across all user roles globally.
                    </p>
                </div>
            </div>

            {/* Tabs for Roles */}
            <Tabs defaultValue="student" className="space-y-12" onValueChange={setActiveRole}>
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-3 rounded-[2.5rem] border border-white dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none sticky top-4 z-40">
                    <TabsList className="bg-slate-100/50 dark:bg-white/5 border-none p-1.5 h-auto rounded-[2rem] flex flex-wrap md:flex-nowrap">
                        {[
                            { id: 'student', label: 'Student', icon: StudentIcon, color: 'data-[state=active]:bg-blue-600' },
                            { id: 'teacher', label: 'Teacher', icon: TeacherIcon, color: 'data-[state=active]:bg-emerald-600' },
                            { id: 'parent', label: 'Parent', icon: ParentIcon, color: 'data-[state=active]:bg-orange-600' },
                            { id: 'admin', label: 'Admin', icon: AdminIcon, color: 'data-[state=active]:bg-indigo-600' },
                            { id: 'registry', label: 'Registry', icon: ShieldIcon, color: 'data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900' }
                        ].map((tab) => (
                            <TabsTrigger 
                                key={tab.id}
                                value={tab.id} 
                                className={cn(
                                    "rounded-[1.5rem] px-8 py-4 font-black text-[11px] uppercase tracking-widest gap-3 transition-all duration-500",
                                    "data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:scale-105",
                                    tab.color
                                )}
                            >
                                <tab.icon size={18} /> {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <div className="relative group flex-1 max-w-md ml-auto">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <SearchIcon className={cn("transition-colors duration-300", currentRole.color)} size={20} />
                        </div>
                        <Input
                            placeholder={`Filter ${activeRole}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-16 h-16 bg-white/80 dark:bg-slate-950/80 border-transparent rounded-[1.5rem] shadow-inner focus:ring-0 transition-all font-bold text-slate-900 dark:text-white border-2 focus:border-indigo-500/30"
                        />
                    </div>
                </div>

                {['student', 'teacher', 'parent', 'admin'].map((role) => (
                    <TabsContent key={role} value={role}>
                        <RoleFeaturesContent 
                            role={role}
                            roleLabel={roleData[role as keyof typeof roleData].label}
                            icon={roleData[role as keyof typeof roleData].icon}
                            accentColor={roleData[role as keyof typeof roleData].color}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                        />
                    </TabsContent>
                ))}

                {/* Registry Tab Content */}
                <TabsContent value="registry" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-10 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] px-8 rounded-[3rem]">
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                Entitlement <span className="text-emerald-600">Registry</span>
                            </h3>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
                                Define Core Platform Capabilities & Feature Tags
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => harvestFeatures.mutate({})}
                                disabled={harvestFeatures.isPending}
                                className="border-2 border-emerald-600/20 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-[1.5rem] px-8 py-7 font-black uppercase tracking-widest text-[10px] gap-3 shadow-lg shadow-emerald-500/5 transition-all hover:scale-105 active:scale-95"
                            >
                                {harvestFeatures.isPending ? <RefreshCcw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                Sync Master Registry
                            </Button>

                            <Button
                                onClick={() => setIsAddingFeature(true)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-[1.5rem] px-10 py-7 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-emerald-600/30 gap-3 transition-all hover:scale-105 active:scale-95"
                            >
                                <PlusIcon size={20} /> Register New Feature
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-16 px-4">
                        {Object.entries(
                            (entitlementFeatures || []).reduce((acc: any, f: any) => {
                                const cat = f.category || 'GENERAL';
                                if (!acc[cat]) acc[cat] = [];
                                acc[cat].push(f);
                                return acc;
                            }, {})
                        ).map(([category, features]: [string, any]) => (
                            <div key={category} className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />
                                    <Badge className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl px-6 py-2.5 font-black text-[10px] uppercase tracking-[0.3em] shadow-xl">
                                        {category} Features
                                    </Badge>
                                    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {features.map((f: any) => (
                                        <FeatureCard 
                                            key={f.id}
                                            feature={f}
                                            mode="registry"
                                            onToggle={handleToggle}
                                            onDelete={(feature) => {
                                                setFeatureToDelete(feature)
                                                setIsDeleteModalOpen(true)
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                        {(!entitlementFeatures || entitlementFeatures.length === 0) && (
                            <div className="py-40 text-center border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[4rem] bg-slate-50/30 dark:bg-white/[0.01]">
                                <div className="bg-white dark:bg-slate-900 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl border border-slate-100 dark:border-white/5 text-slate-300">
                                    <FeatureIcon size={56} />
                                </div>
                                <h3 className="text-3xl font-black text-slate-400 dark:text-slate-700">Registry Empty</h3>
                                <p className="text-slate-400 dark:text-slate-600 font-bold mt-4 mb-10 max-w-sm mx-auto">
                                    Sync or manually register your first entitlement to begin managing core platform features.
                                </p>
                                
                                <Button
                                    onClick={() => harvestFeatures.mutate({})}
                                    disabled={harvestFeatures.isPending}
                                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] px-12 py-8 font-black uppercase tracking-[0.2em] text-[12px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all gap-4"
                                >
                                    {harvestFeatures.isPending ? <RefreshCcw className="animate-spin" size={20} /> : <Sparkles size={20} />}
                                    Harvest Features from Plans
                                </Button>
                            </div>
                        )}
                </TabsContent>
            </Tabs>

            <AddFeatureModal 
                isOpen={isAddingFeature}
                onClose={() => setIsAddingFeature(false)}
                onSave={handleSaveEntitlement}
                isSaving={saveEntitlementFeature.isPending}
            />

            <DeleteFeatureModal 
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false)
                    setFeatureToDelete(null)
                }}
                featureToDelete={featureToDelete}
                onDelete={(id) => deleteEntitlementFeature.mutate(id)}
                isDeleting={deleteEntitlementFeature.isPending}
            />
        </div>
    )
}

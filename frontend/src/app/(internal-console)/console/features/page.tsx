"use client"

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

        // Everything now filters from entitlementFeatures (The Registry)
        return entitlementFeatures?.filter((f: any) => {
            const matchesSearch =
                f.name.toLowerCase().includes(query) ||
                f.tag.toLowerCase().includes(query) ||
                (f.marketingLabel && f.marketingLabel.toLowerCase().includes(query));

            // We show all features in all tabs so they can be toggled on/off for that role
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
            <Tabs defaultValue="student" className="space-y-10" onValueChange={setActiveRole}>
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <TabsList className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 p-1.5 h-auto rounded-[2rem] shadow-sm">
                        <TabsTrigger value="student" className="rounded-[1.5rem] px-8 py-3.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 font-black text-[11px] uppercase tracking-widest gap-2.5 transition-all">
                            <StudentIcon size={16} /> Student
                        </TabsTrigger>
                        <TabsTrigger value="teacher" className="rounded-[1.5rem] px-8 py-3.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 font-black text-[11px] uppercase tracking-widest gap-2.5 transition-all">
                            <TeacherIcon size={16} /> Teacher
                        </TabsTrigger>
                        <TabsTrigger value="parent" className="rounded-[1.5rem] px-8 py-3.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 font-black text-[11px] uppercase tracking-widest gap-2.5 transition-all">
                            <ParentIcon size={16} /> Parent
                        </TabsTrigger>
                        <TabsTrigger value="admin" className="rounded-[1.5rem] px-8 py-3.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 font-black text-[11px] uppercase tracking-widest gap-2.5 transition-all">
                            <AdminIcon size={16} /> Admin
                        </TabsTrigger>
                        <TabsTrigger value="registry" className="rounded-[1.5rem] px-8 py-3.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/20 font-black text-[11px] uppercase tracking-widest gap-2.5 transition-all">
                            <ShieldIcon size={16} /> Registry
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative group min-w-[360px]">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <SearchIcon className={cn("transition-colors duration-300", currentRole.color)} size={20} />
                        </div>
                        <Input
                            placeholder={`Search ${activeRole} features...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-14 h-16 bg-white dark:bg-slate-950 border-slate-200 dark:border-white/5 rounded-[1.5rem] shadow-sm focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900 dark:text-white border-2 focus:border-indigo-500/50"
                        />
                    </div>
                </div>

                {['student', 'teacher', 'parent', 'admin'].map((role) => (
                    <TabsContent key={role} value={role} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Dynamic Header for Active Role */}
                        <div className="flex items-center gap-4 py-4 border-b border-slate-100 dark:border-white/5">
                            <div className={cn("p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-white/10", currentRole.color)}>
                                <currentRole.icon size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Configuring <span className={currentRole.color}>{currentRole.label}</span>
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
                                    Sync {currentRole.label} Features
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {isLoadingEntitlement ? (
                                Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 space-y-6 animate-pulse">
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="h-14 w-14 rounded-2xl" />
                                            <Skeleton className="h-8 w-1/2" />
                                        </div>
                                        <Skeleton className="h-24 w-full rounded-2xl" />
                                        <div className="p-6 pt-0 border-t border-slate-50 dark:border-slate-800/50 mt-4">
                                            <div className="pt-4 flex flex-col gap-2">
                                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active in Plans</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {/* Placeholder logic for skeleton */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : filteredFeatures(role)?.map((feature: any) => (
                                <FeatureCard 
                                    key={feature.id}
                                    feature={feature}
                                    mode="role"
                                    activeRole={role}
                                    onToggle={handleToggle}
                                />
                            ))}
                        </div>

                        {filteredFeatures(role)?.length === 0 && (
                            <div className="py-40 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[3rem]">
                                <div className="bg-slate-50 dark:bg-white/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                    <FeatureIcon size={48} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-400 dark:text-slate-600">No {role} features found</h3>
                                <p className="text-slate-400 dark:text-slate-600 font-bold mt-2">Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </TabsContent>
                ))}

                {/* Registry Tab Content */}
                <TabsContent value="registry" className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 border-b border-slate-100 dark:border-white/5">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                Entitlement <span className="text-emerald-600">Registry</span>
                            </h3>
                            <p className="text-sm font-medium text-slate-500 mt-1">Define core platform features that can be assigned to subscription plans.</p>
                        </div>
                        <div className="flex items-center gap-3">

                            <Button
                                onClick={() => setIsAddingFeature(true)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl px-8 py-6 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-600/20 gap-2"
                            >
                                <PlusIcon size={16} /> Register New Feature
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-12">
                        {Object.entries(
                            (entitlementFeatures || []).reduce((acc: any, f: any) => {
                                const cat = f.category || 'GENERAL';
                                if (!acc[cat]) acc[cat] = [];
                                acc[cat].push(f);
                                return acc;
                            }, {})
                        ).map(([category, features]: [string, any]) => (
                            <div key={category} className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-white/5" />
                                    <Badge className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg px-4 py-1.5 font-black text-[10px] uppercase tracking-[0.2em]">
                                        {category} Features
                                    </Badge>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-white/5" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

                        {(!entitlementFeatures || entitlementFeatures.length === 0) && (
                            <div className="py-40 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[3rem]">
                                <div className="bg-slate-50 dark:bg-white/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                    <FeatureIcon size={48} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-400 dark:text-slate-600">Registry Empty</h3>
                                <p className="text-slate-400 dark:text-slate-600 font-bold mt-2">Sync or manually register your first entitlement.</p>
                            </div>
                        )}
                    </div>
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

"use client"

import { useState } from "react"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import RolePagesControlContent from "./components/RolePagesControlContent"
import AdminPagesControlContent from "./components/AdminPagesControlContent"
import FeatureCard from "./components/FeatureCard"
import AddFeatureModal from "./components/AddFeatureModal"
import DeleteFeatureModal from "./components/DeleteFeatureModal"
import { useUpdatePlatformFeature } from "@/lib/api/hooks/usePlatformSchools"
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
    Search as SearchIcon,
    Plus as PlusIcon,
    Sparkles,
    RefreshCcw,
    Layers
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "react-toastify"

export default function PlatformFeaturesPage() {
    const queryClient = useQueryClient()
    const { data: entitlementFeatures } = useEntitlementFeatures()
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

    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [featureToDelete, setFeatureToDelete] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeRole, setActiveRole] = useState("admin-pages")
    const harvestFeatures = useHarvestFeatures()
    const [isAddingFeature, setIsAddingFeature] = useState(false)

    const handleToggle = (id: string, role: string, value: boolean) => {
        const updateData: Record<string, unknown> = {}
        updateData[`${role}Enabled`] = value
        setUpdatingId(id)
        updateFeature({ id, updateData }, {
            onSettled: () => setUpdatingId(null)
        })
    }

    const handleSaveEntitlement = async (newFeature: any) => {
        await saveEntitlementFeature.mutateAsync(newFeature)
        setIsAddingFeature(false)
    }

    const roleData = {
        'admin-pages': { icon: Layers, color: "text-indigo-600", label: "Admin Dashboard Pages" },
        teacher: { icon: TeacherIcon, color: "text-emerald-500", label: "Teacher Hub" },
        student: { icon: StudentIcon, color: "text-blue-500", label: "Student Portal" },
        parent: { icon: ParentIcon, color: "text-orange-500", label: "Parent Portal" },
        registry: { icon: ShieldIcon, color: "text-emerald-500", label: "Entitlement Registry" }
    }

    const currentRole = roleData[activeRole as keyof typeof roleData] || roleData['admin-pages']

    return (
        <div className="space-y-8 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400">
                        <FeatureIcon size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Platform Governance</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        Feature & Page <span className="text-indigo-600 dark:text-indigo-500">Controls</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
                        Manage granular visibility, access control, and subscription paywall status across Admin, Teacher, Student, and Parent dashboards in real-time.
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <Tabs defaultValue="admin-pages" className="space-y-8" onValueChange={setActiveRole}>
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-2.5 rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none sticky top-4 z-40">
                    <TabsList className="bg-slate-100/70 dark:bg-white/5 border-none p-1.5 h-auto rounded-[2rem] flex flex-wrap md:flex-nowrap gap-1">
                        {[
                            { id: 'admin-pages', label: 'Admin Pages', icon: Layers, color: 'data-[state=active]:bg-indigo-600' },
                            { id: 'teacher', label: 'Teacher Hub', icon: TeacherIcon, color: 'data-[state=active]:bg-emerald-600' },
                            { id: 'student', label: 'Student Portal', icon: StudentIcon, color: 'data-[state=active]:bg-blue-600' },
                            { id: 'parent', label: 'Parent Portal', icon: ParentIcon, color: 'data-[state=active]:bg-orange-600' },
                            { id: 'registry', label: 'Registry', icon: ShieldIcon, color: 'data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900' }
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className={cn(
                                    "rounded-[1.4rem] px-6 py-3.5 font-black text-[11px] uppercase tracking-wider gap-2.5 transition-all duration-300",
                                    "data-[state=active]:text-white data-[state=active]:shadow-xl cursor-pointer",
                                    tab.color
                                )}
                            >
                                <tab.icon size={16} /> {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {activeRole === 'registry' && (
                        <div className="relative group flex-1 max-w-sm ml-auto px-2">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                <SearchIcon className={cn("transition-colors duration-300", currentRole.color)} size={18} />
                            </div>
                            <Input
                                placeholder="Filter registry features..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 rounded-2xl shadow-sm text-sm font-bold text-slate-900 dark:text-white"
                            />
                        </div>
                    )}
                </div>

                {/* Tab 1: Admin Pages Control Matrix */}
                <TabsContent value="admin-pages">
                    <AdminPagesControlContent />
                </TabsContent>

                {/* Tab 2: Teacher Pages Control */}
                <TabsContent value="teacher">
                    <RolePagesControlContent
                        role="teacher"
                        roleLabel="Teacher"
                        icon={TeacherIcon}
                        accentColor="text-emerald-500"
                    />
                </TabsContent>

                {/* Tab 3: Student Pages Control */}
                <TabsContent value="student">
                    <RolePagesControlContent
                        role="student"
                        roleLabel="Student"
                        icon={StudentIcon}
                        accentColor="text-blue-500"
                    />
                </TabsContent>

                {/* Tab 4: Parent Pages Control */}
                <TabsContent value="parent">
                    <RolePagesControlContent
                        role="parent"
                        roleLabel="Parent"
                        icon={ParentIcon}
                        accentColor="text-orange-500"
                    />
                </TabsContent>

                {/* Tab 6: Registry Master */}
                <TabsContent value="registry" className="space-y-12 animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] px-8 rounded-[2.5rem]">
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                Entitlement <span className="text-emerald-600">Registry</span>
                            </h3>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">
                                Define Core Platform Capabilities & Feature Tags
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => harvestFeatures.mutate({})}
                                disabled={harvestFeatures.isPending}
                                className="border-2 border-emerald-600/20 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-2xl px-6 py-6 font-black uppercase tracking-widest text-[10px] gap-2.5 shadow-sm"
                            >
                                {harvestFeatures.isPending ? <RefreshCcw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                                Sync Master Registry
                            </Button>

                            <Button
                                onClick={() => setIsAddingFeature(true)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl px-8 py-6 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-600/20 gap-2.5"
                            >
                                <PlusIcon size={18} /> Register New Feature
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-12 px-2">
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
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />
                                    <Badge className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl px-5 py-2 font-black text-[10px] uppercase tracking-[0.25em]">
                                        {category} Features
                                    </Badge>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />
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
                                            isUpdating={updatingId === f.id}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
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

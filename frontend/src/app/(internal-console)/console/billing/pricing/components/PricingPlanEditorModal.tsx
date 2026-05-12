"use client"

import { useState, useEffect } from "react"
import { useSavePricingPlan, usePlatformFeatures } from "@/lib/api/hooks/usePricingManagement"
import { 
    X, 
    Save, 
    Info, 
    Layers, 
    Settings, 
    Plus, 
    Trash2,
    DollarSign,
    Calculator,
    Shield,
    RefreshCcw,
    Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface PricingPlanEditorModalProps {
    plan: Record<string, any> | null
    isOpen: boolean
    onClose: () => void
}

export default function PricingPlanEditorModal({ plan, isOpen, onClose }: PricingPlanEditorModalProps) {
    const savePlan = useSavePricingPlan()
    const { data: manifestFeatures, isLoading: isManifestLoading, isError: isManifestError, error: manifestError } = usePlatformFeatures()
    const [formData, setFormData] = useState<Record<string, any>>({
        name: "",
        category: "schools",
        type: "PAID",
        monthlyPrice: "",
        yearlyPrice: "",
        maxStudents: "",
        maxStorageGb: "",
        trialDays: "",
        features: [],
        linkedFeatures: [],
        featureAccess: [],
        isPopular: false,
        hasTrial: false
    })
    const [limitEditingFeature, setLimitEditingFeature] = useState<Record<string, any> | null>(null)

    useEffect(() => {
        if (plan) {
            const legacyFeatures = plan.features || []
            const relationalAccess = plan.featureAccess || []
            
            // 1. Identify which legacy features are actually linked to manifest tags
            const linkedTags = new Set(relationalAccess.map((ra: Record<string, any>) => ra.feature?.tag))
            
            // 2. Build the linkedFeatures array (manifest-backed items)
            // We want to map what's in the DB to our internal editing state
            const linked = relationalAccess.map((ra: Record<string, any>) => ({
                name: ra.name || ra.feature?.name || ra.feature?.tag,
                tag: ra.tag || ra.feature?.tag,
                enabled: ra.enabled
            }))

            // 3. Build the marketingFeatures array (purely visual items)
            // A feature is "marketing-only" if it's in the features array but NOT linked to a tag
            const marketingOnly = legacyFeatures.filter((f: string) => {
                // Check if this string is a name or tag of a relational access
                const isLinked = relationalAccess.some((ra: Record<string, any>) => 
                    ra.feature?.name === f || ra.feature?.tag === f
                )
                return !isLinked
            })

            setFormData({
                ...plan,
                monthlyPrice: plan.pricing?.monthly ?? plan.monthlyPrice ?? '',
                yearlyPrice: plan.pricing?.yearly ?? plan.yearlyPrice ?? '',
                linkedFeatures: relationalAccess.map((ra: Record<string, any>) => {
                    const manifestName = (ra.name !== null && ra.name !== undefined) ? ra.name : (ra.feature?.name || ra.feature?.tag);
                    const existsInMarketing = plan.features?.includes(manifestName);
                    
                    return {
                        featureId: ra.featureId || ra.feature?.id,
                        name: manifestName,
                        tag: ra.tag || ra.feature?.tag,
                        enabled: ra.enabled,
                        limitValue: ra.limitValue ?? "",
                        setupLimit: ra.meta?.setupLimit ?? "",
                        showLabel: ra.meta?.showLabel ?? existsInMarketing ?? true
                    };
                }),
                features: marketingOnly, // Purely visual ad-hoc labels
                maxStudents: plan.maxStudents ?? '',
                maxTeachers: plan.maxTeachers ?? '',
                maxClasses: plan.maxClasses ?? '',
                maxExams: plan.maxExams ?? '',
                maxAiUsage: plan.maxAiUsage ?? '',
                maxStorageGb: plan.maxStorageGb ?? '',
                trialDays: plan.trialDays ?? '',
                name: plan.name ?? '',
                description: plan.description ?? '',
                isPopular: plan.isPopular ?? false,
                hasTrial: plan.hasTrial ?? false
            })
        }
    }, [plan, manifestFeatures])

    if (!formData) return null

    const handleFeatureChange = (index: number, field: string, value: any) => {
        const newFeatures = [...(formData.linkedFeatures || [])]
        newFeatures[index] = { ...newFeatures[index], [field]: value }
        setFormData({ ...formData, linkedFeatures: newFeatures })
    }

    const addFeature = () => {
        const newFeat = { name: "", tag: "", enabled: true }
        setFormData({ 
            ...formData, 
            linkedFeatures: [...(formData.linkedFeatures || []), newFeat] 
        })
    }

    const removeFeature = (index: number) => {
        setFormData({ 
            ...formData, 
            linkedFeatures: formData.linkedFeatures.filter((_: Record<string, any>, i: number) => i !== index) 
        })
    }

    const handleSubmit = async () => {
        // 1. Registry-backed labels (linked to entitlements)
        const entitlementLabels = formData.linkedFeatures
            .filter((f: Record<string, any>) => f.enabled && f.showLabel !== false && f.name && f.name.trim() !== "")
            .map((f: any) => f.name.trim());

        // 2. Ad-hoc labels (standalone strings)
        const adhocLabels = (formData.features || [])
            .filter((f: string) => f && f.trim() !== "");

        // Final merged list for public card
        const finalMarketingLabels = [...new Set([...entitlementLabels, ...adhocLabels])]
            .filter(label => label && label.trim() !== "");

        const relationalAccess = formData.linkedFeatures
            .filter((f: Record<string, any>) => f.featureId || (f.tag && f.tag !== ""))
            .map((f: Record<string, any>) => ({
                featureId: f.featureId,
                tag: f.tag,
                name: f.name, // Save the custom label back to relational access too
                enabled: f.enabled,
                limitValue: f.limitValue ? Number(f.limitValue) : null,
                meta: {
                    setupLimit: f.setupLimit ? Number(f.setupLimit) : null,
                    showLabel: f.showLabel
                }
            }));

        // CRITICAL: Extract EVERYTHING that could conflict
        const { 
            pricing, tabs, storage, linkedFeatures, 
            features, featureAccess, ...baseData 
        } = formData;
        
        const payload = {
            ...baseData,
            features: finalMarketingLabels,
            featureAccess: relationalAccess,
            monthlyPrice: Number(formData.monthlyPrice || 0) || 0,
            yearlyPrice: Number(formData.yearlyPrice || 0) || 0,
            maxStudents: Number(formData.maxStudents || 0) || 0,
            maxTeachers: Number(formData.maxTeachers || 0) || 0,
            maxClasses: Number(formData.maxClasses || 0) || 0,
            maxExams: Number(formData.maxExams || 0) || 0,
            maxAiUsage: Number(formData.maxAiUsage || 0) || 0,
            maxStorageGb: Number(formData.maxStorageGb || 0) || 0,
            trialDays: Number(formData.trialDays || 0) || 0,
        }

        console.log("[PricingPlanEditorModal] Submitting payload:", payload);
        
        await savePlan.mutateAsync(payload)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-0 shadow-2xl overflow-hidden">
                <DialogHeader className="p-8 pb-0 shrink-0 flex flex-row items-center justify-between">
                    <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <Settings size={20} />
                        </div>
                        Architect Plan: {formData.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-8 space-y-8 overflow-y-auto flex-1">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Label</Label>
                            <Input 
                                value={formData.name || ""} 
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 font-bold"
                            />
                        </div>
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Internal Type Key</Label>
                            <Input 
                                value={formData.type || ""} 
                                readOnly
                                className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 opacity-50 font-mono font-bold"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Executive Summary</Label>
                            <Textarea 
                                value={formData.description || ""} 
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 font-medium h-24"
                            />
                        </div>
                    </div>

                    <Separator className="bg-slate-100 dark:bg-slate-800" />

                    {/* Pricing & Quotas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                <DollarSign size={14} className="text-emerald-500" /> Financials
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-bold text-slate-400">Monthly (NGN)</Label>
                                    <Input 
                                        type="number"
                                        value={formData.monthlyPrice} 
                                        onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                                        className="rounded-xl border-slate-200 dark:border-slate-800 font-black h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-bold text-slate-400">Yearly (NGN)</Label>
                                    <Input 
                                        type="number"
                                        value={formData.yearlyPrice} 
                                        onChange={(e) => setFormData({ ...formData, yearlyPrice: e.target.value })}
                                        className="rounded-xl border-slate-200 dark:border-slate-800 font-black h-12"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                <Calculator size={14} className="text-blue-500" /> Resource Caps
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-bold text-slate-400">Max Students</Label>
                                    <Input 
                                        type="number"
                                        value={formData.maxStudents} 
                                        onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                                        className="rounded-xl border-slate-200 dark:border-slate-800 font-black h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-bold text-slate-400">Max Teachers</Label>
                                    <Input 
                                        type="number"
                                        value={formData.maxTeachers} 
                                        onChange={(e) => setFormData({ ...formData, maxTeachers: e.target.value })}
                                        className="rounded-xl border-slate-200 dark:border-slate-800 font-black h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-bold text-slate-400">Max Classes</Label>
                                    <Input 
                                        type="number"
                                        value={formData.maxClasses} 
                                        onChange={(e) => setFormData({ ...formData, maxClasses: e.target.value })}
                                        className="rounded-xl border-slate-200 dark:border-slate-800 font-black h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-bold text-slate-400">Max Exams</Label>
                                    <Input 
                                        type="number"
                                        value={formData.maxExams} 
                                        onChange={(e) => setFormData({ ...formData, maxExams: e.target.value })}
                                        className="rounded-xl border-slate-200 dark:border-slate-800 font-black h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-bold text-slate-400">AI Tokens / Usage</Label>
                                    <Input 
                                        type="number"
                                        value={formData.maxAiUsage} 
                                        onChange={(e) => setFormData({ ...formData, maxAiUsage: e.target.value })}
                                        className="rounded-xl border-slate-200 dark:border-slate-800 font-black h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-bold text-slate-400">Storage (GB)</Label>
                                    <Input 
                                        type="number"
                                        value={formData.maxStorageGb} 
                                        onChange={(e) => setFormData({ ...formData, maxStorageGb: e.target.value })}
                                        className="rounded-xl border-slate-200 dark:border-slate-800 font-black h-12"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                <Shield size={14} className="text-purple-500" /> Visibility
                            </h3>
                            <div className="space-y-6 pt-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold text-slate-500">Popular Choice</Label>
                                    <Switch 
                                        checked={formData.isPopular} 
                                        onCheckedChange={(val) => setFormData({ ...formData, isPopular: val })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold text-slate-500">Enable Trial</Label>
                                    <Switch 
                                        checked={formData.hasTrial} 
                                        onCheckedChange={(val) => setFormData({ ...formData, hasTrial: val })}
                                    />
                                </div>
                                {formData.hasTrial && (
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-bold text-slate-400">Trial Period (Days)</Label>
                                        <Input 
                                            type="number"
                                            value={formData.trialDays} 
                                            onChange={(e) => setFormData({ ...formData, trialDays: e.target.value })}
                                            className="rounded-xl border-slate-200 dark:border-slate-800 font-black h-12"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-slate-100 dark:bg-slate-800" />

                    {/* Master Entitlement Checklist */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                <Shield size={14} className="text-emerald-500" /> Platform Entitlements
                            </h3>
                            <div className="flex flex-col items-end">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registry Filter</p>
                                <Badge variant="outline" className="text-[9px] font-black bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 text-indigo-600 px-2 py-0">
                                    {formData.category?.toUpperCase() || "GLOBAL"}
                                </Badge>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isManifestLoading ? (
                                <div className="md:col-span-2 py-12 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-white/[0.02] rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 animate-pulse">
                                    <RefreshCcw className="animate-spin text-indigo-500 mb-3" size={24} />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center px-4">Synchronizing System Registry...</p>
                                </div>
                            ) : isManifestError ? (
                                <div className="md:col-span-2 py-12 flex flex-col items-center justify-center bg-red-50/50 dark:bg-red-900/10 rounded-[2rem] border border-dashed border-red-200 dark:border-red-900/30">
                                    <Shield size={24} className="text-red-500 mb-3" />
                                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest text-center px-4">Registry Sync Failed</p>
                                    <p className="text-[10px] text-red-400 mt-2">{(manifestError as Record<string, any>)?.message || "Check your network connection"}</p>
                                </div>
                            ) : !manifestFeatures ? (
                                <div className="md:col-span-2 py-12 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-white/[0.02] rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                                    <Shield size={24} className="text-slate-300 mb-3" />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Manifest Available</p>
                                </div>
                            ) : manifestFeatures.filter((mf: any) => {
                                // Filter by user type flags
                                if (formData.category === 'schools') return mf.adminEnabled;
                                if (formData.category === 'teachers') return mf.teacherEnabled;
                                if (formData.category === 'parents') return mf.parentEnabled;
                                if (formData.category === 'students') return mf.studentEnabled;
                                return true;
                            }).length === 0 ? (
                                <div className="md:col-span-2 py-12 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-white/[0.02] rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                                    <Shield size={24} className="text-slate-300 mb-3" />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching entitlements</p>
                                    <p className="text-[10px] text-slate-400 mt-1">Add {formData.category} features in the System Architecture console.</p>
                                </div>
                            ) : manifestFeatures?.filter((mf: any) => {
                                if (mf.isActive === false) return false;
                                if (formData.category === 'schools') return mf.adminEnabled;
                                if (formData.category === 'teachers') return mf.teacherEnabled;
                                if (formData.category === 'parents') return mf.parentEnabled;
                                if (formData.category === 'students') return mf.studentEnabled;
                                return true;
                            }).sort((a: Record<string, any>, b: Record<string, any>) => {
                                const aEnabled = formData.linkedFeatures?.find((lf: Record<string, any>) => lf.featureId === a.id || (lf.tag === a.tag && a.tag))?.enabled ? 1 : 0;
                                const bEnabled = formData.linkedFeatures?.find((lf: Record<string, any>) => lf.featureId === b.id || (lf.tag === b.tag && b.tag))?.enabled ? 1 : 0;
                                return bEnabled - aEnabled;
                            }).map((mf: Record<string, any>) => {
                                const linked = formData.linkedFeatures?.find((lf: Record<string, any>) => (lf.featureId === mf.id) || (lf.tag === mf.tag && mf.tag));
                                const isEnabled = linked?.enabled ?? false;

                                return (
                                    <div key={mf.id} className={cn(
                                        "p-4 rounded-2xl border transition-all space-y-3",
                                        isEnabled 
                                        ? "bg-emerald-50/30 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20" 
                                        : "bg-slate-50/50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800"
                                    )}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black text-slate-900 dark:text-white">{mf.name}</span>
                                                    {mf.marketingLabel && <Badge className="h-4 bg-emerald-500/10 text-emerald-600 border-none text-[8px] font-black uppercase tracking-tighter px-1">Registry Default</Badge>}
                                                </div>
                                                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter">{mf.tag}</span>
                                            </div>
                                            <Switch 
                                                checked={isEnabled} 
                                                onCheckedChange={(val) => {
                                                    const current = [...(formData.linkedFeatures || [])];
                                                    const idx = current.findIndex(lf => (lf.featureId === mf.id) || (lf.tag === mf.tag && mf.tag));
                                                    if (idx > -1) {
                                                        current[idx] = { ...current[idx], enabled: val };
                                                    } else {
                                                        // When turning on, initialize with empty name so it won't show as a label by default
                                                        current.push({ 
                                                            featureId: mf.id,
                                                            name: "", 
                                                            tag: mf.tag, 
                                                            enabled: val,
                                                            limitValue: "",
                                                            setupLimit: "",
                                                            showLabel: true
                                                        });
                                                    }
                                                    setFormData({ ...formData, linkedFeatures: current });
                                                    
                                                    // If turned on, show the limit popup
                                                    if (val) {
                                                        setLimitEditingFeature(mf);
                                                    }
                                                }}
                                                className="data-[state=checked]:bg-emerald-500"
                                            />
                                        </div>

                                        {isEnabled && (
                                            <div className="pt-2 border-t border-emerald-100 dark:border-emerald-500/10">
                                                <Label className="text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400 ml-1">Custom Marketing Label (Edit for Pricing Page)</Label>
                                                <Input 
                                                    placeholder={mf.marketingLabel || mf.name}
                                                    value={linked?.name || ""}
                                                    onChange={(e) => {
                                                        const current = [...(formData.linkedFeatures || [])];
                                                        const idx = current.findIndex((lf: Record<string, any>) => (lf.featureId === mf.id) || (lf.tag === mf.tag && mf.tag));
                                                        if (idx > -1) {
                                                            current[idx] = { ...current[idx], name: e.target.value };
                                                            setFormData({ ...formData, linkedFeatures: current });
                                                        }
                                                    }}
                                                    className="h-9 rounded-xl border-emerald-200 dark:border-emerald-500/30 bg-white/80 dark:bg-slate-950/80 font-bold text-xs"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <Separator className="bg-slate-100 dark:bg-slate-800" />

                    {/* Marketing & Visual Features */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                    <Layers size={14} className="text-indigo-500" /> Ad-hoc Marketing Labels
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400">Add standalone highlights (e.g. "Best Value")</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => {
                                setFormData({ 
                                    ...formData, 
                                    features: [...(formData.features || []), ""] 
                                })
                            }} className="text-indigo-500 hover:text-indigo-600 font-black text-[10px] uppercase gap-1 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-xl">
                                <Plus size={12} /> Add New Label
                            </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(formData.features || []).map((feat: string, i: number) => (
                                <div key={i} className="flex gap-2 group animate-in fade-in slide-in-from-left-2 duration-300">
                                    <Input 
                                        value={feat} 
                                        onChange={(e) => {
                                            const newFeats = [...(formData.features || [])];
                                            newFeats[i] = e.target.value;
                                            setFormData({ ...formData, features: newFeats });
                                        }}
                                        placeholder="e.g. 24/7 Priority Support"
                                        className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold text-sm shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => {
                                            const newFeats = (formData.features || []).filter((_: Record<string, any>, idx: number) => idx !== i);
                                            setFormData({ ...formData, features: newFeats });
                                        }}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all h-12 w-12"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            ))}
                            
                            {(!formData.features || formData.features.length === 0) && (
                                <div className="md:col-span-2 py-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] bg-slate-50/30">
                                    <p className="text-slate-400 font-bold text-sm italic">No ad-hoc labels added.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator className="bg-slate-100 dark:bg-slate-800" />

                    {/* Active Marketing Labels Summary */}
                    <div className="space-y-6">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                <Sparkles size={14} className="text-amber-500" /> Final Public Features
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400">What the customer will see on the pricing card</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Registry Linked Summary */}
                            {formData.linkedFeatures?.filter((lf: Record<string, any>) => lf.enabled).map((lf: Record<string, any>) => {
                                const manifest = manifestFeatures?.find((mf: Record<string, any>) => mf.id === lf.featureId || mf.tag === lf.tag);
                                const hasCustomName = lf.name !== null && lf.name !== undefined && lf.name !== "";
                                const isHidden = lf.showLabel === false || !hasCustomName;
                                const displayLabel = hasCustomName ? lf.name : (manifest?.marketingLabel || manifest?.name || lf.tag);
                                
                                return (
                                    <div key={lf.featureId || lf.tag} className={cn(
                                        "flex items-center justify-between p-4 rounded-2xl border transition-all",
                                        isHidden 
                                        ? "bg-slate-50/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 opacity-60"
                                        : "bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30"
                                    )}>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-900 dark:text-white">{displayLabel}</span>
                                                {isHidden && <Badge variant="outline" className="text-[7px] font-black uppercase px-1 h-3 border-slate-300 text-slate-400">Entitlement Only</Badge>}
                                            </div>
                                            <span className={cn(
                                                "text-[9px] uppercase font-black tracking-widest",
                                                isHidden ? "text-slate-400" : "text-emerald-600"
                                            )}>
                                                Registry: {manifest?.name || lf.tag}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {/* Ad-hoc Summary */}
                            {(formData.features || []).filter((f: string) => f && f.trim() !== "").map((feat: string, i: number) => (
                                <div key={`adhoc-${i}`} className="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">{feat}</span>
                                        <span className="text-[9px] text-blue-600 uppercase font-black tracking-widest">Standalone Label</span>
                                    </div>
                                </div>
                            ))}
                            
                            {(!formData.linkedFeatures?.some((lf: any) => lf.enabled) && (!formData.features || formData.features.length === 0)) && (
                                <div className="md:col-span-full py-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] bg-slate-50/30">
                                    <p className="text-slate-400 font-bold text-sm italic">The pricing card will be empty.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold px-8">Discard</Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={savePlan.isPending}
                        className="bg-indigo-600 hover:bg-indigo-500 rounded-xl font-black uppercase tracking-widest text-[10px] px-8 shadow-xl shadow-indigo-600/20 gap-2 h-12"
                    >
                        {savePlan.isPending ? <RefreshCcw className="animate-spin" size={16} /> : <Save size={16} />} 
                        Authorize Update
                    </Button>
                </div>
            </DialogContent>

            {/* Feature Limit Configuration Dialog */}
            <Dialog open={!!limitEditingFeature} onOpenChange={() => setLimitEditingFeature(null)}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <Sparkles size={20} />
                            </div>
                            Configure: {limitEditingFeature?.name}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 pt-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20">
                            <div className="flex flex-col gap-1">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Show in Pricing Card</Label>
                                <p className="text-[9px] text-slate-400 font-medium">Toggle this to hide/show this feature in the public plan description.</p>
                            </div>
                            <Switch 
                                checked={formData.linkedFeatures?.find((lf: any) => (lf.featureId === limitEditingFeature?.id) || (lf.tag === limitEditingFeature?.tag && limitEditingFeature?.tag))?.showLabel !== false}
                                onCheckedChange={(val) => {
                                    const current = [...(formData.linkedFeatures || [])];
                                    const idx = current.findIndex((lf: Record<string, any>) => (lf.featureId === limitEditingFeature?.id) || (lf.tag === limitEditingFeature?.tag && limitEditingFeature?.tag));
                                    if (idx > -1) {
                                        current[idx] = { ...current[idx], showLabel: val };
                                        setFormData({ ...formData, linkedFeatures: current });
                                    }
                                }}
                                className="data-[state=checked]:bg-indigo-600"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Usage Limit (Unit Count)</Label>
                            <Input 
                                type="number"
                                placeholder="e.g. 10"
                                value={formData.linkedFeatures?.find((lf: any) => (lf.featureId === limitEditingFeature?.id) || (lf.tag === limitEditingFeature?.tag && limitEditingFeature?.tag))?.limitValue || ""}
                                onChange={(e) => {
                                    const current = [...(formData.linkedFeatures || [])];
                                    const idx = current.findIndex((lf: Record<string, any>) => (lf.featureId === limitEditingFeature?.id) || (lf.tag === limitEditingFeature?.tag && limitEditingFeature?.tag));
                                    if (idx > -1) {
                                        current[idx] = { ...current[idx], limitValue: e.target.value };
                                        setFormData({ ...formData, linkedFeatures: current });
                                    }
                                }}
                                className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 font-black"
                            />
                            <p className="text-[9px] text-slate-400 font-medium">Leave empty for unlimited access within this feature.</p>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Setup Limit / Cost Override (NGN)</Label>
                            <Input 
                                type="number"
                                placeholder="e.g. 5000"
                                value={formData.linkedFeatures?.find((lf: any) => (lf.featureId === limitEditingFeature?.id) || (lf.tag === limitEditingFeature?.tag && limitEditingFeature?.tag))?.setupLimit || ""}
                                onChange={(e) => {
                                    const current = [...(formData.linkedFeatures || [])];
                                    const idx = current.findIndex((lf: Record<string, any>) => (lf.featureId === limitEditingFeature?.id) || (lf.tag === limitEditingFeature?.tag && limitEditingFeature?.tag));
                                    if (idx > -1) {
                                        current[idx] = { ...current[idx], setupLimit: e.target.value };
                                        setFormData({ ...formData, linkedFeatures: current });
                                    }
                                }}
                                className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 font-black"
                            />
                            <p className="text-[9px] text-slate-400 font-medium">Additional one-time setup fee or credit limit for this entitlement.</p>
                        </div>

                        <Button 
                            onClick={() => setLimitEditingFeature(null)}
                            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl py-6 font-black uppercase tracking-widest text-[10px]"
                        >
                            Confirm Parameters
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Dialog>
    )
}

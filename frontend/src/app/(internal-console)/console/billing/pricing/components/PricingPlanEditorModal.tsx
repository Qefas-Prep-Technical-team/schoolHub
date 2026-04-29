"use client"

import { useState, useEffect } from "react"
import { useSavePricingPlan } from "@/lib/api/hooks/usePricingManagement"
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
    RefreshCcw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

interface PricingPlanEditorModalProps {
    plan: any
    isOpen: boolean
    onClose: () => void
}

export default function PricingPlanEditorModal({ plan, isOpen, onClose }: PricingPlanEditorModalProps) {
    const savePlan = useSavePricingPlan()
    const [formData, setFormData] = useState<any>(null)

    useEffect(() => {
        if (plan) {
            setFormData({
                ...plan,
                monthlyPrice: plan.pricing?.monthly ?? '',
                yearlyPrice: plan.pricing?.yearly ?? '',
                features: plan.features || [],
                maxStudents: plan.maxStudents ?? '',
                maxStorageGb: plan.maxStorageGb ?? '',
                trialDays: plan.trialDays ?? '',
                name: plan.name ?? '',
                description: plan.description ?? '',
                isPopular: plan.isPopular ?? false,
                hasTrial: plan.hasTrial ?? false
            })
        }
    }, [plan])

    if (!formData) return null

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...formData.features]
        newFeatures[index] = value
        setFormData({ ...formData, features: newFeatures })
    }

    const addFeature = () => {
        setFormData({ ...formData, features: [...formData.features, ""] })
    }

    const removeFeature = (index: number) => {
        setFormData({ ...formData, features: formData.features.filter((_: any, i: number) => i !== index) })
    }

    const handleSubmit = async () => {
        const { pricing, tabs, storage, ...cleanData } = formData;
        const payload = {
            ...cleanData,
            monthlyPrice: Number(formData.monthlyPrice) || 0,
            yearlyPrice: Number(formData.yearlyPrice) || 0,
            maxStudents: Number(formData.maxStudents) || 0,
            maxStorageGb: Number(formData.maxStorageGb) || 0,
            trialDays: Number(formData.trialDays) || 0,
        }
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

                    {/* Features List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                <Layers size={14} className="text-indigo-500" /> Feature Manifest
                            </h3>
                            <Button variant="ghost" size="sm" onClick={addFeature} className="text-indigo-500 hover:text-indigo-600 font-black text-[10px] uppercase gap-1">
                                <Plus size={12} /> Add Feature
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.features?.map((feat: string, i: number) => (
                                <div key={i} className="flex gap-2 group">
                                    <Input 
                                        value={feat || ""} 
                                        onChange={(e) => handleFeatureChange(i, e.target.value)}
                                        className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 font-medium"
                                    />
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => removeFeature(i)}
                                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            ))}
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
        </Dialog>
    )
}

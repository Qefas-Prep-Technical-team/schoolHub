"use client"

import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface AddFeatureModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (feature: any) => void
    isSaving: boolean
}

export default function AddFeatureModal({ 
    isOpen, 
    onClose, 
    onSave, 
    isSaving 
}: AddFeatureModalProps) {
    const [newFeature, setNewFeature] = useState({ 
        name: "", 
        tag: "", 
        description: "", 
        marketingLabel: "", 
        category: "GENERAL" 
    })

    const handleSave = () => {
        onSave(newFeature)
        setNewFeature({ 
            name: "", 
            tag: "", 
            description: "", 
            marketingLabel: "", 
            category: "GENERAL" 
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 max-w-lg shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Register New Feature</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Category</Label>
                        <select 
                            className="flex h-12 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
                            value={newFeature.category}
                            onChange={(e) => setNewFeature({...newFeature, category: e.target.value})}
                        >
                            <option value="GENERAL">General Platform</option>
                            <option value="STUDENT">Student Features</option>
                            <option value="TEACHER">Teacher Features</option>
                            <option value="PARENT">Parent Features</option>
                            <option value="ADMIN">Administrator Features</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Feature Name</Label>
                        <Input 
                            placeholder="e.g. AI-Powered Analytics" 
                            value={newFeature.name}
                            onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                            className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Feature Tag (Unique Key)</Label>
                        <Input 
                            placeholder="e.g. ai_analytics" 
                            value={newFeature.tag}
                            onChange={(e) => setNewFeature({ ...newFeature, tag: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                            className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 font-mono font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Marketing Label (Optional)</Label>
                        <Input 
                            placeholder="Public text on pricing cards" 
                            value={newFeature.marketingLabel}
                            onChange={(e) => setNewFeature({ ...newFeature, marketingLabel: e.target.value })}
                            className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Description</Label>
                        <Input 
                            placeholder="What does this feature enable?" 
                            value={newFeature.description}
                            onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                            className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 font-medium"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold px-8">Cancel</Button>
                    <Button 
                        onClick={handleSave}
                        disabled={!newFeature.name || !newFeature.tag || isSaving}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-10 py-6 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-600/20 h-14"
                    >
                        Confirm Registration
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

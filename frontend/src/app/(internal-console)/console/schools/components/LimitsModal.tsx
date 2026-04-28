"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUpdateSchoolLimits } from "@/lib/api/hooks/usePlatformSchools"
import { 
    Users as UsersIcon, 
    BookOpen as BookOpenIcon, 
    Presentation as PresentationIcon, 
    HardDrive as HardDriveIcon, 
    ShieldCheck as ShieldCheckIcon 
} from "lucide-react"

interface LimitsModalProps {
    isOpen: boolean
    onClose: () => void
    school: any
}

export function LimitsModal({ isOpen, onClose, school }: LimitsModalProps) {
    const updateLimits = useUpdateSchoolLimits()
    const [formData, setFormData] = useState({
        maxStudents: "",
        maxExams: "",
        maxClasses: "",
        maxStorageGb: ""
    })

    useEffect(() => {
        if (school) {
            setFormData({
                maxStudents: school.maxStudentsOverride?.toString() || "",
                maxExams: school.maxExamsOverride?.toString() || "",
                maxClasses: school.maxClassesOverride?.toString() || "",
                maxStorageGb: school.maxStorageGbOverride?.toString() || ""
            })
        }
    }, [school])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await updateLimits.mutateAsync({
            id: school.id,
            limits: formData
        })
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-slate-200 rounded-[2rem]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-white flex items-center gap-2">
                        <ShieldCheckIcon className="text-indigo-400" />
                        Infrastructure Quota
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium pt-1">
                        Manual capacity override for <span className="text-white font-bold">{school?.name}</span>. Leave blank to use default plan limits.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <UsersIcon size={12} className="text-indigo-400" />
                                Max Students
                            </Label>
                            <Input 
                                type="number" 
                                value={formData.maxStudents}
                                onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                                className="bg-slate-950 border-slate-800 rounded-xl h-12"
                                placeholder="e.g. 500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <BookOpenIcon size={12} className="text-indigo-400" />
                                Max Exams
                            </Label>
                            <Input 
                                type="number" 
                                value={formData.maxExams}
                                onChange={(e) => setFormData({ ...formData, maxExams: e.target.value })}
                                className="bg-slate-950 border-slate-800 rounded-xl h-12"
                                placeholder="e.g. 100"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <PresentationIcon size={12} className="text-indigo-400" />
                                Max Classes
                            </Label>
                            <Input 
                                type="number" 
                                value={formData.maxClasses}
                                onChange={(e) => setFormData({ ...formData, maxClasses: e.target.value })}
                                className="bg-slate-950 border-slate-800 rounded-xl h-12"
                                placeholder="e.g. 50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <HardDriveIcon size={12} className="text-indigo-400" />
                                Storage (GB)
                            </Label>
                            <Input 
                                type="number" 
                                step="0.1" 
                                value={formData.maxStorageGb}
                                onChange={(e) => setFormData({ ...formData, maxStorageGb: e.target.value })}
                                className="bg-slate-950 border-slate-800 rounded-xl h-12"
                                placeholder="e.g. 5.0"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={onClose}
                            className="rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={updateLimits.isPending}
                            className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-8 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-600/20"
                        >
                            {updateLimits.isPending ? "Applying..." : "Sync Overrides"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

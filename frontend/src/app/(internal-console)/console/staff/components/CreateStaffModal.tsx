"use client"

import { useState } from "react"
import { useCreateStaff } from "@/lib/api/hooks/usePlatformStaff"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Shield, User } from "lucide-react"

interface CreateStaffModalProps {
    isOpen: boolean
    onClose: () => void
}

export function CreateStaffModal({ isOpen, onClose }: CreateStaffModalProps) {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        role: ""
    })

    const createStaff = useCreateStaff()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await createStaff.mutateAsync(formData)
            onClose() // Close on success
            setFormData({ fullName: "", email: "", role: "" })
        } catch (error) {
            console.error("Failed to send invite", error)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white dark:bg-slate-900 border-none rounded-[2rem] shadow-2xl p-8 max-w-md">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">Provision Staff</DialogTitle>
                    <p className="text-sm font-medium text-slate-500 mt-2">Send an email invitation to a new staff member.</p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                            <User size={14} /> Full Name
                        </Label>
                        <Input 
                            required
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl h-12"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                            <Mail size={14} /> Work Email
                        </Label>
                        <Input 
                            type="email"
                            required
                            placeholder="john@qefashub.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl h-12"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                            <Shield size={14} /> Access Level
                        </Label>
                        <Select onValueChange={val => setFormData({ ...formData, role: val })} required>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl h-12">
                                <SelectValue placeholder="Select authorization role" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <SelectItem value="OWNER">Owner (Absolute Authorization)</SelectItem>
                                <SelectItem value="TECH_ADMIN">Tech Admin (System Visibility)</SelectItem>
                                <SelectItem value="FINANCE_ADMIN">Finance (Treasury Control)</SelectItem>
                                <SelectItem value="SUPPORT_AGENT">Support (Issue Resolution)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={createStaff.isPending}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] mt-4"
                    >
                        {createStaff.isPending ? "Generating Secure Link..." : "Send Secure Invite"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

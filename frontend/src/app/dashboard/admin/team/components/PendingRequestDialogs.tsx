"use client"

import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ROLE_OPTIONS, type ApprovableRole, type PendingAdmin } from "./teamRoleConfig"

interface ApproveAdminDialogProps {
    member: PendingAdmin | null
    selectedRole: ApprovableRole
    isApproving: boolean
    onRoleChange: (role: ApprovableRole) => void
    onClose: () => void
    onConfirm: (adminId: string, role: ApprovableRole) => void
}

export function ApproveAdminDialog({
    member,
    selectedRole,
    isApproving,
    onRoleChange,
    onClose,
    onConfirm,
}: ApproveAdminDialogProps) {
    return (
        <Dialog open={!!member} onOpenChange={onClose}>
            <DialogContent className="w-[95%] sm:max-w-md rounded-3xl p-6">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-11 rounded-2xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <CheckCircle2 size={22} />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                                Approve Staff Request
                            </DialogTitle>
                            <p className="text-xs text-slate-400 font-medium">Assign System Governance Role</p>
                        </div>
                    </div>
                    <DialogDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                        You are granting dashboard access to{" "}
                        <strong className="text-slate-900 dark:text-white">{member?.name}</strong> (
                        <span className="font-mono text-xs">{member?.email}</span>). Select the organizational role they
                        will hold:
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 py-2">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Select Administrative Role
                    </label>
                    <Select value={selectedRole} onValueChange={(v) => onRoleChange(v as ApprovableRole)}>
                        <SelectTrigger className="w-full rounded-2xl border-slate-200 dark:border-slate-800 h-12 bg-slate-50/50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 px-4">
                            <SelectValue>
                                <span className="font-bold text-sm text-slate-900 dark:text-white">
                                    {ROLE_OPTIONS.find((opt) => opt.value === selectedRole)?.label || "Select Role"}
                                </span>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 max-h-80">
                            {ROLE_OPTIONS.map((opt) => (
                                <SelectItem
                                    key={opt.value}
                                    value={opt.value}
                                    className="py-3 px-3 rounded-xl cursor-pointer focus:bg-blue-50 dark:focus:bg-blue-950/30 my-0.5"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <p className="font-bold text-sm text-slate-900 dark:text-white">{opt.label}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                                            {opt.description}
                                        </p>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 mt-3">
                    <Button variant="outline" className="rounded-xl font-bold" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            if (member) {
                                onConfirm(member.id, selectedRole)
                            }
                        }}
                        disabled={isApproving}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold border-none shadow-sm gap-2"
                    >
                        {isApproving && <Loader2 size={14} className="animate-spin" />}
                        <span>{isApproving ? "Authorizing..." : "Authorize & Grant Access"}</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

interface RejectAdminDialogProps {
    member: PendingAdmin | null
    rejectReason: string
    isRejecting: boolean
    onReasonChange: (reason: string) => void
    onClose: () => void
    onConfirm: (adminId: string, reason?: string) => void
}

export function RejectAdminDialog({
    member,
    rejectReason,
    isRejecting,
    onReasonChange,
    onClose,
    onConfirm,
}: RejectAdminDialogProps) {
    return (
        <Dialog open={!!member} onOpenChange={onClose}>
            <DialogContent className="w-[95%] sm:max-w-md rounded-3xl p-6">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-11 rounded-2xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
                            <XCircle size={22} />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                                Decline Authorization Request
                            </DialogTitle>
                            <p className="text-xs text-slate-400 font-medium">Reject Join Application</p>
                        </div>
                    </div>
                    <DialogDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                        You are declining <strong className="text-slate-900 dark:text-white">{member?.name}</strong>
                        {"'s"} request to join the administrative team.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-1.5 py-2">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Reason for Declining (Optional)
                    </label>
                    <textarea
                        value={rejectReason}
                        onChange={(e) => onReasonChange(e.target.value)}
                        placeholder="e.g. Unverified staff member, please contact the principal's office..."
                        rows={3}
                        className="w-full text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 px-4 py-3 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 resize-none shadow-2xs"
                    />
                </div>

                <DialogFooter className="gap-2 sm:gap-0 mt-2">
                    <Button variant="outline" className="rounded-xl font-bold" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        className="rounded-xl font-bold gap-2"
                        onClick={() => {
                            if (member) {
                                onConfirm(member.id, rejectReason || undefined)
                            }
                        }}
                        disabled={isRejecting}
                    >
                        {isRejecting && <Loader2 size={14} className="animate-spin" />}
                        <span>{isRejecting ? "Declining..." : "Decline Request"}</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


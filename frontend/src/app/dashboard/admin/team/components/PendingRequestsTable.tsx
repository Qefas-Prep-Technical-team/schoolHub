"use client"

import { useState } from "react"
import { useApproveAdmin, useRejectAdmin, usePendingAdmins } from "@/lib/api/hooks/useAdmin"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { Clock, CheckCircle2, XCircle, Calendar, ShieldCheck, UserCheck, AlertCircle, Loader2 } from "lucide-react"
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
import { cn } from "@/lib/utils"

type ApprovableRole = "PRINCIPAL" | "REGISTRAR" | "ACCOUNTANT" | "SUPPORT"

interface PendingAdmin {
    id: string
    name: string
    email: string
    requestedAt: string
}

const ROLE_OPTIONS: { value: ApprovableRole; label: string; description: string; badgeColor: string }[] = [
    { 
        value: "PRINCIPAL", 
        label: "Principal", 
        description: "Full management authority — approves team requests & manages all operational branches",
        badgeColor: "text-violet-700 bg-violet-50 dark:text-violet-300 dark:bg-violet-950/40"
    },
    { 
        value: "REGISTRAR", 
        label: "Registrar", 
        description: "Academic controller — manages student rosters, teacher profiles, classes, and exams",
        badgeColor: "text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/40"
    },
    { 
        value: "ACCOUNTANT", 
        label: "Accountant", 
        description: "Financial administrator — manages school billing, invoices, fee collection, and records",
        badgeColor: "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40"
    },
    { 
        value: "SUPPORT", 
        label: "Support Staff", 
        description: "View-only administrative access — inspects statistics and provides helpdesk services",
        badgeColor: "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800"
    },
]

interface PendingRequestsTableProps {
    schoolId: string
    searchTerm: string
}

export default function PendingRequestsTable({ schoolId, searchTerm }: PendingRequestsTableProps) {
    const { user } = useAuthStore()
    const currentAdminRole = user?.adminRole
    const canApprove = currentAdminRole === "SCHOOL_OWNER" || currentAdminRole === "PRINCIPAL" || user?.role === "SCHOOL_OWNER"

    const { data, isLoading } = usePendingAdmins(schoolId)
    const { mutate: approveAdmin, isPending: isApproving } = useApproveAdmin(schoolId)
    const { mutate: rejectAdmin, isPending: isRejecting } = useRejectAdmin(schoolId)

    const [approveDialog, setApproveDialog] = useState<PendingAdmin | null>(null)
    const [rejectDialog, setRejectDialog] = useState<PendingAdmin | null>(null)
    const [selectedRole, setSelectedRole] = useState<ApprovableRole>("REGISTRAR")
    const [rejectReason, setRejectReason] = useState("")

    const rawPending = data?.data || []
    const pending: PendingAdmin[] = rawPending.filter((m: PendingAdmin) =>
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-18 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
                ))}
            </div>
        )
    }

    if (pending.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="size-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                    <CheckCircle2 size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    {searchTerm ? "No matching pending requests" : "No pending requests"}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                    {searchTerm 
                        ? `No applicants matched "${searchTerm}".` 
                        : "All authorization requests have been handled. New join requests will appear here for review."}
                </p>
            </div>
        )
    }

    return (
        <>
            {/* ── Mobile View (< 768px): Responsive Cards ─────────────────────── */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
                {pending.map((member) => (
                    <div key={member.id} className="p-4 space-y-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        {/* Applicant Identity */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <img
                                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=64748b&fontFamily=Arial&fontSize=40`}
                                    alt={member.name}
                                    className="size-11 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-2xs grayscale opacity-80 shrink-0"
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                        {member.name}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono mt-0.5">
                                        {member.email}
                                    </p>
                                </div>
                            </div>

                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 shrink-0">
                                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Pending
                            </span>
                        </div>

                        {/* Request Timestamp */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                            <Calendar size={13} />
                            <span>
                                Requested on {member.requestedAt
                                    ? new Date(member.requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                    : "Recently"}
                            </span>
                        </div>

                        {/* Action Buttons */}
                        {canApprove && (
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setApproveDialog(member)
                                        setSelectedRole("REGISTRAR")
                                    }}
                                    className="flex-1 h-10 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm gap-1.5"
                                >
                                    <CheckCircle2 size={14} />
                                    <span>Approve & Assign</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setRejectDialog(member)
                                        setRejectReason("")
                                    }}
                                    className="h-10 px-4 rounded-xl text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-950/30 gap-1.5"
                                >
                                    <XCircle size={14} />
                                    <span>Reject</span>
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ── Desktop View (>= 768px): Structured Table ─────────────────────── */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                            <th className="text-left text-[11px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Applicant</th>
                            <th className="text-left text-[11px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Requested On</th>
                            <th className="text-left text-[11px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Status</th>
                            {canApprove && (
                                <th className="text-right text-[11px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {pending.map((member) => (
                            <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3.5">
                                        <img
                                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=64748b&fontFamily=Arial&fontSize=40`}
                                            alt={member.name}
                                            className="size-10 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-2xs grayscale opacity-75 shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                {member.name}
                                            </p>
                                            <p className="text-xs text-slate-400 truncate font-mono mt-0.5">{member.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-semibold text-slate-500">
                                        {member.requestedAt
                                            ? new Date(member.requestedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                                            : "—"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
                                        <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                                        Pending Review
                                    </span>
                                </td>
                                {canApprove && (
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setApproveDialog(member)
                                                    setSelectedRole("REGISTRAR")
                                                }}
                                                className="h-8 px-3.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-2xs gap-1.5"
                                            >
                                                <CheckCircle2 size={13} />
                                                <span>Approve</span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    setRejectDialog(member)
                                                    setRejectReason("")
                                                }}
                                                className="h-8 px-3 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl gap-1.5"
                                            >
                                                <XCircle size={13} />
                                                <span>Reject</span>
                                            </Button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Approve Request Modal ─────────────────────────────────────────── */}
            <Dialog open={!!approveDialog} onOpenChange={() => setApproveDialog(null)}>
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
                            You are granting dashboard access to <strong className="text-slate-900 dark:text-white">{approveDialog?.name}</strong> (<span className="font-mono text-xs">{approveDialog?.email}</span>). Select the organizational role they will hold:
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 py-2">
                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                            Select Administrative Role
                        </label>
                        <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as ApprovableRole)}>
                            <SelectTrigger className="w-full rounded-2xl border-slate-200 dark:border-slate-800 h-12 bg-slate-50/50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 px-4">
                                <SelectValue>
                                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                                        {ROLE_OPTIONS.find(opt => opt.value === selectedRole)?.label || "Select Role"}
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
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{opt.description}</p>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 mt-3">
                        <Button variant="outline" className="rounded-xl font-bold" onClick={() => setApproveDialog(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (approveDialog) {
                                    approveAdmin(
                                        { adminId: approveDialog.id, role: selectedRole },
                                        { onSuccess: () => setApproveDialog(null) }
                                    )
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

            {/* ── Reject Request Modal ──────────────────────────────────────────── */}
            <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
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
                            You are declining <strong className="text-slate-900 dark:text-white">{rejectDialog?.name}</strong>{"'s"} request to join the administrative team.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-1.5 py-2">
                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                            Reason for Declining (Optional)
                        </label>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g. Unverified staff member, please contact the principal's office..."
                            rows={3}
                            className="w-full text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 px-4 py-3 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 resize-none shadow-2xs"
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <Button variant="outline" className="rounded-xl font-bold" onClick={() => setRejectDialog(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="rounded-xl font-bold gap-2"
                            onClick={() => {
                                if (rejectDialog) {
                                    rejectAdmin(
                                        { adminId: rejectDialog.id, reason: rejectReason || undefined },
                                        { onSuccess: () => setRejectDialog(null) }
                                    )
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
        </>
    )
}

"use client"

import { useState } from "react"
import { useApproveAdmin, useRejectAdmin, usePendingAdmins } from "@/lib/api/hooks/useAdmin"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { Clock, CheckCircle, XCircle, ChevronDown } from "lucide-react"
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

type ApprovableRole = "PRINCIPAL" | "REGISTRAR" | "ACCOUNTANT" | "SUPPORT"

interface PendingAdmin {
    id: string
    name: string
    email: string
    requestedAt: string
}

const ROLE_OPTIONS: { value: ApprovableRole; label: string; description: string }[] = [
    { value: "PRINCIPAL", label: "Principal", description: "Can approve/reject admins, manage all school operations" },
    { value: "REGISTRAR", label: "Registrar", description: "Manages teachers, students, classes, exams" },
    { value: "ACCOUNTANT", label: "Accountant", description: "Manages finance, billing, and transactions" },
    { value: "SUPPORT", label: "Support", description: "View-only access to dashboard and stats" },
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

    const pending: PendingAdmin[] = (data?.data || []).filter((m: PendingAdmin) =>
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="p-8 space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ))}
            </div>
        )
    }

    if (pending.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle className="text-slate-300 dark:text-slate-600 mb-4" size={48} />
                <p className="text-slate-500 font-medium">No pending requests</p>
                <p className="text-slate-400 text-sm mt-1">New join requests will appear here for review</p>
            </div>
        )
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Applicant</th>
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Requested</th>
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Status</th>
                            {canApprove && (
                                <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {pending.map((member) => (
                            <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=64748b&fontFamily=Arial&fontSize=40`}
                                            alt={member.name}
                                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 grayscale opacity-70"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{member.name}</p>
                                            <p className="text-xs text-slate-400">{member.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-slate-500">
                                        {member.requestedAt
                                            ? new Date(member.requestedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                                            : "—"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20">
                                        <Clock size={11} />
                                        Pending Review
                                    </span>
                                </td>
                                {canApprove && (
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setApproveDialog(member)
                                                    setSelectedRole("REGISTRAR")
                                                }}
                                                className="h-8 px-3 text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white border-none rounded-lg"
                                            >
                                                <CheckCircle size={13} className="mr-1.5" />
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    setRejectDialog(member)
                                                    setRejectReason("")
                                                }}
                                                className="h-8 px-3 text-xs font-semibold text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            >
                                                <XCircle size={13} className="mr-1.5" />
                                                Reject
                                            </Button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Approve Dialog */}
            <Dialog open={!!approveDialog} onOpenChange={() => setApproveDialog(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <CheckCircle className="text-blue-600 dark:text-blue-400" size={20} />
                            </div>
                            <DialogTitle>Approve Admin Request</DialogTitle>
                        </div>
                        <DialogDescription className="text-sm text-slate-500">
                            You are approving <strong className="text-slate-800 dark:text-slate-200">{approveDialog?.name}</strong>. Select the role to assign them.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assign Role</label>
                        <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as ApprovableRole)}>
                            <SelectTrigger className="w-full rounded-xl border-slate-200 dark:border-slate-700 h-12 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 px-4">
                                <SelectValue>
                                    <span className="font-medium text-sm text-slate-800 dark:text-slate-200">
                                        {ROLE_OPTIONS.find(opt => opt.value === selectedRole)?.label || "Select Role"}
                                    </span>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden p-1">
                                {ROLE_OPTIONS.map((opt) => (
                                    <SelectItem 
                                        key={opt.value} 
                                        value={opt.value}
                                        className="py-3 px-3 rounded-lg cursor-pointer focus:bg-blue-50 dark:focus:bg-blue-900/20"
                                    >
                                        <div className="flex flex-col gap-0.5 ml-1">
                                            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{opt.label}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{opt.description}</p>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setApproveDialog(null)}>Cancel</Button>
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
                            className="bg-blue-500 hover:bg-blue-600 text-white border-none"
                        >
                            {isApproving ? "Approving..." : "Approve & Assign Role"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <XCircle className="text-red-600 dark:text-red-400" size={20} />
                            </div>
                            <DialogTitle>Reject Admin Request</DialogTitle>
                        </div>
                        <DialogDescription className="text-sm text-slate-500">
                            You are rejecting <strong className="text-slate-800 dark:text-slate-200">{rejectDialog?.name}</strong>{"'s"} request. Optionally provide a reason.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 py-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason (Optional)</label>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g. Unrecognized applicant, please contact support..."
                            rows={3}
                            className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none"
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setRejectDialog(null)}>Cancel</Button>
                        <Button
                            variant="destructive"
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
                            {isRejecting ? "Rejecting..." : "Reject Request"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

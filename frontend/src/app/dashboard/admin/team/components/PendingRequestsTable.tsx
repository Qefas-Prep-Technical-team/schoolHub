"use client"

import { useState, useMemo } from "react"
import { useApproveAdmin, useRejectAdmin, usePendingAdmins } from "@/lib/api/hooks/useAdmin"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { CheckCircle2, XCircle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ApprovableRole, PendingAdmin } from "./teamRoleConfig"
import { ApproveAdminDialog, RejectAdminDialog } from "./PendingRequestDialogs"

interface PendingRequestsTableProps {
    schoolId: string
    searchTerm: string
}

export default function PendingRequestsTable({ schoolId, searchTerm }: PendingRequestsTableProps) {
    const { user } = useAuthStore()
    const currentAdminRole = user?.adminRole
    const canApprove =
        currentAdminRole === "SCHOOL_OWNER" ||
        currentAdminRole === "PRINCIPAL" ||
        user?.role === "SCHOOL_OWNER" ||
        user?.role === "SUPER_ADMIN"

    const { data, isLoading } = usePendingAdmins(schoolId)
    const { mutate: approveAdmin, isPending: isApproving } = useApproveAdmin(schoolId)
    const { mutate: rejectAdmin, isPending: isRejecting } = useRejectAdmin(schoolId)

    const [approveDialog, setApproveDialog] = useState<PendingAdmin | null>(null)
    const [rejectDialog, setRejectDialog] = useState<PendingAdmin | null>(null)
    const [selectedRole, setSelectedRole] = useState<ApprovableRole>("REGISTRAR")
    const [rejectReason, setRejectReason] = useState("")

    const pending: PendingAdmin[] = useMemo(() => {
        const rawPending = (data?.data || []) as PendingAdmin[]
        return rawPending.filter(
            (m) =>
                m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [data?.data, searchTerm])

    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="h-18 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 animate-pulse flex items-center justify-between p-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-2xl bg-slate-300/80 dark:bg-slate-700" />
                            <div className="space-y-1.5">
                                <div className="h-4 w-32 rounded-md bg-slate-300/80 dark:bg-slate-700" />
                                <div className="h-3 w-44 rounded-md bg-slate-200/90 dark:bg-slate-800" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-20 rounded-xl bg-slate-300/70 dark:bg-slate-700" />
                            <div className="h-8 w-20 rounded-xl bg-slate-200/90 dark:bg-slate-800" />
                        </div>
                    </div>
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
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <img
                                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=64748b&fontFamily=Arial&fontSize=40`}
                                    alt={member.name}
                                    className="size-11 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-2xs grayscale opacity-80 shrink-0"
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{member.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono mt-0.5">{member.email}</p>
                                </div>
                            </div>

                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 shrink-0">
                                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Pending
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                            <Calendar size={13} />
                            <span>
                                Requested on{" "}
                                {member.requestedAt
                                    ? new Date(member.requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                    : "Recently"}
                            </span>
                        </div>

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
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{member.name}</p>
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

            <ApproveAdminDialog
                member={approveDialog}
                selectedRole={selectedRole}
                isApproving={isApproving}
                onRoleChange={setSelectedRole}
                onClose={() => setApproveDialog(null)}
                onConfirm={(adminId, role) =>
                    approveAdmin(
                        { adminId, role },
                        { onSuccess: () => setApproveDialog(null) }
                    )
                }
            />

            <RejectAdminDialog
                member={rejectDialog}
                rejectReason={rejectReason}
                isRejecting={isRejecting}
                onReasonChange={setRejectReason}
                onClose={() => setRejectDialog(null)}
                onConfirm={(adminId, reason) =>
                    rejectAdmin(
                        { adminId, reason },
                        { onSuccess: () => setRejectDialog(null) }
                    )
                }
            />
        </>
    )
}

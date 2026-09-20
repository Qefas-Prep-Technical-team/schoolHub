"use client"

import { useState } from "react"
import { useSchoolAdmins, useUpdateAdminRole, useTransferOwnership, useRemoveAdmin } from "@/lib/api/hooks/useAdmin"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import {
    MoreHorizontal, Shield, Crown, UserCheck, BookOpen, Calculator, HeadphonesIcon,
    AlertTriangle, Trash2, RefreshCw, ChevronDown
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AdminRole = "SCHOOL_OWNER" | "PRINCIPAL" | "REGISTRAR" | "ACCOUNTANT" | "SUPPORT"

interface AdminMember {
    id: string
    name: string
    email: string
    role: AdminRole
    joinedAt: string
    profileImage?: string
}

const ROLE_CONFIG: Record<AdminRole, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    SCHOOL_OWNER: { label: "School Owner", icon: Crown, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
    PRINCIPAL: { label: "Principal", icon: Shield, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/20" },
    REGISTRAR: { label: "Registrar", icon: UserCheck, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
    ACCOUNTANT: { label: "Accountant", icon: Calculator, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    SUPPORT: { label: "Support", icon: HeadphonesIcon, color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-900/20" },
}

const ASSIGNABLE_ROLES: AdminRole[] = ["PRINCIPAL", "REGISTRAR", "ACCOUNTANT", "SUPPORT"]

interface ActiveMembersTableProps {
    schoolId: string
    searchTerm: string
}

export default function ActiveMembersTable({ schoolId, searchTerm }: ActiveMembersTableProps) {
    const { user } = useAuthStore()
    const currentAdminRole = user?.adminRole as AdminRole | undefined
    const isOwner = currentAdminRole === "SCHOOL_OWNER" || user?.role === "SCHOOL_OWNER"

    const { data, isLoading } = useSchoolAdmins(schoolId)
    const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateAdminRole(schoolId)
    const { mutate: transferOwnership, isPending: isTransferring } = useTransferOwnership(schoolId)
    const { mutate: removeAdmin, isPending: isRemoving } = useRemoveAdmin(schoolId)

    const [confirmTransfer, setConfirmTransfer] = useState<AdminMember | null>(null)
    const [confirmRemove, setConfirmRemove] = useState<AdminMember | null>(null)

    const members: AdminMember[] = (data?.data || []).map((m: any) => ({
        ...m,
        role: m.adminRole || m.role
    })).filter((m: AdminMember) =>
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.role?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="p-8 space-y-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ))}
            </div>
        )
    }

    if (members.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Shield className="text-slate-300 dark:text-slate-600 mb-4" size={48} />
                <p className="text-slate-500 font-medium">No active members found</p>
                <p className="text-slate-400 text-sm mt-1">Approved team members will appear here</p>
            </div>
        )
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Member</th>
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Role</th>
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Joined</th>
                            {isOwner && (
                                <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {members.map((member) => {
                            const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.SUPPORT
                            const RoleIcon = roleConfig.icon
                            const isCurrentUser = member.email === user?.email
                            const isThisOwner = member.role === "SCHOOL_OWNER"

                            return (
                                <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative shrink-0">
                                                <img
                                                    src={member.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=2563eb&fontFamily=Arial&fontSize=40`}
                                                    alt={member.name}
                                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
                                                />
                                                {isThisOwner && (
                                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                                                        <Crown size={9} className="text-white" />
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                                                    {member.name}
                                                    {isCurrentUser && (
                                                        <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">You</span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-slate-400">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", roleConfig.color, roleConfig.bg)}>
                                            <RoleIcon size={11} />
                                            {roleConfig.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-500">
                                            {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                                        </span>
                                    </td>
                                    {isOwner && (
                                        <td className="px-6 py-4 text-right">
                                            {!isCurrentUser && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                                            <MoreHorizontal size={16} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-52">
                                                        {!isThisOwner && ASSIGNABLE_ROLES.map((role) => (
                                                            role !== member.role && (
                                                                <DropdownMenuItem
                                                                    key={role}
                                                                    onClick={() => updateRole({ adminId: member.id, role })}
                                                                    disabled={isUpdatingRole}
                                                                    className="text-sm"
                                                                >
                                                                    <RefreshCw size={13} className="mr-2 text-slate-400" />
                                                                    Change to {ROLE_CONFIG[role].label}
                                                                </DropdownMenuItem>
                                                            )
                                                        ))}
                                                        {!isThisOwner && <DropdownMenuSeparator />}
                                                        {!isThisOwner && (
                                                            <DropdownMenuItem
                                                                onClick={() => setConfirmTransfer(member)}
                                                                className="text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-900/20"
                                                            >
                                                                <Crown size={13} className="mr-2" />
                                                                Transfer Ownership
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => setConfirmRemove(member)}
                                                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                                                        >
                                                            <Trash2 size={13} className="mr-2" />
                                                            Remove from Team
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Transfer Ownership Confirm Dialog */}
            <Dialog open={!!confirmTransfer} onOpenChange={() => setConfirmTransfer(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Crown className="text-amber-600 dark:text-amber-400" size={20} />
                            </div>
                            <DialogTitle>Transfer School Ownership</DialogTitle>
                        </div>
                        <DialogDescription className="text-sm text-slate-500 leading-relaxed">
                            You are about to transfer full school ownership to <strong className="text-slate-800 dark:text-slate-200">{confirmTransfer?.name}</strong>. This will demote you to <strong>Principal</strong> and cannot be undone without their cooperation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30">
                        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                        <p className="text-xs text-amber-700 dark:text-amber-400">This action is irreversible unless the new owner transfers it back to you.</p>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setConfirmTransfer(null)}>Cancel</Button>
                        <Button
                            onClick={() => {
                                if (confirmTransfer) {
                                    transferOwnership(confirmTransfer.id)
                                    setConfirmTransfer(null)
                                }
                            }}
                            disabled={isTransferring}
                            className="bg-amber-500 hover:bg-amber-600 text-white border-none"
                        >
                            {isTransferring ? "Transferring..." : "Yes, Transfer Ownership"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Remove Admin Confirm Dialog */}
            <Dialog open={!!confirmRemove} onOpenChange={() => setConfirmRemove(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <Trash2 className="text-red-600 dark:text-red-400" size={20} />
                            </div>
                            <DialogTitle>Remove Team Member</DialogTitle>
                        </div>
                        <DialogDescription className="text-sm text-slate-500 leading-relaxed">
                            Are you sure you want to remove <strong className="text-slate-800 dark:text-slate-200">{confirmRemove?.name}</strong> from the team? They will immediately lose access to the dashboard.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setConfirmRemove(null)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (confirmRemove) {
                                    removeAdmin(confirmRemove.id)
                                    setConfirmRemove(null)
                                }
                            }}
                            disabled={isRemoving}
                        >
                            {isRemoving ? "Removing..." : "Yes, Remove Member"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

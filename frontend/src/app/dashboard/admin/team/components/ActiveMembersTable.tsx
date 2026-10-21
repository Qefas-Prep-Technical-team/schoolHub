"use client"

import { useState } from "react"
import { useSchoolAdmins, useUpdateAdminRole, useTransferOwnership, useRemoveAdmin } from "@/lib/api/hooks/useAdmin"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import {
    MoreHorizontal, Shield, Crown, UserCheck, BookOpen, Calculator, HeadphonesIcon,
    AlertTriangle, Trash2, RefreshCw, Calendar, Mail, User, ShieldAlert
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

const ROLE_CONFIG: Record<AdminRole, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
    SCHOOL_OWNER: { 
        label: "School Owner", 
        icon: Crown, 
        color: "text-amber-700 dark:text-amber-300", 
        bg: "bg-amber-50 dark:bg-amber-950/40",
        border: "border-amber-200 dark:border-amber-900/50" 
    },
    PRINCIPAL: { 
        label: "Principal", 
        icon: Shield, 
        color: "text-violet-700 dark:text-violet-300", 
        bg: "bg-violet-50 dark:bg-violet-950/40",
        border: "border-violet-200 dark:border-violet-900/50" 
    },
    REGISTRAR: { 
        label: "Registrar", 
        icon: UserCheck, 
        color: "text-blue-700 dark:text-blue-300", 
        bg: "bg-blue-50 dark:bg-blue-950/40",
        border: "border-blue-200 dark:border-blue-900/50" 
    },
    ACCOUNTANT: { 
        label: "Accountant", 
        icon: Calculator, 
        color: "text-emerald-700 dark:text-emerald-300", 
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        border: "border-emerald-200 dark:border-emerald-900/50" 
    },
    SUPPORT: { 
        label: "Support", 
        icon: HeadphonesIcon, 
        color: "text-slate-700 dark:text-slate-300", 
        bg: "bg-slate-100 dark:bg-slate-800",
        border: "border-slate-200 dark:border-slate-700" 
    },
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

    const rawList = data?.data || []
    const members: AdminMember[] = rawList.map((m: any) => ({
        ...m,
        role: m.adminRole || m.role
    })).filter((m: AdminMember) =>
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.role?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 space-y-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-18 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
                ))}
            </div>
        )
    }

    if (members.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="size-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                    <Shield size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    {searchTerm ? "No matching team members" : "No active members found"}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                    {searchTerm 
                        ? `We couldn't find any team members matching "${searchTerm}". Try a different keyword.` 
                        : "Approved administrators and staff operators will appear here."}
                </p>
            </div>
        )
    }

    return (
        <>
            {/* ── Mobile View (< 768px): Responsive Member Cards ──────────────── */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
                {members.map((member) => {
                    const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.SUPPORT
                    const RoleIcon = roleConfig.icon
                    const isCurrentUser = member.email === user?.email
                    const isThisOwner = member.role === "SCHOOL_OWNER"
                    const avatarUrl = member.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=2563eb&fontFamily=Arial&fontSize=40`

                    return (
                        <div key={member.id} className="p-4 space-y-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            {/* Member Identity & Actions Menu */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative shrink-0">
                                        <img
                                            src={avatarUrl}
                                            alt={member.name}
                                            className="size-11 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-2xs"
                                        />
                                        {isThisOwner && (
                                            <span className="absolute -top-1 -right-1 size-4 bg-amber-400 rounded-full flex items-center justify-center shadow-xs">
                                                <Crown size={9} className="text-white" />
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                {member.name}
                                            </p>
                                            {isCurrentUser && (
                                                <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.2 rounded-md">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono mt-0.5">
                                            {member.email}
                                        </p>
                                    </div>
                                </div>

                                {/* Owner Action Controls */}
                                {isOwner && !isCurrentUser && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                                                aria-label="Member actions"
                                            >
                                                <MoreHorizontal size={17} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-200 dark:border-slate-800 p-1.5 shadow-xl">
                                            {!isThisOwner && ASSIGNABLE_ROLES.map((role) => (
                                                role !== member.role && (
                                                    <DropdownMenuItem
                                                        key={role}
                                                        onClick={() => updateRole({ adminId: member.id, role })}
                                                        disabled={isUpdatingRole}
                                                        className="text-xs font-semibold py-2 rounded-xl cursor-pointer"
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
                                                    className="text-xs font-semibold py-2 rounded-xl text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950/30 cursor-pointer"
                                                >
                                                    <Crown size={13} className="mr-2" />
                                                    Transfer Ownership
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => setConfirmRemove(member)}
                                                className="text-xs font-semibold py-2 rounded-xl text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30 cursor-pointer"
                                            >
                                                <Trash2 size={13} className="mr-2" />
                                                Remove from Team
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>

                            {/* Role & Joined Attributes Footer */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/40 text-xs">
                                <span className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border",
                                    roleConfig.color, roleConfig.bg, roleConfig.border
                                )}>
                                    <RoleIcon size={12} strokeWidth={2.5} />
                                    {roleConfig.label}
                                </span>

                                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                                    <Calendar size={12} />
                                    <span>
                                        {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* ── Desktop View (>= 768px): Structured Table ─────────────────────── */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                            <th className="text-left text-[11px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Member</th>
                            <th className="text-left text-[11px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Role</th>
                            <th className="text-left text-[11px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Joined Date</th>
                            {isOwner && (
                                <th className="text-right text-[11px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {members.map((member) => {
                            const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.SUPPORT
                            const RoleIcon = roleConfig.icon
                            const isCurrentUser = member.email === user?.email
                            const isThisOwner = member.role === "SCHOOL_OWNER"
                            const avatarUrl = member.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=2563eb&fontFamily=Arial&fontSize=40`

                            return (
                                <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3.5">
                                            <div className="relative shrink-0">
                                                <img
                                                    src={avatarUrl}
                                                    alt={member.name}
                                                    className="size-10 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-2xs"
                                                />
                                                {isThisOwner && (
                                                    <span className="absolute -top-1 -right-1 size-4 bg-amber-400 rounded-full flex items-center justify-center shadow-xs">
                                                        <Crown size={9} className="text-white" />
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                                                    {member.name}
                                                    {isCurrentUser && (
                                                        <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.2 rounded-md">
                                                            You
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-slate-400 truncate font-mono mt-0.5">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border",
                                            roleConfig.color, roleConfig.bg, roleConfig.border
                                        )}>
                                            <RoleIcon size={12} strokeWidth={2.5} />
                                            {roleConfig.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-semibold text-slate-500">
                                            {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                                        </span>
                                    </td>
                                    {isOwner && (
                                        <td className="px-6 py-4 text-right">
                                            {!isCurrentUser && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                            <MoreHorizontal size={16} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-52 rounded-2xl border-slate-200 dark:border-slate-800 p-1.5 shadow-xl">
                                                        {!isThisOwner && ASSIGNABLE_ROLES.map((role) => (
                                                            role !== member.role && (
                                                                <DropdownMenuItem
                                                                    key={role}
                                                                    onClick={() => updateRole({ adminId: member.id, role })}
                                                                    disabled={isUpdatingRole}
                                                                    className="text-xs font-semibold py-2 rounded-xl cursor-pointer"
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
                                                                className="text-xs font-semibold py-2 rounded-xl text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950/30 cursor-pointer"
                                                            >
                                                                <Crown size={13} className="mr-2" />
                                                                Transfer Ownership
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => setConfirmRemove(member)}
                                                            className="text-xs font-semibold py-2 rounded-xl text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30 cursor-pointer"
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

            {/* ── Transfer Ownership Confirmation Dialog ────────────────────────── */}
            <Dialog open={!!confirmTransfer} onOpenChange={() => setConfirmTransfer(null)}>
                <DialogContent className="w-[95%] sm:max-w-md rounded-3xl p-6">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-11 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <Crown size={22} />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                                    Transfer School Ownership
                                </DialogTitle>
                                <p className="text-xs text-slate-400 font-medium">Irreversible Administrative Handover</p>
                            </div>
                        </div>
                        <DialogDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                            You are about to transfer full school ownership to <strong className="text-slate-900 dark:text-white">{confirmTransfer?.name}</strong>. This will demote your account to <strong>Principal</strong> and cannot be undone without their cooperation.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-900/50">
                        <AlertTriangle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={16} />
                        <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-tight">
                            The new owner will gain authority to manage school billing, subscription tiers, and all team memberships.
                        </p>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <Button variant="outline" className="rounded-xl font-bold" onClick={() => setConfirmTransfer(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (confirmTransfer) {
                                    transferOwnership(confirmTransfer.id)
                                    setConfirmTransfer(null)
                                }
                            }}
                            disabled={isTransferring}
                            className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold border-none"
                        >
                            {isTransferring ? "Transferring..." : "Yes, Transfer Ownership"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Remove Admin Confirmation Dialog ──────────────────────────────── */}
            <Dialog open={!!confirmRemove} onOpenChange={() => setConfirmRemove(null)}>
                <DialogContent className="w-[95%] sm:max-w-md rounded-3xl p-6">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-11 rounded-2xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                <Trash2 size={22} />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                                    Remove Team Member
                                </DialogTitle>
                                <p className="text-xs text-slate-400 font-medium">Revoke Dashboard Access</p>
                            </div>
                        </div>
                        <DialogDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                            Are you sure you want to remove <strong className="text-slate-900 dark:text-white">{confirmRemove?.name}</strong> from the team? Their active sessions will be terminated and they will immediately lose dashboard access.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <Button variant="outline" className="rounded-xl font-bold" onClick={() => setConfirmRemove(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="rounded-xl font-bold"
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

"use client"

import { useState, useMemo } from "react"
import { useSchoolAdmins, useUpdateAdminRole, useTransferOwnership, useRemoveAdmin } from "@/lib/api/hooks/useAdmin"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { MoreHorizontal, Shield, Crown, Trash2, RefreshCw, Calendar } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ROLE_CONFIG, ASSIGNABLE_ROLES, type AdminRole, type AdminMember } from "./teamRoleConfig"
import { TransferOwnershipDialog, RemoveAdminDialog } from "./ActiveMemberDialogs"

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

    const members: AdminMember[] = useMemo(() => {
        const rawList = (data?.data || []) as AdminMember[]
        return rawList
            .map((m) => ({ ...m, role: (m.adminRole || m.role) as AdminRole }))
            .filter(
                (m) =>
                    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    m.role?.toLowerCase().includes(searchTerm.toLowerCase())
            )
    }, [data?.data, searchTerm])

    const getAvatarUrl = (m: AdminMember) =>
        m.profileImage ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name)}&backgroundColor=2563eb&fontFamily=Arial&fontSize=40`

    const formatDate = (date?: string) =>
        date ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"

    const renderActionsMenu = (member: AdminMember, isThisOwner: boolean, isMobile = false) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-8 w-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                        isMobile && "shrink-0"
                    )}
                    aria-label="Member actions"
                >
                    <MoreHorizontal size={isMobile ? 17 : 16} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className={cn("rounded-2xl border-slate-200 dark:border-slate-800 p-1.5 shadow-xl", isMobile ? "w-56" : "w-52")}
            >
                {!isThisOwner &&
                    ASSIGNABLE_ROLES.map(
                        (role) =>
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
                    )}
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
    )

    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 space-y-3">
                {[...Array(4)].map((_, i) => (
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
                        <div className="hidden sm:flex items-center gap-4">
                            <div className="h-6 w-24 rounded-xl bg-slate-300/70 dark:bg-slate-700" />
                            <div className="h-4 w-20 rounded-md bg-slate-200/90 dark:bg-slate-800" />
                        </div>
                    </div>
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

                    return (
                        <div key={member.id} className="p-4 space-y-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative shrink-0">
                                        <img src={getAvatarUrl(member)} alt={member.name} className="size-11 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-2xs" />
                                        {isThisOwner && (
                                            <span className="absolute -top-1 -right-1 size-4 bg-amber-400 rounded-full flex items-center justify-center shadow-xs">
                                                <Crown size={9} className="text-white" />
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{member.name}</p>
                                            {isCurrentUser && (
                                                <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.2 rounded-md">You</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono mt-0.5">{member.email}</p>
                                    </div>
                                </div>
                                {isOwner && !isCurrentUser && renderActionsMenu(member, isThisOwner, true)}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/40 text-xs">
                                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border", roleConfig.color, roleConfig.bg, roleConfig.border)}>
                                    <RoleIcon size={12} strokeWidth={2.5} />
                                    {roleConfig.label}
                                </span>
                                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                                    <Calendar size={12} />
                                    <span>{formatDate(member.joinedAt)}</span>
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
                            {isOwner && <th className="text-right text-[11px] font-black text-slate-400 uppercase tracking-widest px-6 py-4">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {members.map((member) => {
                            const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.SUPPORT
                            const RoleIcon = roleConfig.icon
                            const isCurrentUser = member.email === user?.email
                            const isThisOwner = member.role === "SCHOOL_OWNER"

                            return (
                                <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3.5">
                                            <div className="relative shrink-0">
                                                <img src={getAvatarUrl(member)} alt={member.name} className="size-10 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-2xs" />
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
                                                        <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.2 rounded-md">You</span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-slate-400 truncate font-mono mt-0.5">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border", roleConfig.color, roleConfig.bg, roleConfig.border)}>
                                            <RoleIcon size={12} strokeWidth={2.5} />
                                            {roleConfig.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-semibold text-slate-500">{formatDate(member.joinedAt)}</span>
                                    </td>
                                    {isOwner && (
                                        <td className="px-6 py-4 text-right">
                                            {!isCurrentUser && renderActionsMenu(member, isThisOwner, false)}
                                        </td>
                                    )}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <TransferOwnershipDialog
                member={confirmTransfer}
                isTransferring={isTransferring}
                onClose={() => setConfirmTransfer(null)}
                onConfirm={(adminId) => transferOwnership(adminId)}
            />

            <RemoveAdminDialog
                member={confirmRemove}
                isRemoving={isRemoving}
                onClose={() => setConfirmRemove(null)}
                onConfirm={(adminId) => removeAdmin(adminId)}
            />
        </>
    )
}

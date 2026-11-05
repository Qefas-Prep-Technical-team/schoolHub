"use client"

import { Crown, AlertTriangle, Trash2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { AdminMember } from "./teamRoleConfig"

interface TransferOwnershipDialogProps {
    member: AdminMember | null
    isTransferring: boolean
    onClose: () => void
    onConfirm: (adminId: string) => void
}

export function TransferOwnershipDialog({
    member,
    isTransferring,
    onClose,
    onConfirm,
}: TransferOwnershipDialogProps) {
    return (
        <Dialog open={!!member} onOpenChange={onClose}>
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
                        You are about to transfer full school ownership to{" "}
                        <strong className="text-slate-900 dark:text-white">{member?.name}</strong>. This will demote
                        your account to <strong>Principal</strong> and cannot be undone without their cooperation.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-900/50">
                    <AlertTriangle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-tight">
                        The new owner will gain authority to manage school billing, subscription tiers, and all team
                        memberships.
                    </p>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 mt-2">
                    <Button variant="outline" className="rounded-xl font-bold" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            if (member) {
                                onConfirm(member.id)
                                onClose()
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
    )
}

interface RemoveAdminDialogProps {
    member: AdminMember | null
    isRemoving: boolean
    onClose: () => void
    onConfirm: (adminId: string) => void
}

export function RemoveAdminDialog({
    member,
    isRemoving,
    onClose,
    onConfirm,
}: RemoveAdminDialogProps) {
    return (
        <Dialog open={!!member} onOpenChange={onClose}>
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
                        Are you sure you want to remove{" "}
                        <strong className="text-slate-900 dark:text-white">{member?.name}</strong> from the team? Their
                        active sessions will be terminated and they will immediately lose dashboard access.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-0 mt-2">
                    <Button variant="outline" className="rounded-xl font-bold" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        className="rounded-xl font-bold"
                        onClick={() => {
                            if (member) {
                                onConfirm(member.id)
                                onClose()
                            }
                        }}
                        disabled={isRemoving}
                    >
                        {isRemoving ? "Removing..." : "Yes, Remove Member"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


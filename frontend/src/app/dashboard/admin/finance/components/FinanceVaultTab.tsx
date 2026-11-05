"use client"

import React from "react"
import { format } from "date-fns"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Landmark, Plus, History, RefreshCw, Loader2, CheckCircle2, Trash2, ShieldCheck, Check, Copy } from "lucide-react"
import { FinanceSettlementAccount, BankAccountAudit } from "@/lib/api/services/financeService"
import { AtmAccountCard } from "../../components/AtmAccountCard"
import { cn } from "@/lib/utils"

interface FinanceVaultTabProps {
    accounts: FinanceSettlementAccount[]; bankAudits: BankAccountAudit[]; loadingAudits: boolean
    copiedAccount: string | null; setCopiedAccount: (id: string | null) => void
    currentUserName?: string; currentUserEmail?: string; currentUserRole?: string
    onOpenAddBankModal: () => void; onSync: (accountId?: string) => void; onRefreshAudits: () => void
}

export function FinanceVaultTab({
    accounts, bankAudits, loadingAudits, copiedAccount, setCopiedAccount,
    currentUserName, currentUserEmail, currentUserRole, onOpenAddBankModal, onSync, onRefreshAudits,
}: FinanceVaultTabProps) {
    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">School Bank Accounts</h3>
                        <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/40 text-[10px] font-black uppercase">
                            Direct Settlement
                        </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
                        Configure institutional settlement accounts where student tuition, exam payments, and transcript fees are directly deposited.
                    </p>
                </div>
                <Button
                    onClick={onOpenAddBankModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white h-11 px-5 rounded-2xl font-bold text-xs gap-2 shadow-md shadow-blue-600/20 dark:shadow-blue-900/30 transition-all cursor-pointer"
                >
                    <Plus size={16} />
                    Add Bank Account
                </Button>
            </div>

            {accounts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accounts.map((acc) => (
                        <AtmAccountCard
                            key={acc.id}
                            account={{
                                ...acc,
                                status: acc.status as "active" | "pending" | "unverified",
                            }}
                            onRefresh={(id) => onSync(id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-16 text-center space-y-4 shadow-sm">
                    <div className="size-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 mx-auto">
                        <Landmark size={40} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Bank Account Connected</h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            Set up your school bank account to enable automatic direct deposits from fee and transcript payments.
                        </p>
                    </div>
                    <Button
                        onClick={onOpenAddBankModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white font-bold text-xs px-6 rounded-2xl h-11 shadow-md shadow-blue-600/20 dark:shadow-blue-900/30 transition-all cursor-pointer"
                    >
                        Set Up Bank Account
                    </Button>
                </div>
            )}

            {/* BANK ACCOUNT AUDIT & PROCESSING HISTORY */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                    <div className="flex items-center gap-3">
                        <div className="size-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/50 dark:border-blue-800/40 shadow-sm">
                            <History size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Bank Account Processing & Audit History
                                </h4>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                                    {bankAudits.length} {bankAudits.length === 1 ? "Record" : "Records"}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                Immutable ledger recording who added, verified, or updated institutional settlement bank accounts.
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefreshAudits}
                        disabled={loadingAudits}
                        className="h-9 px-3.5 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold gap-1.5 self-start sm:self-auto cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                        <RefreshCw size={13} className={cn(loadingAudits && "animate-spin text-blue-600")} />
                        Refresh History
                    </Button>
                </div>

                {loadingAudits ? (
                    <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
                        <span className="text-xs font-bold uppercase tracking-wider">Loading Bank Audit History...</span>
                    </div>
                ) : bankAudits.length === 0 ? (
                    <div className="py-14 text-center space-y-3">
                        <div className="size-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                            <History size={26} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No Bank Activity History Recorded Yet</p>
                            <p className="text-xs text-slate-400 max-w-md mx-auto">
                                Whenever an administrator connects, verifies, or removes a school bank account, an immutable audit entry recording who performed it and when will appear here.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800/80">
                        <Table>
                            <TableHeader className="bg-slate-50/70 dark:bg-slate-800/40">
                                <TableRow className="border-b border-slate-100 dark:border-slate-800">
                                    <TableHead className="py-3.5 pl-5 text-slate-400 uppercase text-[10px] font-black tracking-wider">Date & Time</TableHead>
                                    <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Event / Action</TableHead>
                                    <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Bank & Account</TableHead>
                                    <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Beneficiary / Display Name</TableHead>
                                    <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Processed By (Who Added It)</TableHead>
                                    <TableHead className="pr-5 text-right text-slate-400 uppercase text-[10px] font-black tracking-wider">Gateway</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {bankAudits.map((audit) => {
                                    const auditDate = new Date(audit.createdAt)
                                    const isRecent = Date.now() - auditDate.getTime() < 1000 * 60 * 60 * 24
                                    const effectiveUserName =
                                        !audit.userName || audit.userName === "School Administrator" || audit.userName === "System Administrator"
                                            ? currentUserName || audit.userName || "Administrator"
                                            : audit.userName
                                    const effectiveUserEmail = audit.userEmail || (effectiveUserName === currentUserName ? currentUserEmail : null)
                                    const initials = (effectiveUserName || "Admin").substring(0, 2).toUpperCase()

                                    return (
                                        <TableRow key={audit.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <TableCell className="pl-5 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                        {format(auditDate, "MMM d, yyyy")}
                                                    </span>
                                                    <span className="text-[11px] font-medium text-slate-400">
                                                        {format(auditDate, "h:mm a")} {isRecent && <span className="text-blue-600 dark:text-blue-400 font-bold">• Recent</span>}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {audit.action === "ACCOUNT_ADDED" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                        <CheckCircle2 size={12} /> Bank Connected
                                                    </span>
                                                ) : audit.action === "ACCOUNT_DELETED" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                                        <Trash2 size={12} /> Account Removed
                                                    </span>
                                                ) : audit.action === "ACCOUNT_SYNCED" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                                        <RefreshCw size={12} /> Status Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                        <ShieldCheck size={12} /> {audit.action}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                        <Landmark size={13} className="text-blue-600 shrink-0" />
                                                        {audit.bankName || "Commercial Bank"}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[11px] font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400">
                                                            {audit.accountNumber || "N/A"}
                                                        </span>
                                                        {audit.accountNumber && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(audit.accountNumber!)
                                                                    setCopiedAccount(audit.id)
                                                                    setTimeout(() => setCopiedAccount(null), 2000)
                                                                    toast.success("Account number copied")
                                                                }}
                                                                className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                                title="Copy Account Number"
                                                            >
                                                                {copiedAccount === audit.id ? (
                                                                    <Check size={11} className="text-emerald-600" />
                                                                ) : (
                                                                    <Copy size={11} />
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    {audit.accountName || "School Beneficiary"}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="size-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-[11px] shrink-0 shadow-sm">
                                                        {initials}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                                            {effectiveUserName}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 pt-0.5">
                                                            <span className="text-[10px] px-1.5 py-0.2 rounded font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                                {audit.userRole || currentUserRole || "ADMIN"}
                                                            </span>
                                                            {effectiveUserEmail && (
                                                                <span className="text-[10px] text-slate-400 truncate max-w-[140px]" title={effectiveUserEmail}>
                                                                    {effectiveUserEmail}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="pr-5 text-right whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl">
                                                    <ShieldCheck size={12} className="text-blue-600" />
                                                    {audit.gateway || "FLUTTERWAVE"}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    )
}

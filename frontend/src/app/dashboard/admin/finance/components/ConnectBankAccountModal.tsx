"use client"

import React, { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Landmark, Zap, CheckCircle2, Loader2, Lock, AlertCircle, Building2, Mail } from "lucide-react"
import { financeService } from "@/lib/api/services/financeService"
import { cn } from "@/lib/utils"

interface ConnectBankAccountModalProps {
    open: boolean; onOpenChange: (open: boolean) => void
    schoolId: string; schoolDisplayName: string; schoolEmail: string
    currentUserName?: string; currentUserEmail?: string; currentUserRole?: string
    onSuccess: () => Promise<void>
}

export function ConnectBankAccountModal({
    open, onOpenChange, schoolId, schoolDisplayName, schoolEmail,
    currentUserName, currentUserEmail, currentUserRole, onSuccess,
}: ConnectBankAccountModalProps) {
    const [bankList, setBankList] = useState<Array<{ code: string; name: string }>>([])
    const [fetchingBankList, setFetchingBankList] = useState(false)
    const [newSelectedBank, setNewSelectedBank] = useState("")
    const [newAccountNumber, setNewAccountNumber] = useState("")
    const [newBusinessName, setNewBusinessName] = useState("")
    const [newBusinessEmail, setNewBusinessEmail] = useState("")
    const [resolvingNewAccount, setResolvingNewAccount] = useState(false)
    const [resolvedNewAccountName, setResolvedNewAccountName] = useState<string | null>(null)
    const [newResolutionError, setNewResolutionError] = useState<string | null>(null)
    const [newNameConfirmed, setNewNameConfirmed] = useState(false)
    const [savingNewBank, setSavingNewBank] = useState(false)

    useEffect(() => {
        if (open && !newBusinessName.trim() && schoolDisplayName) setNewBusinessName(schoolDisplayName)
        if (open && !newBusinessEmail.trim() && schoolEmail) setNewBusinessEmail(schoolEmail)
    }, [open, newBusinessName, schoolDisplayName, newBusinessEmail, schoolEmail])

    useEffect(() => {
        if (!open || bankList.length > 0) return
        const fetchBanks = async () => {
            try {
                setFetchingBankList(true)
                const banksData = (await financeService.getBanks()) as Array<{ code: string; name: string }>
                const uniqueBanks = Array.from(new Map(banksData.map((b) => [b.code, b])).values())
                setBankList(uniqueBanks.sort((a, b) => a.name.localeCompare(b.name)))
            } catch (err) {
                console.error("Failed to load bank list:", err)
            } finally {
                setFetchingBankList(false)
            }
        }
        fetchBanks()
    }, [open, bankList.length])

    useEffect(() => {
        const resolve = async () => {
            if (newAccountNumber.trim().length === 10 && newSelectedBank) {
                try {
                    setResolvingNewAccount(true); setNewResolutionError(null); setResolvedNewAccountName(null); setNewNameConfirmed(false)
                    const res = await financeService.resolveAccount(newAccountNumber.trim(), newSelectedBank)
                    if (res && res.accountName) {
                        setResolvedNewAccountName(res.accountName)
                        if (!newBusinessName.trim()) setNewBusinessName(schoolDisplayName || res.accountName)
                    } else {
                        setNewResolutionError("Could not resolve account name. Check the selected bank and 10-digit account number.")
                    }
                } catch (err: unknown) {
                    const errorObj = err as { response?: { data?: { message?: string } }; message?: string }
                    setNewResolutionError(errorObj.response?.data?.message || errorObj.message || "Verification failed. Check the bank and account number.")
                    setResolvedNewAccountName(null)
                } finally {
                    setResolvingNewAccount(false)
                }
            } else {
                setResolvedNewAccountName(null); setNewResolutionError(null); setNewNameConfirmed(false)
            }
        }
        const timer = setTimeout(resolve, 400)
        return () => clearTimeout(timer)
    }, [newAccountNumber, newSelectedBank, schoolDisplayName, newBusinessName])

    const handleSaveNewBank = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newSelectedBank || !newAccountNumber || !newBusinessName) { toast.warning("Please fill in all bank account fields"); return }
        if (newAccountNumber.trim().length !== 10) { toast.warning("Account number must be exactly 10 digits"); return }
        if (newResolutionError) { toast.error("Please verify bank details before proceeding"); return }
        if (resolvedNewAccountName && !newNameConfirmed) { toast.warning("Please confirm that the resolved account name matches your school"); return }
        if (!schoolId) { toast.error("School identity missing. Please re-login."); return }
        try {
            setSavingNewBank(true)
            const selectedBankObj = bankList.find((b) => b.code === newSelectedBank)
            const resolvedEmail = newBusinessEmail.trim() || schoolEmail || currentUserEmail || "finance@schoolhub.ng"
            await financeService.setupBank(schoolId, {
                business_name: newBusinessName.trim() || schoolDisplayName,
                business_email: resolvedEmail,
                settlement_bank: newSelectedBank,
                bank_name: selectedBankObj?.name || newSelectedBank,
                account_number: newAccountNumber.trim(),
                percentage_charge: 0,
                addedByName: currentUserName || undefined,
                addedByEmail: currentUserEmail || undefined,
                addedByRole: currentUserRole || "ADMIN",
            })
            toast.success("School bank account connected successfully!")
            onOpenChange(false)
            setNewSelectedBank(""); setNewAccountNumber(""); setResolvedNewAccountName(null); setNewNameConfirmed(false)
            await onSuccess()
        } catch (err: unknown) {
            const errorObj = err as { response?: { data?: { message?: string } }; message?: string }
            toast.error(errorObj.response?.data?.message || errorObj.message || "Failed to link bank account")
        } finally {
            setSavingNewBank(false)
        }
    }

    const popularBanks = [
        { label: "Access Bank", match: "access" }, { label: "GTBank", match: "guaranty" },
        { label: "Zenith Bank", match: "zenith" }, { label: "First Bank", match: "first bank" },
        { label: "UBA", match: "united bank for africa" }, { label: "Kuda", match: "kuda" },
        { label: "OPay", match: "paycom" }, { label: "PalmPay", match: "palmpay" },
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-full p-0 overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border-none shadow-2xl">
                <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-full bg-blue-500/10 blur-2xl pointer-events-none" />
                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="size-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300"><Landmark className="size-5" /></div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-400/15 text-blue-300 border border-blue-400/30">Official Settlement Conduit</span>
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-white">Connect School Bank Account</DialogTitle>
                        <DialogDescription className="text-blue-100/80 text-xs">
                            Route fee collections, transcript payments, and student disbursements directly into your school&apos;s verified bank account.
                        </DialogDescription>
                    </div>
                </div>

                <form onSubmit={handleSaveNewBank} className="p-6 sm:p-8 max-h-[82vh] overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                        <div className="lg:col-span-5 space-y-4">
                            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl border border-white/10">
                                <div className="relative z-10 flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 border border-amber-600/40 shadow-inner" />
                                        <Zap size={15} className="text-amber-300 shrink-0" />
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black tracking-widest uppercase text-blue-300 block truncate max-w-[170px]">
                                            {bankList.find((b) => b.code === newSelectedBank)?.name || "SELECT BANK"}
                                        </span>
                                        <span className="text-[9px] font-medium text-slate-400">Direct NUBAN Conduit</span>
                                    </div>
                                </div>
                                <div className="relative z-10 mb-5">
                                    <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase block mb-1">NUBAN Account Number</span>
                                    <div className="font-mono text-xl font-black tracking-[0.25em] text-white">
                                        {newAccountNumber ? `${newAccountNumber.slice(0, 4)}  ${newAccountNumber.slice(4, 7)}  ${newAccountNumber.slice(7, 10)}${"•".repeat(Math.max(0, 10 - newAccountNumber.length))}` : "••••  •••  •••"}
                                    </div>
                                </div>
                                <div className="relative z-10 flex items-end justify-between gap-3 pt-2 border-t border-white/10">
                                    <div className="min-w-0 flex-1">
                                        <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase block">Beneficiary Account</span>
                                        <p className="text-xs font-black uppercase tracking-wider text-slate-100 truncate">
                                            {newBusinessName.trim() || schoolDisplayName.toUpperCase() || "SCHOOL INSTITUTION"}
                                        </p>
                                    </div>
                                    <div className="shrink-0">
                                        {resolvedNewAccountName ? (
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"><CheckCircle2 size={11} className="text-emerald-400" /> VERIFIED</div>
                                        ) : resolvingNewAccount ? (
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/40 animate-pulse"><Loader2 size={11} className="animate-spin text-blue-400" /> VERIFYING</div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/5 text-slate-400 border border-white/10">NUBAN ROUTING</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                                <div className="flex items-center gap-2"><span className="text-base">🧪</span><span className="text-xs font-bold text-amber-900 dark:text-amber-200">Sandbox Test Account Auto-Fill</span></div>
                                <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                                    Flutterwave test mode resolves Access Bank (044) account <code className="font-mono font-bold bg-amber-500/20 px-1 rounded">0690000031</code>.
                                </p>
                                <Button
                                    type="button" size="sm" variant="outline"
                                    onClick={() => {
                                        const access = bankList.find((b) => b.code === "044") || bankList.find((b) => b.name.toLowerCase().includes("access"))
                                        if (access) setNewSelectedBank(access.code)
                                        setNewAccountNumber("0690000031")
                                        if (!newBusinessName.trim() && schoolDisplayName) setNewBusinessName(schoolDisplayName)
                                        if (!newBusinessEmail.trim() && schoolEmail) setNewBusinessEmail(schoolEmail)
                                    }}
                                    className="w-full h-8 px-3 text-[11px] font-black rounded-xl border-amber-400/50 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-950/40 cursor-pointer"
                                >
                                    ⚡ Auto-Fill Test Account (Access Bank)
                                </Button>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 flex items-start gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                                <Lock className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                                <span>256-bit SSL encrypted. Direct bank transfers & online fee payouts are protected with banking-grade security.</span>
                            </div>
                        </div>

                        <div className="lg:col-span-7 space-y-4">
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Popular Commercial Banks</span><span className="text-[10px] text-slate-400">1-Tap Select</span></div>
                                <div className="flex flex-wrap gap-1.5">
                                    {popularBanks.map((p, i) => {
                                        const found = bankList.find((b) => b.name.toLowerCase().includes(p.match))
                                        if (!found) return null
                                        const isSelected = newSelectedBank === found.code
                                        return (
                                            <button key={i} type="button" onClick={() => { setNewSelectedBank(found.code); setResolvedNewAccountName(null); setNewResolutionError(null); setNewNameConfirmed(false) }} className={cn("px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border", isSelected ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/30 scale-105" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700")}>
                                                {p.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Commercial Bank <span className="text-red-500">*</span></Label>
                                <Select value={newSelectedBank} onValueChange={(val) => { setNewSelectedBank(val); setResolvedNewAccountName(null); setNewResolutionError(null); setNewNameConfirmed(false) }} disabled={fetchingBankList}>
                                    <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold">
                                        <SelectValue placeholder={fetchingBankList ? "Loading bank directory..." : "Choose commercial bank from full list"} />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {bankList.map((b) => (<SelectItem key={b.code} value={b.code} className="text-xs font-medium">{b.name}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between"><Label className="text-xs font-bold text-slate-700 dark:text-slate-300">10-Digit NUBAN Account Number <span className="text-red-500">*</span></Label><span className="text-[11px] font-mono text-slate-400">{newAccountNumber.length} / 10 digits</span></div>
                                <Input type="text" maxLength={10} placeholder="e.g. 0123456789" value={newAccountNumber} onChange={(e) => setNewAccountNumber(e.target.value.replace(/\D/g, ""))} className="h-11 text-sm font-black tracking-widest font-mono rounded-xl border-slate-200 dark:border-slate-800" required />
                            </div>

                            {resolvingNewAccount && (
                                <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 flex items-center gap-3">
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-600 shrink-0" />
                                    <div><p className="text-xs font-bold text-blue-900 dark:text-blue-200">Verifying Bank Account...</p><p className="text-[10px] text-blue-600/80 dark:text-blue-400/80">Checking account number with NIBSS banking registry</p></div>
                                </div>
                            )}

                            {resolvedNewAccountName && (
                                <div className="space-y-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30">
                                    <div className="flex items-start gap-2.5">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                                        <div><p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Verified Account Name (NIBSS)</p><p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">{resolvedNewAccountName}</p></div>
                                    </div>
                                    <label className="flex items-center gap-2.5 p-2 bg-white dark:bg-slate-900 rounded-lg border border-emerald-200/60 dark:border-emerald-800/30 cursor-pointer select-none">
                                        <input type="checkbox" checked={newNameConfirmed} onChange={(e) => setNewNameConfirmed(e.target.checked)} className="h-4 w-4 text-emerald-600 rounded border-slate-300" />
                                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">I confirm this bank account belongs to our school institution.</span>
                                    </label>
                                </div>
                            )}

                            {newResolutionError && (
                                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 font-medium">
                                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" /><span>{newResolutionError}</span>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">School / Beneficiary Display Name <span className="text-red-500">*</span></Label>
                                    {resolvedNewAccountName && (
                                        <div className="flex items-center gap-1.5">
                                            <button type="button" onClick={() => setNewBusinessName(schoolDisplayName || "")} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Use School Name</button>
                                            <span className="text-[10px] text-slate-400">•</span>
                                            <button type="button" onClick={() => setNewBusinessName(resolvedNewAccountName)} className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">Use Verified Name</button>
                                        </div>
                                    )}
                                </div>
                                <div className="relative"><Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type="text" placeholder={schoolDisplayName || "e.g. Qefas International Academy"} value={newBusinessName} onChange={(e) => setNewBusinessName(e.target.value)} className="pl-10 h-11 text-xs font-bold rounded-xl border-slate-200 dark:border-slate-800" required /></div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Business / Settlement Notification Email <span className="text-red-500">*</span></Label>
                                <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type="email" placeholder="e.g. finance@yourschool.ng" value={newBusinessEmail} onChange={(e) => setNewBusinessEmail(e.target.value)} className="pl-10 h-11 text-xs font-bold rounded-xl border-slate-200 dark:border-slate-800" required /></div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3">
                                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl h-11 text-xs font-bold text-slate-500" disabled={savingNewBank}>Cancel</Button>
                                <Button type="submit" disabled={savingNewBank || !newSelectedBank || newAccountNumber.trim().length !== 10 || !newBusinessName.trim() || !newBusinessEmail.trim() || (!!resolvedNewAccountName && !newNameConfirmed)} className="rounded-xl h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/25 cursor-pointer">
                                    {savingNewBank ? <><Loader2 size={14} className="animate-spin mr-1.5" /> Connecting Bank...</> : "Save & Connect Bank"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

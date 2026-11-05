"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Landmark, Loader2, AlertCircle, Building2, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface BankSetupFormCardProps {
    banks: Array<{ code: string; name: string }>
    fetchingBanks: boolean
    selectedBank: string
    setSelectedBank: (v: string) => void
    accountNumber: string
    setAccountNumber: (v: string) => void
    businessName: string
    setBusinessName: (v: string) => void
    resolvingAccount: boolean
    resolvedAccountName: string | null
    resolutionError: string | null
    nameConfirmed: boolean
    setNameConfirmed: (v: boolean) => void
    loading: boolean
    onBack: () => void
    onSave: () => void
}

export function BankSetupFormCard({
    banks,
    fetchingBanks,
    selectedBank,
    setSelectedBank,
    accountNumber,
    setAccountNumber,
    businessName,
    setBusinessName,
    resolvingAccount,
    resolvedAccountName,
    resolutionError,
    nameConfirmed,
    setNameConfirmed,
    loading,
    onBack,
    onSave,
}: BankSetupFormCardProps) {
    return (
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900/50">
            <CardHeader className="bg-slate-900 text-white p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="flex items-center gap-5 relative z-10">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                        <Landmark className="h-8 w-8 text-blue-300" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-black">Account Configuration</CardTitle>
                        <CardDescription className="text-slate-400 font-medium">
                            Verified by Secure Settlement Gateway
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8 p-10">
                <div className="space-y-2.5">
                    <Label htmlFor="businessName" className="font-bold text-slate-700 dark:text-slate-300">
                        Registered School Account Name
                    </Label>
                    <Input
                        id="businessName"
                        placeholder="Exact name as registered with the bank"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="h-14 px-5 rounded-2xl border-slate-200 focus:ring-blue-500 font-medium"
                    />
                </div>

                <div className="space-y-2.5">
                    <Label htmlFor="bank" className="font-bold text-slate-700 dark:text-slate-300">
                        Select Settlement Bank
                    </Label>
                    {fetchingBanks ? (
                        <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-500" /> Connecting to Secure Gateway...
                        </div>
                    ) : (
                        <Select onValueChange={setSelectedBank} value={selectedBank}>
                            <SelectTrigger className="h-14 px-5 rounded-2xl border-slate-200 font-medium">
                                <SelectValue placeholder="Identify your bank provider" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl shadow-xl">
                                {banks.map((bank) => (
                                    <SelectItem key={bank.code} value={bank.code} className="py-3 rounded-xl">
                                        {bank.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="accountNumber" className="font-bold text-slate-700 dark:text-slate-300">
                            NUBAN Account Number
                        </Label>
                        {resolvingAccount && (
                            <span className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold animate-pulse">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Resolving with Flutterwave...
                            </span>
                        )}
                    </div>
                    <div className="relative">
                        <Input
                            id="accountNumber"
                            placeholder="10-digit primary account number"
                            maxLength={10}
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                            className={cn(
                                "h-14 px-5 rounded-2xl font-mono tracking-widest text-lg transition-all",
                                resolvedAccountName ? "border-emerald-500 focus:ring-emerald-500 bg-emerald-50/20" : "",
                                resolutionError ? "border-rose-400 focus:ring-rose-400 bg-rose-50/20" : "border-slate-200"
                            )}
                        />
                        {resolvedAccountName && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full text-xs font-bold">
                                <ShieldCheck className="h-4 w-4" /> Verified
                            </div>
                        )}
                    </div>
                </div>

                {resolvedAccountName && (
                    <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-start gap-3.5">
                            <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                    Resolved Institution Account Name
                                </span>
                                <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                                    {resolvedAccountName}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Matches Flutterwave banking network registry. A dedicated subaccount will be created for split payments.
                                </p>
                            </div>
                        </div>

                        <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200/60 dark:border-emerald-800/30 cursor-pointer hover:bg-emerald-50/40 transition-colors select-none">
                            <input
                                type="checkbox"
                                checked={nameConfirmed}
                                onChange={(e) => setNameConfirmed(e.target.checked)}
                                className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                            />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                I confirm that this resolved account name belongs to our school institution.
                            </span>
                        </label>
                    </div>
                )}

                {resolutionError && (
                    <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-4 flex items-center gap-3 text-rose-800 dark:text-rose-300 text-sm animate-in fade-in">
                        <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
                        <div className="flex-1 text-xs font-semibold">{resolutionError}</div>
                    </div>
                )}

                <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-[1.5rem] border border-amber-100 dark:border-amber-900/20 flex gap-5">
                    <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="text-sm">
                        <p className="font-black text-amber-900 dark:text-amber-400 uppercase tracking-widest mb-1 text-[10px]">
                            Security Protocol
                        </p>
                        <p className="text-amber-700 dark:text-amber-500 font-semibold leading-relaxed">
                            Misalignment between the school name and account number will result in settlement rejection. Double-check your NUBAN before submitting.
                        </p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-10 bg-slate-50 dark:bg-slate-900/50 border-t flex flex-col sm:flex-row gap-4 justify-between items-center text-center sm:text-left">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="rounded-xl px-8 h-12 font-bold text-slate-500 hover:bg-slate-200 transition-all order-2 sm:order-1"
                >
                    Return to Dashboard
                </Button>
                <Button
                    className="bg-blue-600 hover:bg-blue-700 rounded-xl px-10 h-14 font-black shadow-xl shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 order-1 sm:order-2 w-full sm:w-auto"
                    onClick={onSave}
                    disabled={
                        loading ||
                        fetchingBanks ||
                        resolvingAccount ||
                        (!!resolvedAccountName && !nameConfirmed) ||
                        !accountNumber ||
                        !selectedBank
                    }
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying with Gateway...
                        </>
                    ) : (
                        "Finalize Setup"
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}


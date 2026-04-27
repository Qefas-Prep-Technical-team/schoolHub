"use client"

import React, { useEffect, useState } from "react"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { financeService } from "@/lib/api/services/financeService"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Landmark, Loader2, AlertCircle, Trash2, Building2, CreditCard, ChevronRight, RefreshCw } from "lucide-react"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import { BankStatusBanner } from "../../components/BankStatusBanner"
import { AtmAccountCard } from "../../components/AtmAccountCard"
import { cn } from "@/lib/utils"

/**
 * Bank Setup Page for School Admins
 * Configures Settlement Account for direct fee disbursements.
 */
export default function BankSetupPage() {
    const { user } = useAuthStore()
    const router = useRouter()
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId

    const [banks, setBanks] = useState<any[]>([])
    const [selectedBank, setSelectedBank] = useState("")
    const [accountNumber, setAccountNumber] = useState("")
    const [businessName, setBusinessName] = useState("")
    const [percentageCharge] = useState(0) // Default platform fee percentage
    const [accounts, setAccounts] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [fetchingBanks, setFetchingBanks] = useState(true)
    const [paymentStatus, setPaymentStatus] = useState<any>(null)
    const [hasAutoSynced, setHasAutoSynced] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Load banks
                const banksData = await financeService.getBanks()
                const uniqueBanks = Array.from(new Map(banksData.map((b: any) => [b.code, b])).values());
                const sortedBanks = uniqueBanks.sort((a: any, b: any) => a.name.localeCompare(b.name))
                setBanks(sortedBanks)

                // Load school status if schoolId exists
                if (schoolId) {
                    const analytics = await financeService.getSchoolAnalytics(schoolId)
                    setPaymentStatus(analytics.paymentStatus)
                    setAccounts(analytics.accounts || [])
                }
            } catch (error) {
                console.error("Failed to fetch initial data", error)
                toast.error("Failed to load supported banks")
            } finally {
                setFetchingBanks(false)
            }
        }
        loadInitialData()
    }, [schoolId])
    
    /**
     * Automate Verification Sync (Requested: no manual sync)
     * Triggers in the background if pending accounts are detected.
     */
    useEffect(() => {
        if (!hasAutoSynced && accounts.length > 0) {
            const hasPending = accounts.some(acc => acc.status === "pending" || !acc.status);
            if (hasPending) {
                setHasAutoSynced(true);
                handleSync(); 
            }
        }
    }, [accounts, hasAutoSynced]);

    const handleSave = async () => {
        if (!selectedBank || !accountNumber || !businessName) {
            toast.error("Please fill in all settlement fields")
            return
        }

        if (!schoolId) {
            toast.error("Institutional Identity Error: School ID missing")
            return
        }

        toast.info("Initializing settlement verification...")

        try {
            setLoading(true)
            await financeService.setupBank(schoolId, {
                business_name: businessName,
                settlement_bank: selectedBank,
                account_number: accountNumber,
                percentage_charge: percentageCharge
            })
            toast.success("Settlement account configured successfully")
            
            // Refresh data
            const analytics = await financeService.getSchoolAnalytics(schoolId)
            setPaymentStatus(analytics.paymentStatus)
            setAccounts(analytics.accounts || [])
            
            // Reset fields
            setBusinessName("")
            setAccountNumber("")
            setSelectedBank("")
        } catch (error: any) {
            toast.error(error.message || "Failed to save bank configuration")
        } finally {
            setLoading(false)
        }
    }

    const handleRemove = async (accountId: string) => {
        if (!schoolId || !window.confirm("Are you sure you want to remove this settlement account? All fee disbursements for this account will be paused.")) return

        try {
            setLoading(true)
            await financeService.removeSubaccount(accountId)
            toast.success("Settlement account removed successfully")
            
            // Refresh data
            const analytics = await financeService.getSchoolAnalytics(schoolId as string)
            setPaymentStatus(analytics.paymentStatus)
            setAccounts(analytics.accounts || [])
        } catch (error: any) {
            toast.error(error.message || "Failed to remove account")
        } finally {
            setLoading(false)
        }
    }

    const handleSync = async (accountId?: string) => {
        if (!schoolId) return

        try {
            setLoading(true)
            const result = await financeService.syncSubaccountStatus(schoolId, accountId)
            toast.success(result.message)
            
            // Refresh data
            const analytics = await financeService.getSchoolAnalytics(schoolId as string)
            setPaymentStatus(analytics.paymentStatus)
            setAccounts(analytics.accounts || [])
        } catch (error: any) {
            toast.error(error.message || "Failed to sync status")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Bank Settlement</h1>
                    <p className="text-slate-500 font-medium">Link your school bank account for direct fee disbursements.</p>
                </div>
                {paymentStatus && <BankStatusBanner status={paymentStatus.status} />}

            {accounts.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Connected Accounts</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {accounts.map(acc => (
                            <AtmAccountCard 
                                key={acc.id} 
                                account={acc} 
                                onRefresh={(id) => handleSync(id)}
                                onDelete={(id) => handleRemove(id)}
                            />
                        ))}
                    </div>
                </div>
            )}
            </div>

            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900/50">
                <CardHeader className="bg-slate-900 text-white p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                            <Landmark className="h-8 w-8 text-blue-300" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black">Account Configuration</CardTitle>
                            <CardDescription className="text-slate-400 font-medium">Verified by Secure Settlement Gateway</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8 p-10">
                    <div className="space-y-2.5">
                        <Label htmlFor="businessName" className="font-bold text-slate-700 dark:text-slate-300">Registered School Account Name</Label>
                        <Input 
                            id="businessName" 
                            placeholder="Exact name as registered with the bank" 
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="h-14 px-5 rounded-2xl border-slate-200 focus:ring-blue-500 font-medium"
                        />
                    </div>

                    <div className="space-y-2.5">
                        <Label htmlFor="bank" className="font-bold text-slate-700 dark:text-slate-300">Select Settlement Bank</Label>
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
                        <Label htmlFor="accountNumber" className="font-bold text-slate-700 dark:text-slate-300">NUBAN Account Number</Label>
                        <Input 
                            id="accountNumber" 
                            placeholder="10-digit primary account number" 
                            maxLength={10}
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className="h-14 px-5 rounded-2xl border-slate-200 font-mono tracking-widest text-lg"
                        />
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-[1.5rem] border border-amber-100 dark:border-amber-900/20 flex gap-5">
                        <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="text-sm">
                            <p className="font-black text-amber-900 dark:text-amber-400 uppercase tracking-widest mb-1 text-[10px]">Security Protocol</p>
                            <p className="text-amber-700 dark:text-amber-500 font-semibold leading-relaxed">
                                Misalignment between the school name and account number will result in settlement rejection. Double-check your NUBAN before submitting.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-10 bg-slate-50 dark:bg-slate-900/50 border-t flex flex-col sm:flex-row gap-4 justify-between items-center text-center sm:text-left">
                    <Button 
                        variant="ghost" 
                        onClick={() => router.back()} 
                        className="rounded-xl px-8 h-12 font-bold text-slate-500 hover:bg-slate-200 transition-all order-2 sm:order-1"
                    >
                        Return to Dashboard
                    </Button>
                    <Button 
                        className="bg-blue-600 hover:bg-blue-700 rounded-xl px-10 h-14 font-black shadow-xl shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 order-1 sm:order-2 w-full sm:w-auto"
                        onClick={handleSave}
                        disabled={loading || fetchingBanks}
                    >
                        {loading ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying with Gateway...</>
                        ) : (
                            "Finalize Setup"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

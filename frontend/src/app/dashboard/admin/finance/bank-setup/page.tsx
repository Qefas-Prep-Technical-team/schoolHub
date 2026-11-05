"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import {
    financeService,
    FinanceSettlementAccount,
    FinanceAnalytics,
} from "@/lib/api/services/financeService"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import { BankStatusBanner } from "../../components/BankStatusBanner"
import { AtmAccountCard } from "../../components/AtmAccountCard"
import { BankSetupFormCard } from "./components/BankSetupFormCard"

/**
 * Bank Setup Page for School Admins
 * Configures Settlement Account for direct fee disbursements with Flutterwave Subaccount creation.
 */
export default function BankSetupPage() {
    const { user } = useAuthStore()
    const router = useRouter()
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId

    const [banks, setBanks] = useState<Array<{ code: string; name: string }>>([])
    const [selectedBank, setSelectedBank] = useState("")
    const [accountNumber, setAccountNumber] = useState("")
    const [businessName, setBusinessName] = useState("")
    const [percentageCharge] = useState(0)
    const [accounts, setAccounts] = useState<FinanceSettlementAccount[]>([])
    const [loading, setLoading] = useState(false)
    const [fetchingBanks, setFetchingBanks] = useState(true)
    const [paymentStatus, setPaymentStatus] = useState<FinanceAnalytics["paymentStatus"] | null>(null)
    const [hasAutoSynced, setHasAutoSynced] = useState(false)

    // Account Resolution states
    const [resolvingAccount, setResolvingAccount] = useState(false)
    const [resolvedAccountName, setResolvedAccountName] = useState<string | null>(null)
    const [resolutionError, setResolutionError] = useState<string | null>(null)
    const [nameConfirmed, setNameConfirmed] = useState(false)

    // Enforce admin role security
    useEffect(() => {
        if (!user) {
            router.replace("/login?redirect=/dashboard/admin/finance/bank-setup")
            return
        }
        const userRecord = user as unknown as Record<string, unknown>
        const role = String(userRecord.adminRole || user.role || "")
        if (!["SCHOOL_OWNER", "ACCOUNTANT", "ADMIN", "SUPER_ADMIN"].includes(role)) {
            toast.error("Access Restricted: Settlement configuration is limited to authorized school administrators.")
            router.replace("/dashboard/admin")
        }
    }, [user, router])

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const banksData = (await financeService.getBanks()) as Array<{ code: string; name: string }>
                const uniqueBanks = Array.from(new Map(banksData.map((b) => [b.code, b])).values())
                const sortedBanks = uniqueBanks.sort((a, b) => a.name.localeCompare(b.name))
                setBanks(sortedBanks)

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

    const handleSync = useCallback(
        async (accountId?: string) => {
            if (!schoolId) return
            const resolvedAccountId =
                typeof accountId === "string" && accountId.trim() ? accountId.trim() : undefined

            try {
                setLoading(true)
                const result = await financeService.syncSubaccountStatus(schoolId, resolvedAccountId)
                toast.success(result.message)

                const analytics = await financeService.getSchoolAnalytics(schoolId)
                setPaymentStatus(analytics.paymentStatus)
                setAccounts(analytics.accounts || [])
            } catch (error: unknown) {
                const err = error as { response?: { data?: { message?: string } }; message?: string }
                toast.error(err?.response?.data?.message || err?.message || "Failed to sync status")
            } finally {
                setLoading(false)
            }
        },
        [schoolId]
    )

    useEffect(() => {
        if (!hasAutoSynced && accounts.length > 0) {
            const hasPending = accounts.some((acc) => acc.status === "pending" || !acc.status)
            if (hasPending) {
                setHasAutoSynced(true)
                handleSync()
            }
        }
    }, [accounts, hasAutoSynced, handleSync])

    useEffect(() => {
        const resolveAccount = async () => {
            if (accountNumber.trim().length === 10 && selectedBank) {
                try {
                    setResolvingAccount(true)
                    setResolutionError(null)
                    setResolvedAccountName(null)
                    setNameConfirmed(false)

                    const resolved = await financeService.resolveAccount(accountNumber.trim(), selectedBank)
                    if (resolved && resolved.accountName) {
                        setResolvedAccountName(resolved.accountName)
                        if (!businessName.trim()) {
                            setBusinessName(resolved.accountName)
                        }
                    } else {
                        setResolutionError(
                            "Could not resolve account name. Please verify bank and 10-digit account number."
                        )
                    }
                } catch (err: unknown) {
                    const errorObj = err as { response?: { data?: { message?: string } }; message?: string }
                    setResolutionError(
                        errorObj?.response?.data?.message ||
                            errorObj?.message ||
                            "Failed to resolve account. Please verify bank and account number."
                    )
                    setResolvedAccountName(null)
                } finally {
                    setResolvingAccount(false)
                }
            } else {
                setResolvedAccountName(null)
                setResolutionError(null)
                setNameConfirmed(false)
            }
        }

        const timer = setTimeout(resolveAccount, 400)
        return () => clearTimeout(timer)
    }, [accountNumber, selectedBank, businessName])

    const handleSave = async () => {
        if (!selectedBank || !accountNumber || !businessName) {
            toast.error("Please fill in all settlement fields")
            return
        }
        if (accountNumber.trim().length !== 10) {
            toast.error("NUBAN Account number must be exactly 10 digits")
            return
        }
        if (resolutionError) {
            toast.error("Account verification failed. Please correct the bank or account number.")
            return
        }
        if (resolvedAccountName && !nameConfirmed) {
            toast.error("Please confirm that the resolved account name matches your school before proceeding.")
            return
        }
        if (!schoolId) {
            toast.error("Institutional Identity Error: School ID missing")
            return
        }

        toast.info("Creating Flutterwave subaccount & configuring settlement...")

        try {
            setLoading(true)
            await financeService.setupBank(schoolId, {
                business_name: businessName,
                settlement_bank: selectedBank,
                account_number: accountNumber.trim(),
                percentage_charge: percentageCharge,
                addedByName: user?.name || undefined,
                addedByEmail: user?.email || undefined,
                addedByRole: user?.role || "ADMIN",
            })
            toast.success("Settlement subaccount created & configured successfully")

            const analytics = await financeService.getSchoolAnalytics(schoolId)
            setPaymentStatus(analytics.paymentStatus)
            setAccounts(analytics.accounts || [])

            setBusinessName("")
            setAccountNumber("")
            setSelectedBank("")
            setResolvedAccountName(null)
            setNameConfirmed(false)
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string }
            toast.error(err?.response?.data?.message || err.message || "Failed to save bank configuration")
        } finally {
            setLoading(false)
        }
    }

    const handleRemove = async (accountId: string) => {
        if (
            !schoolId ||
            !window.confirm(
                "Are you sure you want to remove this settlement account? All fee disbursements for this account will be paused."
            )
        )
            return

        try {
            setLoading(true)
            await financeService.removeSubaccount(accountId)
            toast.success("Settlement account removed successfully")

            const analytics = await financeService.getSchoolAnalytics(schoolId)
            setPaymentStatus(analytics.paymentStatus)
            setAccounts(analytics.accounts || [])
        } catch (error: unknown) {
            const err = error as { message?: string }
            toast.error(err.message || "Failed to remove account")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        Bank Settlement
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Link your school bank account for direct fee disbursements.
                    </p>
                </div>
                {paymentStatus && (
                    <BankStatusBanner
                        status={paymentStatus.status as "active" | "pending" | "unverified" | "none"}
                    />
                )}

                {accounts.length > 0 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                            Connected Accounts
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {accounts.map((acc) => (
                                <AtmAccountCard
                                    key={acc.id}
                                    account={{
                                        ...acc,
                                        status: acc.status as "active" | "pending" | "unverified",
                                    }}
                                    onRefresh={(id) => handleSync(id)}
                                    onDelete={(id) => handleRemove(id)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <BankSetupFormCard
                banks={banks}
                fetchingBanks={fetchingBanks}
                selectedBank={selectedBank}
                setSelectedBank={setSelectedBank}
                accountNumber={accountNumber}
                setAccountNumber={setAccountNumber}
                businessName={businessName}
                setBusinessName={setBusinessName}
                resolvingAccount={resolvingAccount}
                resolvedAccountName={resolvedAccountName}
                resolutionError={resolutionError}
                nameConfirmed={nameConfirmed}
                setNameConfirmed={setNameConfirmed}
                loading={loading}
                onBack={() => router.back()}
                onSave={handleSave}
            />
        </div>
    )
}

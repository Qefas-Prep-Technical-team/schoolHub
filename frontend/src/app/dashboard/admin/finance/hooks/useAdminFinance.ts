"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { toast } from "react-toastify"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { financeService, FinanceAnalytics, FinanceTransaction, BankAccountAudit } from "@/lib/api/services/financeService"
import { useSchoolStudents, useSchoolSettings, useUpdateSchoolSettings, useSchoolProfile } from "@/lib/api/hooks/useSchool"

export interface AdminFinanceStudentOption {
    id: string; name?: string; firstName?: string; lastName?: string; studentCode?: string; status?: string
}

export function useAdminFinance() {
    const { user } = useAuthStore()
    const router = useRouter()
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || ""

    const [analytics, setAnalytics] = useState<FinanceAnalytics | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("overview")
    const [transactions, setTransactions] = useState<FinanceTransaction[]>([])
    const [transactionsLoading, setTransactionsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [categoryFilter, setCategoryFilter] = useState("ALL")
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalTransactions, setTotalTransactions] = useState(0)

    const [isManualModalOpen, setIsManualModalOpen] = useState(false)
    const [manualSubmitting, setManualSubmitting] = useState(false)
    const [manualStudentId, setManualStudentId] = useState("")
    const [manualAmount, setManualAmount] = useState("")
    const [manualType, setManualType] = useState("TUITION")
    const [manualMethod, setManualMethod] = useState("CASH")
    const [manualTerm, setManualTerm] = useState("First Term")
    const [manualSession, setManualSession] = useState("2025/2026")
    const [manualNotes, setManualNotes] = useState("")
    const [studentSearchTerm, setStudentSearchTerm] = useState("")

    const [selectedReceipt, setSelectedReceipt] = useState<FinanceTransaction | null>(null)
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
    const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false)
    const [hasAutoPromptedBank, setHasAutoPromptedBank] = useState(false)
    const [bankAudits, setBankAudits] = useState<BankAccountAudit[]>([])
    const [loadingAudits, setLoadingAudits] = useState(false)
    const [copiedAccount, setCopiedAccount] = useState<string | null>(null)

    // School Profile & Plan Tier Detection
    const { data: schoolProfile } = useSchoolProfile(schoolId)
    const profileRecord = (schoolProfile || {}) as Record<string, unknown>
    const userRecord = (user || {}) as Record<string, unknown>
    const tenantRecord = (userRecord.tenant || {}) as Record<string, unknown>
    const subRecord = (profileRecord.subscription || {}) as Record<string, unknown>

    const schoolDisplayName = String(
        schoolProfile?.name || profileRecord.schoolName || user?.schools?.[0]?.name || tenantRecord.name || ""
    )
    const schoolEmail = String(profileRecord.schoolEmail || profileRecord.email || user?.email || "")
    const rawPlan = String(profileRecord.plan || subRecord.plan || "FREE").toUpperCase()
    const rawSubStatus = String(profileRecord.subscriptionStatus || subRecord.status || "").toUpperCase()
    const isSchoolPaidPlan =
        (rawPlan === "BASIC" || rawPlan === "PREMIUM" || rawPlan === "ENTERPRISE") &&
        rawSubStatus !== "EXPIRED" &&
        rawSubStatus !== "CANCELLED"
    const schoolPlanName = isSchoolPaidPlan ? `${rawPlan} PLAN` : "FREE TIER"

    // Transcript Clearance Fee state
    const { data: schoolSettings, refetch: refetchSettings } = useSchoolSettings(schoolId)
    const updateSettingsMutation = useUpdateSchoolSettings()
    const settingsRecord = (schoolSettings || {}) as Record<string, unknown>
    const configuredTranscriptFee = Number(settingsRecord.transcriptFee ?? 5000)
    const [isEditFeeModalOpen, setIsEditFeeModalOpen] = useState(false)
    const [editingFee, setEditingFee] = useState<string>("")
    const [isSavingFee, setIsSavingFee] = useState(false)

    const handleOpenFeeModal = useCallback(() => {
        setEditingFee(String(configuredTranscriptFee))
        setIsEditFeeModalOpen(true)
    }, [configuredTranscriptFee])

    const handleSaveTranscriptFee = useCallback(async () => {
        const feeNum = parseFloat(editingFee)
        if (isNaN(feeNum) || feeNum < 0) {
            toast.error("Please enter a valid fee amount")
            return
        }
        setIsSavingFee(true)
        try {
            await updateSettingsMutation.mutateAsync({ schoolId, data: { transcriptFee: feeNum } })
            toast.success(
                feeNum === 0
                    ? "Transcript clearance fee set to ₦0 (Complimentary for active students on paid plan)"
                    : `Transcript clearance fee updated to ₦${feeNum.toLocaleString()}`
            )
            setIsEditFeeModalOpen(false)
            refetchSettings()
        } catch (err: unknown) {
            toast.error((err as { message?: string }).message || "Failed to update clearance fee")
        } finally {
            setIsSavingFee(false)
        }
    }, [editingFee, updateSettingsMutation, schoolId, refetchSettings])

    // Fetch school students for manual payment selector
    const { data: studentsData } = useSchoolStudents(schoolId, { limit: 100 })
    const studentList = useMemo<AdminFinanceStudentOption[]>(() => {
        if (!studentsData) return []
        if (Array.isArray(studentsData)) return studentsData as AdminFinanceStudentOption[]
        const record = studentsData as Record<string, unknown>
        if (Array.isArray(record.students)) return record.students as AdminFinanceStudentOption[]
        if (Array.isArray(record.data)) return record.data as AdminFinanceStudentOption[]
        return []
    }, [studentsData])

    const filteredStudents = useMemo(() => {
        if (!studentSearchTerm.trim()) return studentList.slice(0, 20)
        const term = studentSearchTerm.toLowerCase()
        return studentList
            .filter((s) => {
                const fullName = `${s.firstName || ""} ${s.lastName || ""} ${s.name || ""}`.toLowerCase()
                const code = (s.studentCode || "").toLowerCase()
                return fullName.includes(term) || code.includes(term)
            })
            .slice(0, 20)
    }, [studentList, studentSearchTerm])

    const loadAnalytics = useCallback(async () => {
        if (!schoolId) return
        try {
            setLoading(true)
            const data = await financeService.getSchoolAnalytics(schoolId)
            setAnalytics(data)
            if (data?.recentTransactions) {
                setTransactions(data.recentTransactions)
                setTotalTransactions(data.recentTransactions.length)
            }
            if (data?.bankAudits) {
                setBankAudits(data.bankAudits)
            }
        } catch (error) {
            console.error("Failed to load finance analytics:", error)
        } finally {
            setLoading(false)
        }
    }, [schoolId])

    const loadBankAudits = useCallback(async () => {
        if (!schoolId) return
        try {
            setLoadingAudits(true)
            const history = await financeService.getBankHistory(schoolId)
            if (Array.isArray(history)) {
                setBankAudits(history)
            }
        } catch (err) {
            console.error("Failed to load bank audit history:", err)
        } finally {
            setLoadingAudits(false)
        }
    }, [schoolId])

    const loadTransactions = useCallback(
        async (page = 1) => {
            if (!schoolId) return
            try {
                setTransactionsLoading(true)
                const res = await financeService.getSchoolTransactions(schoolId, {
                    page,
                    limit: 15,
                    search: searchQuery.trim() || undefined,
                    status: statusFilter === "ALL" ? undefined : statusFilter,
                    paymentType: categoryFilter === "ALL" ? undefined : categoryFilter,
                })
                if (res) {
                    setTransactions(res.transactions || [])
                    setCurrentPage(res.pagination?.page || 1)
                    setTotalPages(res.pagination?.totalPages || 1)
                    setTotalTransactions(res.pagination?.total || 0)
                }
            } catch (error) {
                console.error("Failed to load transactions:", error)
            } finally {
                setTransactionsLoading(false)
            }
        },
        [schoolId, searchQuery, statusFilter, categoryFilter]
    )

    useEffect(() => {
        if (schoolId) { loadAnalytics(); loadBankAudits() } else { setLoading(false) }
    }, [schoolId, loadAnalytics, loadBankAudits])

    useEffect(() => {
        if (activeTab === "transactions") loadTransactions(1)
        else if (activeTab === "vault") loadBankAudits()
    }, [activeTab, searchQuery, statusFilter, categoryFilter, loadTransactions, loadBankAudits])

    useEffect(() => {
        if (!user) { router.replace("/login?redirect=/dashboard/admin/finance"); return }
        const role = String(userRecord.adminRole || user.role || "")
        if (!["SCHOOL_OWNER", "ACCOUNTANT", "ADMIN", "SUPER_ADMIN"].includes(role)) {
            toast.error("Access Restricted: Finance management is limited to authorized school administrators.")
            router.replace("/dashboard/admin")
        }
    }, [user, userRecord.adminRole, router])

    useEffect(() => {
        if (!loading && analytics && (!analytics.accounts || analytics.accounts.length === 0) && !hasAutoPromptedBank) {
            setHasAutoPromptedBank(true)
            setIsAddBankModalOpen(true)
        }
    }, [loading, analytics, hasAutoPromptedBank])

    const handleSync = useCallback(
        async (accountId?: string) => {
            if (!schoolId) return
            const resolvedAccountId =
                typeof accountId === "string" && accountId.trim() ? accountId.trim() : undefined
            try {
                setLoading(true)
                const result = await financeService.syncSubaccountStatus(schoolId, resolvedAccountId)
                toast.success(result.message || "Settlement status synchronized")
                await Promise.all([loadAnalytics(), loadBankAudits()])
            } catch (error: unknown) {
                const err = error as { response?: { data?: { message?: string } }; message?: string }
                toast.error(err.response?.data?.message || err.message || "Sync failed")
            } finally {
                setLoading(false)
            }
        },
        [schoolId, loadAnalytics, loadBankAudits]
    )

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!schoolId || !manualStudentId || !manualAmount) {
            toast.warning("Please select a student and enter an amount")
            return
        }
        const numericAmount = parseFloat(manualAmount)
        if (isNaN(numericAmount) || numericAmount <= 0) {
            toast.warning("Please enter a valid payment amount")
            return
        }
        try {
            setManualSubmitting(true)
            await financeService.recordManualPayment(schoolId, {
                studentId: manualStudentId,
                amount: numericAmount,
                paymentType: manualType,
                paymentMethod: manualMethod,
                term: manualTerm,
                session: manualSession,
                notes: manualNotes.trim() || undefined,
            })
            toast.success("Manual fee payment successfully recorded!")
            setIsManualModalOpen(false)
            setManualAmount("")
            setManualNotes("")
            setManualStudentId("")
            await loadAnalytics()
            if (activeTab === "transactions") {
                await loadTransactions(currentPage)
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string }
            toast.error(err.response?.data?.message || err.message || "Failed to record payment")
        } finally {
            setManualSubmitting(false)
        }
    }

    const handleExportCSV = useCallback(() => {
        const txList = transactions.length > 0 ? transactions : analytics?.recentTransactions || []
        if (txList.length === 0) { toast.info("No transaction data available to export"); return }
        const headers = ["Execution Date", "Student / Entity", "Classification", "Channel", "Amount (NGN)", "Status", "Reference Hash"]
        const rows = txList.map((t) => [
            format(new Date(t.createdAt), "yyyy-MM-dd HH:mm"),
            `"${t.student?.name || t.parent?.fullName || "Institutional Payer"}"`,
            `"${t.paymentType || "School Fee"}"`, `"${t.channel || "Online Gateway"}"`,
            t.amount, `"${t.status}"`, `"${t.paymentReference || t.reference || t.id}"`,
        ])
        const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
        const url = URL.createObjectURL(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }))
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `qefas_finance_ledger_${format(new Date(), "yyyyMMdd_HHmm")}.csv`)
        document.body.appendChild(link); link.click(); document.body.removeChild(link)
        toast.success("Financial ledger exported to CSV")
    }, [transactions, analytics?.recentTransactions])

    const openReceipt = useCallback((transaction: FinanceTransaction) => {
        setSelectedReceipt(transaction)
        setIsReceiptModalOpen(true)
    }, [])

    return {
        user, router, schoolId, schoolDisplayName, schoolEmail, isSchoolPaidPlan, schoolPlanName,
        analytics, loading, activeTab, setActiveTab, transactions, transactionsLoading,
        searchQuery, setSearchQuery, statusFilter, setStatusFilter, categoryFilter, setCategoryFilter,
        currentPage, totalPages, totalTransactions, loadTransactions, loadAnalytics,
        isManualModalOpen, setIsManualModalOpen, manualSubmitting, manualStudentId, setManualStudentId,
        manualAmount, setManualAmount, manualType, setManualType, manualMethod, setManualMethod,
        manualTerm, setManualTerm, manualSession, setManualSession, manualNotes, setManualNotes,
        studentSearchTerm, setStudentSearchTerm, filteredStudents, handleRecordPayment,
        selectedReceipt, isReceiptModalOpen, setIsReceiptModalOpen, openReceipt,
        isAddBankModalOpen, setIsAddBankModalOpen, bankAudits, loadingAudits, loadBankAudits,
        copiedAccount, setCopiedAccount, configuredTranscriptFee, isEditFeeModalOpen, setIsEditFeeModalOpen,
        editingFee, setEditingFee, isSavingFee, handleOpenFeeModal, handleSaveTranscriptFee,
        handleSync, handleExportCSV,
    }
}

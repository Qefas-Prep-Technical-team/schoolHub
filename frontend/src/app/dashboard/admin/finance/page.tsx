"use client"

import React, { useEffect, useState, useMemo, useCallback } from "react"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { financeService, FinanceAnalytics, FinanceTransaction, FinanceSettlementAccount, BankAccountAudit } from "@/lib/api/services/financeService"
import { useSchoolStudents, useSchoolSettings, useUpdateSchoolSettings, useSchoolProfile } from "@/lib/api/hooks/useSchool"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
    Landmark,
    TrendingUp,
    Users,
    Wallet,
    Loader2,
    Download,
    ChevronLeft,
    ShieldCheck,
    Plus,
    Receipt,
    CreditCard,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowUpRight,
    Printer,
    Sparkles,
    Calendar,
    ChevronRight,
    ArrowRight,
    GraduationCap,
    Edit2,
    Lock,
    AlertCircle,
    Building2,
    History,
    Copy,
    Check,
    RefreshCw,
    Trash2,
    Zap,
    Shield
} from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { toast } from "react-toastify"
import { PaymentStatusCard } from "../components/PaymentStatusCard"
import { AtmAccountCard } from "../components/AtmAccountCard"
import { cn } from "@/lib/utils"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"

export default function AdminFinancePage() {
    const { user } = useAuthStore()
    const router = useRouter()
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || ""

    // State
    const [analytics, setAnalytics] = useState<FinanceAnalytics | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("overview")

    // Transactions Table & Pagination state
    const [transactions, setTransactions] = useState<FinanceTransaction[]>([])
    const [transactionsLoading, setTransactionsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [categoryFilter, setCategoryFilter] = useState("ALL")
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalTransactions, setTotalTransactions] = useState(0)

    // Manual Payment Modal state
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

    // Receipt Modal state
    const [selectedReceipt, setSelectedReceipt] = useState<FinanceTransaction | null>(null)
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)

    // Add School Bank Account (Auto Popup & Manual) State
    const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false)
    const [hasAutoPromptedBank, setHasAutoPromptedBank] = useState(false)
    const [bankList, setBankList] = useState<Array<{ code: string; name: string }>>([])
    const [fetchingBankList, setFetchingBankList] = useState(false)
    const [newSelectedBank, setNewSelectedBank] = useState("")
    const [newAccountNumber, setNewAccountNumber] = useState("")
    const [newBusinessName, setNewBusinessName] = useState("")
    const [resolvingNewAccount, setResolvingNewAccount] = useState(false)
    const [resolvedNewAccountName, setResolvedNewAccountName] = useState<string | null>(null)
    const [newResolutionError, setNewResolutionError] = useState<string | null>(null)
    const [newNameConfirmed, setNewNameConfirmed] = useState(false)
    const [savingNewBank, setSavingNewBank] = useState(false)

    // Bank Audit & History State
    const [bankAudits, setBankAudits] = useState<BankAccountAudit[]>([])
    const [loadingAudits, setLoadingAudits] = useState(false)
    const [copiedAccount, setCopiedAccount] = useState<string | null>(null)

    // School Profile for auto-populating school display name
    const { data: schoolProfile } = useSchoolProfile(schoolId)
    const schoolDisplayName = schoolProfile?.name || (schoolProfile as any)?.schoolName || user?.schools?.[0]?.name || (user as any)?.tenant?.name || ""

    // Transcript Clearance Fee state
    const { data: schoolSettings, refetch: refetchSettings } = useSchoolSettings(schoolId)
    const updateSettingsMutation = useUpdateSchoolSettings()
    const configuredTranscriptFee = Number((schoolSettings as any)?.transcriptFee ?? 5000)
    const [isEditFeeModalOpen, setIsEditFeeModalOpen] = useState(false)
    const [editingFee, setEditingFee] = useState<string>("")
    const [isSavingFee, setIsSavingFee] = useState(false)

    const handleOpenFeeModal = () => {
        setEditingFee(String(configuredTranscriptFee))
        setIsEditFeeModalOpen(true)
    }

    const handleSaveTranscriptFee = async () => {
        const feeNum = parseFloat(editingFee)
        if (isNaN(feeNum) || feeNum < 0) {
            toast.error("Please enter a valid fee amount")
            return
        }
        setIsSavingFee(true)
        try {
            await updateSettingsMutation.mutateAsync({
                schoolId,
                data: { transcriptFee: feeNum }
            })
            toast.success(`Transcript clearance fee updated to ₦${feeNum.toLocaleString()}`)
            setIsEditFeeModalOpen(false)
            refetchSettings()
        } catch (err: any) {
            toast.error(err.message || "Failed to update clearance fee")
        } finally {
            setIsSavingFee(false)
        }
    }

    // Fetch school students for manual payment selector
    const { data: studentsData } = useSchoolStudents(schoolId, { limit: 100 })
    const studentList = useMemo(() => {
        if (!studentsData) return []
        if (Array.isArray(studentsData)) return studentsData
        if (Array.isArray(studentsData.students)) return studentsData.students
        if (Array.isArray(studentsData.data)) return studentsData.data
        return []
    }, [studentsData])

    const filteredStudents = useMemo(() => {
        if (!studentSearchTerm.trim()) return studentList.slice(0, 20)
        const term = studentSearchTerm.toLowerCase()
        return studentList.filter((s: { name?: string; firstName?: string; lastName?: string; studentCode?: string }) => {
            const fullName = `${s.firstName || ""} ${s.lastName || ""} ${s.name || ""}`.toLowerCase()
            const code = (s.studentCode || "").toLowerCase()
            return fullName.includes(term) || code.includes(term)
        }).slice(0, 20)
    }, [studentList, studentSearchTerm])

    // Load Overview Analytics
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

    // Load Bank Account Processing & Audit History
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

    // Load Transactions with Filters
    const loadTransactions = useCallback(async (page = 1) => {
        if (!schoolId) return
        try {
            setTransactionsLoading(true)
            const res = await financeService.getSchoolTransactions(schoolId, {
                page,
                limit: 15,
                search: searchQuery.trim() || undefined,
                status: statusFilter === "ALL" ? undefined : statusFilter,
                paymentType: categoryFilter === "ALL" ? undefined : categoryFilter
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
    }, [schoolId, searchQuery, statusFilter, categoryFilter])

    useEffect(() => {
        if (schoolId) {
            loadAnalytics()
            loadBankAudits()
        } else {
            setLoading(false)
        }
    }, [schoolId, loadAnalytics, loadBankAudits])

    useEffect(() => {
        if (activeTab === "transactions") {
            loadTransactions(1)
        } else if (activeTab === "vault") {
            loadBankAudits()
        }
    }, [activeTab, searchQuery, statusFilter, categoryFilter, loadTransactions, loadBankAudits])

    // Requirement 1: Auto add school name in the display name
    useEffect(() => {
        if (isAddBankModalOpen && !newBusinessName.trim() && schoolDisplayName) {
            setNewBusinessName(schoolDisplayName)
        }
    }, [isAddBankModalOpen, newBusinessName, schoolDisplayName])

    // Enforce authentication & admin security
    useEffect(() => {
        if (!user) {
            router.replace("/login?redirect=/dashboard/admin/finance")
            return
        }
        const role = ((user as any).adminRole || user.role || "") as string
        const isAuthorized = ["SCHOOL_OWNER", "ACCOUNTANT", "ADMIN", "SUPER_ADMIN"].includes(role)
        if (!isAuthorized) {
            toast.error("Access Restricted: Finance management is limited to authorized school administrators.")
            router.replace("/dashboard/admin")
        }
    }, [user, router])

    // Auto show modal if no bank accounts are connected once analytics loads
    useEffect(() => {
        if (!loading && analytics && (!analytics.accounts || analytics.accounts.length === 0) && !hasAutoPromptedBank) {
            setHasAutoPromptedBank(true)
            if (!newBusinessName.trim() && schoolDisplayName) {
                setNewBusinessName(schoolDisplayName)
            }
            setIsAddBankModalOpen(true)
        }
    }, [loading, analytics, hasAutoPromptedBank, newBusinessName, schoolDisplayName])

    // Fetch supported banks when modal opens
    useEffect(() => {
        if (!isAddBankModalOpen || bankList.length > 0) return
        const fetchBanks = async () => {
            try {
                setFetchingBankList(true)
                const banksData = await financeService.getBanks()
                const uniqueBanks = Array.from(new Map(banksData.map((b: any) => [b.code, b])).values()) as Array<{ code: string; name: string }>
                const sortedBanks = uniqueBanks.sort((a, b) => a.name.localeCompare(b.name))
                setBankList(sortedBanks)
            } catch (err) {
                console.error("Failed to load bank list:", err)
            } finally {
                setFetchingBankList(false)
            }
        }
        fetchBanks()
    }, [isAddBankModalOpen, bankList.length])

    // Debounced NUBAN account name resolution
    useEffect(() => {
        const resolve = async () => {
            if (newAccountNumber.trim().length === 10 && newSelectedBank) {
                try {
                    setResolvingNewAccount(true)
                    setNewResolutionError(null)
                    setResolvedNewAccountName(null)
                    setNewNameConfirmed(false)

                    const res = await financeService.resolveAccount(newAccountNumber.trim(), newSelectedBank)
                    if (res && res.accountName) {
                        setResolvedNewAccountName(res.accountName)
                        if (!newBusinessName.trim()) {
                            setNewBusinessName(schoolDisplayName || res.accountName)
                        }
                    } else {
                        setNewResolutionError("Could not resolve account name. Check the selected bank and 10-digit account number.")
                    }
                } catch (err: any) {
                    setNewResolutionError(err?.response?.data?.message || err?.message || "Verification failed. Check the bank and account number.")
                    setResolvedNewAccountName(null)
                } finally {
                    setResolvingNewAccount(false)
                }
            } else {
                setResolvedNewAccountName(null)
                setNewResolutionError(null)
                setNewNameConfirmed(false)
            }
        }
        const timer = setTimeout(resolve, 400)
        return () => clearTimeout(timer)
    }, [newAccountNumber, newSelectedBank, schoolDisplayName, newBusinessName])

    const handleSaveNewBank = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newSelectedBank || !newAccountNumber || !newBusinessName) {
            toast.warning("Please fill in all bank account fields")
            return
        }
        if (newAccountNumber.trim().length !== 10) {
            toast.warning("Account number must be exactly 10 digits")
            return
        }
        if (newResolutionError) {
            toast.error("Please verify bank details before proceeding")
            return
        }
        if (resolvedNewAccountName && !newNameConfirmed) {
            toast.warning("Please confirm that the resolved account name matches your school")
            return
        }
        if (!schoolId) {
            toast.error("School identity missing. Please re-login.")
            return
        }

        try {
            setSavingNewBank(true)
            const selectedBankObj = bankList.find(b => b.code === newSelectedBank)
            await financeService.setupBank(schoolId, {
                business_name: newBusinessName.trim() || schoolDisplayName,
                settlement_bank: newSelectedBank,
                bank_name: selectedBankObj?.name || newSelectedBank,
                account_number: newAccountNumber.trim(),
                percentage_charge: 0
            })
            toast.success("School bank account connected successfully!")
            setIsAddBankModalOpen(false)
            setNewSelectedBank("")
            setNewAccountNumber("")
            setNewBusinessName(schoolDisplayName || "")
            setResolvedNewAccountName(null)
            setNewNameConfirmed(false)
            await Promise.all([loadAnalytics(), loadBankAudits()])
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to link bank account")
        } finally {
            setSavingNewBank(false)
        }
    }

    const handleSync = async (accountId?: string) => {
        if (!schoolId) return
        try {
            setLoading(true)
            const result = await financeService.syncSubaccountStatus(schoolId, accountId)
            toast.success(result.message || "Settlement status synchronized")
            await loadAnalytics()
        } catch (error: unknown) {
            const err = error as { message?: string }
            toast.error(err.message || "Sync failed")
        } finally {
            setLoading(false)
        }
    }

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
                notes: manualNotes.trim() || undefined
            })
            toast.success("Manual fee payment successfully recorded!")
            setIsManualModalOpen(false)
            // Reset form
            setManualAmount("")
            setManualNotes("")
            setManualStudentId("")
            // Refresh
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

    const handleExportCSV = () => {
        const txList = transactions.length > 0 ? transactions : analytics?.recentTransactions || []
        if (txList.length === 0) {
            toast.info("No transaction data available to export")
            return
        }
        const headers = ["Execution Date", "Student / Entity", "Classification", "Channel", "Amount (NGN)", "Status", "Reference Hash"]
        const rows = txList.map((t) => [
            format(new Date(t.createdAt), "yyyy-MM-dd HH:mm"),
            `"${t.student?.name || t.parent?.fullName || "Institutional Payer"}"`,
            `"${t.paymentType || "School Fee"}"`,
            `"${t.channel || "Online Gateway"}"`,
            t.amount,
            `"${t.status}"`,
            `"${t.paymentReference || t.reference || t.id}"`
        ])
        const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `qefas_finance_ledger_${format(new Date(), "yyyyMMdd_HHmm")}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success("Financial ledger exported to CSV")
    }

    const openReceipt = (transaction: FinanceTransaction) => {
        setSelectedReceipt(transaction)
        setIsReceiptModalOpen(true)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[65vh] gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <Landmark className="absolute inset-0 m-auto h-6 w-6 text-primary" />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest">
                        Loading Financial Records
                    </p>
                    <p className="text-slate-400 text-xs font-medium">Connecting to payment gateways and updating records...</p>
                </div>
            </div>
        )
    }

    const totalRevenue = analytics?.totalRevenue || 0
    const pendingRevenue = analytics?.pendingRevenue || 0
    const activePayers = analytics?.activePayerCount || 0
    const averageTransaction = analytics?.averageTransaction || 0
    const monthlyTrends = analytics?.monthlyTrends || []
    const categoryBreakdown = analytics?.categoryBreakdown || []
    const accounts = analytics?.accounts || []

    return (
        <div className="space-y-8 pb-20 max-w-[1600px] mx-auto px-4 sm:px-6">
            {/* Header / Hero */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
                <div className="space-y-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white -ml-2.5 rounded-xl h-8 text-xs font-bold"
                        onClick={() => router.push("/dashboard/admin")}
                    >
                        <ChevronLeft size={16} className="mr-1" /> Back to Overview
                    </Button>
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                                Finance Hub
                            </h1>
                            {analytics?.isVerified ? (
                                <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">Gateway Verified</span>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsAddBankModalOpen(true)}
                                    className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-500/20 cursor-pointer transition-colors"
                                >
                                    <Clock className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">Setup Pending (Add Bank)</span>
                                </button>
                            )}
                            <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                                <Lock className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-wider">256-Bit Encrypted</span>
                            </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">
                            Real-time tracking of student fee payments, collections, and bank payouts
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        onClick={() => setIsManualModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white h-12 px-5 rounded-2xl font-bold shadow-lg shadow-blue-600/25 dark:shadow-blue-900/40 gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <Plus size={18} />
                        Record Fee Payment
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleExportCSV}
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 h-12 px-5 rounded-2xl font-bold shadow-sm gap-2"
                    >
                        <Download size={16} />
                        Export Transactions
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={() => setIsAddBankModalOpen(true)}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 h-12 px-5 rounded-2xl font-bold shadow-sm gap-2 cursor-pointer"
                    >
                        <Landmark size={16} />
                        Add Bank Account
                    </Button>
                </div>
            </div>

            {/* Quick Stats Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    {
                        title: "Total Revenue Collected",
                        value: `₦${totalRevenue.toLocaleString()}`,
                        caption: "Verified online and manual payments",
                        icon: TrendingUp,
                        color: "text-emerald-600 dark:text-emerald-400",
                        bg: "bg-emerald-500/10",
                        border: "border-emerald-500/20"
                    },
                    {
                        title: "Pending Collections",
                        value: `₦${pendingRevenue.toLocaleString()}`,
                        caption: "Awaiting bank confirmation",
                        icon: Wallet,
                        color: "text-amber-600 dark:text-amber-400",
                        bg: "bg-amber-500/10",
                        border: "border-amber-500/20"
                    },
                    {
                        title: "Active Fee Payers",
                        value: activePayers.toLocaleString(),
                        caption: "Parents and guardians who paid",
                        icon: Users,
                        color: "text-blue-600 dark:text-blue-400",
                        bg: "bg-blue-500/10",
                        border: "border-blue-500/20"
                    },
                    {
                        title: "Average Payment",
                        value: `₦${averageTransaction.toLocaleString()}`,
                        caption: "Average payment per transaction",
                        icon: CreditCard,
                        color: "text-purple-600 dark:text-purple-400",
                        bg: "bg-purple-500/10",
                        border: "border-purple-500/20"
                    },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <div className={cn("size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", stat.bg, stat.color)}>
                                <stat.icon size={22} strokeWidth={2.5} />
                            </div>
                            <span className={cn("text-[10px] font-black uppercase px-2.5 py-1 rounded-full border", stat.bg, stat.color, stat.border)}>
                                Live
                            </span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                {stat.title}
                            </span>
                            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                {stat.value}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                                {stat.caption}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-px">
                    <TabsList className="bg-transparent h-12 p-0 space-x-2">
                        <TabsTrigger
                            value="overview"
                            className="data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 rounded-xl px-5 h-10 font-bold text-xs uppercase tracking-wider transition-all"
                        >
                            <Sparkles size={14} className="mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="transactions"
                            className="data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 rounded-xl px-5 h-10 font-bold text-xs uppercase tracking-wider transition-all"
                        >
                            <Receipt size={14} className="mr-2" />
                            Transactions ({totalTransactions})
                        </TabsTrigger>
                        <TabsTrigger
                            value="vault"
                            className="data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 rounded-xl px-5 h-10 font-bold text-xs uppercase tracking-wider transition-all"
                        >
                            <Landmark size={14} className="mr-2" />
                            Bank Accounts ({accounts.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="transcripts"
                            className="data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-900 rounded-xl px-5 h-10 font-bold text-xs uppercase tracking-wider transition-all"
                        >
                            <GraduationCap size={14} className="mr-2" />
                            Transcripts ({analytics?.transcriptCount || 0})
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* TAB 1: OVERVIEW & LIQUIDITY */}
                <TabsContent value="overview" className="space-y-8 focus:outline-none">
                    {/* Payment Account Status Overview */}
                    {analytics?.paymentStatus && (
                        <PaymentStatusCard
                            status={analytics.paymentStatus}
                            schoolId={schoolId}
                            onRefresh={handleSync}
                        />
                    )}

                    {/* Liquidity Chart & Category Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Monthly Trends Area Chart */}
                        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        Income Trend
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        Monthly fee collections (Last 6 Months)
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-blue-600" />
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Revenue (₦)</span>
                                </div>
                            </div>

                            <div className="h-[280px] w-full">
                                {monthlyTrends.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="financeRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                            <XAxis
                                                dataKey="month"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
                                            />
                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
                                                tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                                            />
                                            <RechartsTooltip
                                                contentStyle={{
                                                    backgroundColor: "#0f172a",
                                                    borderRadius: "1rem",
                                                    border: "none",
                                                    color: "#fff",
                                                    fontSize: "12px",
                                                    padding: "10px 14px",
                                                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
                                                }}
                                                formatter={(value: any) => [`₦${Number(value).toLocaleString()}`, "Revenue"]}
                                                labelStyle={{ fontWeight: 800, color: "#94a3b8", marginBottom: "4px" }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#2563eb"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#financeRevenueGrad)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                                        <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                             <TrendingUp size={24} />
                                        </div>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Payment Trends Yet</p>
                                        <p className="text-xs text-slate-400 max-w-xs">Chart updates automatically as school fee payments are received.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Category Breakdown */}
                        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Fee Categories</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Income breakdown by fee type</p>
                            </div>

                            <div className="space-y-4 flex-1">
                                {categoryBreakdown.length > 0 ? (
                                    categoryBreakdown.map((cat, idx) => (
                                        <div key={idx} className="space-y-1.5">
                                            <div className="flex items-center justify-between text-xs font-bold">
                                                <span className="text-slate-700 dark:text-slate-300">{cat.category}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-900 dark:text-white font-black">
                                                        ₦{cat.amount.toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-semibold">({cat.percentage}%)</span>
                                                </div>
                                            </div>
                                            <Progress value={cat.percentage} className="h-2 rounded-full" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 text-slate-400">
                                        <Wallet size={32} />
                                        <p className="text-xs font-semibold">All categories default to Tuition & General Fees</p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-medium">Active Channels</span>
                                <div className="flex items-center gap-1.5">
                                    <Badge variant="outline" className="text-[10px] font-bold">Card</Badge>
                                    <Badge variant="outline" className="text-[10px] font-bold">Transfer</Badge>
                                    <Badge variant="outline" className="text-[10px] font-bold">Cash</Badge>
                                    <Badge variant="outline" className="text-[10px] font-bold">POS</Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Settlement Accounts Carousel/Row */}
                    {accounts.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Bank Accounts for Payouts</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        Verified bank accounts receiving automated online fee deposits
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push("/dashboard/admin/finance/bank-setup")}
                                    className="font-bold text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 gap-1"
                                >
                                    <span>Manage Bank Accounts</span>
                                    <ArrowRight size={14} />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {accounts.map((acc) => (
                                    <AtmAccountCard
                                        key={acc.id}
                                        account={{
                                            ...acc,
                                            status: acc.status as "active" | "pending" | "unverified"
                                        }}
                                        onRefresh={(id) => handleSync(id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Stream Preview */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Latest fee payments recorded online and manually
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveTab("transactions")}
                                className="rounded-xl font-bold text-xs gap-1.5"
                            >
                                <span>View All Transactions</span>
                                <ArrowRight size={14} />
                            </Button>
                        </div>

                        {analytics?.recentTransactions && analytics.recentTransactions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-slate-100 dark:border-slate-800">
                                            <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Date</TableHead>
                                            <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Student / Payer</TableHead>
                                            <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Fee Type</TableHead>
                                            <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Payment Method</TableHead>
                                            <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Amount</TableHead>
                                            <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Status</TableHead>
                                            <TableHead className="text-right text-slate-400 uppercase text-[10px] font-black tracking-wider">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {analytics.recentTransactions.slice(0, 5).map((t) => (
                                            <TableRow key={t.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                                <TableCell className="font-semibold text-xs text-slate-500">
                                                    {format(new Date(t.createdAt), "MMM d, yyyy • HH:mm")}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                                                        {t.student?.name || t.parent?.fullName || "General Payer"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-bold text-[10px]">
                                                        {t.paymentType || "School Fee"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                    {t.channel || "Online Gateway"}
                                                </TableCell>
                                                <TableCell className="font-black text-sm text-slate-900 dark:text-white">
                                                    ₦{t.amount.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {t.status === "SUCCESS" || t.status === "COMPLETED" ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                            <CheckCircle2 size={12} /> Success
                                                        </span>
                                                    ) : t.status === "PENDING" ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                            <Clock size={12} /> Pending
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/10 text-red-600 dark:text-red-400">
                                                            <XCircle size={12} /> Failed
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openReceipt(t)}
                                                        className="h-8 rounded-lg text-xs font-bold gap-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                                    >
                                                        <Receipt size={14} />
                                                        Receipt
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-12 text-center text-slate-400 text-xs">
                                No transactions recorded yet. Record your first payment above.
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* TAB 2: TRANSACTIONS & LEDGER */}
                <TabsContent value="transactions" className="space-y-6 focus:outline-none">
                    {/* Filter and Search Bar */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search student name or reference code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-11 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-medium"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-11 rounded-2xl border-slate-200 dark:border-slate-800 w-[140px] text-xs font-bold">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="SUCCESS">Success / Cleared</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="FAILED">Failed</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="h-11 rounded-2xl border-slate-200 dark:border-slate-800 w-[150px] text-xs font-bold">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Categories</SelectItem>
                                    <SelectItem value="TUITION">Tuition Fee</SelectItem>
                                    <SelectItem value="EXAM_FEE">Exam Fee</SelectItem>
                                    <SelectItem value="UNIFORM">Uniforms</SelectItem>
                                    <SelectItem value="BUS_TRANSPORT">Transportation</SelectItem>
                                    <SelectItem value="PTA_LEVY">PTA Levy</SelectItem>
                                    <SelectItem value="OTHER">Other Fees</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                onClick={handleExportCSV}
                                className="h-11 rounded-2xl font-bold text-xs gap-1.5"
                            >
                                <Download size={14} />
                                Export CSV
                            </Button>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                        {transactionsLoading ? (
                            <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <span className="text-xs font-bold uppercase tracking-wider">Filtering transactions...</span>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 px-4">
                                <div className="size-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                                    <Receipt size={32} />
                                </div>
                                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No Transactions Found</h4>
                                <p className="text-xs text-slate-400 max-w-sm">
                                    No transactions match your search or filter criteria.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30">
                                        <TableRow className="border-b border-slate-100 dark:border-slate-800">
                                            <TableHead className="pl-6 py-4 text-slate-400 uppercase text-[10px] font-black tracking-wider">Date & Time</TableHead>
                                            <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Student / Payer</TableHead>
                                            <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Fee Type</TableHead>
                                            <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Channel</TableHead>
                                            <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Amount</TableHead>
                                            <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Status</TableHead>
                                            <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Reference</TableHead>
                                            <TableHead className="pr-6 text-right text-slate-400 uppercase text-[10px] font-black tracking-wider">Receipt</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map((t) => (
                                            <TableRow key={t.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <TableCell className="pl-6 py-4 text-xs font-semibold text-slate-500 whitespace-nowrap">
                                                    {format(new Date(t.createdAt), "MMM d, yyyy • HH:mm")}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                                                            {t.student?.name || t.parent?.fullName || "General Payer"}
                                                        </span>
                                                        {t.student?.studentCode && (
                                                            <span className="text-[10px] text-slate-400 font-mono">
                                                                ID: {t.student.studentCode}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-bold text-[10px] tracking-wide">
                                                        {t.paymentType || "School Fee"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                    {t.channel || "Online Gateway"}
                                                </TableCell>
                                                <TableCell className="font-black text-sm text-slate-900 dark:text-white whitespace-nowrap">
                                                    ₦{t.amount.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {t.status === "SUCCESS" || t.status === "COMPLETED" ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                            <CheckCircle2 size={12} /> Success
                                                        </span>
                                                    ) : t.status === "PENDING" ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                            <Clock size={12} /> Pending
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                                                            <XCircle size={12} /> Failed
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-mono text-[10px] text-slate-400 max-w-[140px] truncate" title={t.paymentReference || t.reference || t.id}>
                                                    {t.paymentReference || t.reference || t.id}
                                                </TableCell>
                                                <TableCell className="pr-6 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openReceipt(t)}
                                                        className="h-8 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 gap-1"
                                                    >
                                                        <Receipt size={14} />
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Pagination Bar */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-medium">
                                    Page {currentPage} of {totalPages} ({totalTransactions} records)
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage <= 1 || transactionsLoading}
                                        onClick={() => loadTransactions(currentPage - 1)}
                                        className="h-9 px-3 rounded-xl text-xs font-bold"
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage >= totalPages || transactionsLoading}
                                        onClick={() => loadTransactions(currentPage + 1)}
                                        className="h-9 px-3 rounded-xl text-xs font-bold"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* TAB 3: BANK ACCOUNTS */}
                <TabsContent value="vault" className="space-y-8 focus:outline-none">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">School Bank Accounts</h3>
                                <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/40 text-[10px] font-black uppercase">
                                    Direct Settlement
                                </Badge>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
                                Configure institutional settlement accounts where student tuition, exam payments, and portal fees are directly deposited.
                            </p>
                        </div>
                        <Button
                            onClick={() => {
                                if (!newBusinessName.trim() && schoolDisplayName) {
                                    setNewBusinessName(schoolDisplayName)
                                }
                                setIsAddBankModalOpen(true)
                            }}
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
                                        status: acc.status as "active" | "pending" | "unverified"
                                    }}
                                    onRefresh={(id) => handleSync(id)}
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
                                    Set up your school bank account to enable automatic direct deposits from fee payments.
                                </p>
                            </div>
                            <Button
                                onClick={() => {
                                    if (!newBusinessName.trim() && schoolDisplayName) {
                                        setNewBusinessName(schoolDisplayName)
                                    }
                                    setIsAddBankModalOpen(true)
                                }}
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
                                onClick={loadBankAudits}
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
                                                                {(audit.userName || "Admin").substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                                                    {audit.userName || "System Administrator"}
                                                                </span>
                                                                <div className="flex items-center gap-1.5 pt-0.5">
                                                                    <span className="text-[10px] px-1.5 py-0.2 rounded font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                                        {audit.userRole || "ADMIN"}
                                                                    </span>
                                                                    {audit.userEmail && (
                                                                        <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                                                            {audit.userEmail}
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
                </TabsContent>

                {/* TAB 4: TRANSCRIPTS REVENUE */}
                <TabsContent value="transcripts" className="space-y-6 focus:outline-none">
                    {/* Transcript Financial Highlights Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <TrendingUp size={22} strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                    Revenue
                                </span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Transcript Revenue
                                </span>
                                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    ₦{((analytics?.transcriptRevenue || 0)).toLocaleString()}
                                </p>
                                <p className="text-xs text-slate-500 font-medium pt-0.5">
                                    From graduated student transcript downloads
                                </p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    <GraduationCap size={22} strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border bg-blue-500/10 text-blue-600 border-blue-500/20">
                                    Completed
                                </span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Completed Requests
                                </span>
                                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {analytics?.transcriptCount || 0}
                                </p>
                                <p className="text-xs text-slate-500 font-medium pt-0.5">
                                    Official transcripts downloaded
                                </p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                    <CreditCard size={22} strokeWidth={2.5} />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleOpenFeeModal}
                                    className="h-7 px-2.5 rounded-lg text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 gap-1 cursor-pointer"
                                    title="Click to edit transcript fee"
                                >
                                    <Edit2 size={11} />
                                    <span>Set Fee</span>
                                </Button>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Transcript Fee
                                </span>
                                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    ₦{configuredTranscriptFee.toLocaleString()}
                                </p>
                                <p className="text-xs text-slate-500 font-medium pt-0.5">
                                    Configured fee for graduated student downloads
                                </p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                    <ShieldCheck size={22} strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border bg-amber-500/10 text-amber-600 border-amber-500/20">
                                    Active
                                </span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Payout Method
                                </span>
                                <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                                    Flutterwave Split
                                </p>
                                <p className="text-xs text-slate-500 font-medium pt-0.5">
                                    Deposited into registered bank account
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Conduit Informational Banner */}
                    <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent border border-blue-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
                                <Landmark className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white text-base">
                                    Direct Bank Deposits for Transcript Fees
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 max-w-2xl">
                                    When graduated students pay to download their official academic transcripts, payments are automatically deposited into your connected school bank account.
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsAddBankModalOpen(true)}
                            variant="outline"
                            className="rounded-xl h-10 px-4 text-xs font-bold whitespace-nowrap bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 cursor-pointer"
                        >
                            Configure Bank Account
                            <ArrowRight size={14} className="ml-1.5" />
                        </Button>
                    </div>

                    {/* Transcripts Transactions Ledger */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <GraduationCap size={18} className="text-blue-600" />
                                    Transcript Payments
                                </h3>
                                <p className="text-xs text-slate-400 font-medium">
                                    Log of payments for official student transcripts.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportCSV}
                                className="rounded-xl text-xs font-bold gap-2"
                            >
                                <Download size={14} />
                                Export Transcript Payments
                            </Button>
                        </div>

                        {(() => {
                            const transcriptList = (analytics?.transcriptTransactions || []).length > 0 
                                ? analytics!.transcriptTransactions! 
                                : transactions.filter(t => (t.paymentType || "").toUpperCase().includes("TRANSCRIPT"));

                            if (transcriptList.length === 0) {
                                return (
                                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 px-4">
                                        <div className="size-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                                            <GraduationCap size={32} />
                                        </div>
                                        <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No Transcript Fees Yet</h4>
                                        <p className="text-xs text-slate-400 max-w-sm">
                                            When students or alumni pay to unlock their transcripts or session records, transactions will appear here with live payment status.
                                        </p>
                                    </div>
                                );
                            }

                            return (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30">
                                            <TableRow className="border-b border-slate-100 dark:border-slate-800">
                                                <TableHead className="pl-6 py-4 text-slate-400 uppercase text-[10px] font-black tracking-wider">Date & Time</TableHead>
                                                <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Student</TableHead>
                                                <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Academic Session</TableHead>
                                                <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Amount Paid</TableHead>
                                                <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Payout Method</TableHead>
                                                <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Status</TableHead>
                                                <TableHead className="pr-6 text-right text-slate-400 uppercase text-[10px] font-black tracking-wider">Receipt</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transcriptList.map((t) => (
                                                <TableRow key={t.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <TableCell className="pl-6 py-4 text-xs font-semibold text-slate-500 whitespace-nowrap">
                                                        {format(new Date(t.createdAt), "MMM d, yyyy • HH:mm")}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                                                                {t.student?.name || "Student"}
                                                            </span>
                                                            {t.student?.studentCode && (
                                                                <span className="text-[10px] text-slate-400 font-mono">
                                                                    ID: {t.student.studentCode}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                        {t.session || "Cumulative / All Sessions"}
                                                    </TableCell>
                                                    <TableCell className="font-black text-sm text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                                        ₦{t.amount.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-xs font-semibold text-slate-500">
                                                        <span className="inline-flex items-center gap-1">
                                                            <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                                                            {t.channel || "Flutterwave Subaccount"}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {t.status === "SUCCESS" || t.status === "COMPLETED" ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                                <CheckCircle2 size={12} /> Completed
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                                <Clock size={12} /> Pending
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="pr-6 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openReceipt(t)}
                                                            className="h-8 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 gap-1"
                                                        >
                                                            <Receipt size={14} />
                                                            Receipt
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            );
                        })()}
                    </div>
                </TabsContent>
            </Tabs>

            {/* MODAL 1: RECORD MANUAL PAYMENT */}
            <Dialog open={isManualModalOpen} onOpenChange={setIsManualModalOpen}>
                <DialogContent className="max-w-xl p-0 overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border-none shadow-2xl">
                    <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white relative">
                        <DialogTitle className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                            <Receipt className="size-6 text-blue-400" />
                            Record Fee Payment
                        </DialogTitle>
                        <DialogDescription className="text-slate-300 text-xs mt-1">
                            Record cash, bank transfer, or POS fee payments received offline.
                        </DialogDescription>
                    </div>

                    <form onSubmit={handleRecordPayment} className="p-6 sm:p-8 space-y-5">
                        {/* Student Search & Select */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Student <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder="Search student name or admission ID..."
                                value={studentSearchTerm}
                                onChange={(e) => setStudentSearchTerm(e.target.value)}
                                className="h-10 text-xs rounded-xl border-slate-200 dark:border-slate-800"
                            />
                            <Select value={manualStudentId} onValueChange={setManualStudentId}>
                                <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold">
                                    <SelectValue placeholder="Select student from directory" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((st: { id: string; name?: string; firstName?: string; lastName?: string; studentCode?: string }) => {
                                            const name = st.name || `${st.firstName || ""} ${st.lastName || ""}`.trim() || "Student"
                                            return (
                                                <SelectItem key={st.id} value={st.id} className="text-xs font-medium">
                                                    {name} {st.studentCode ? `(${st.studentCode})` : ""}
                                                </SelectItem>
                                            )
                                        })
                                    ) : (
                                        <div className="p-3 text-xs text-slate-400 text-center">No students found</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Amount & Classification */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Amount (₦) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="e.g. 75000"
                                    value={manualAmount}
                                    onChange={(e) => setManualAmount(e.target.value)}
                                    className="h-11 text-sm font-black rounded-xl border-slate-200 dark:border-slate-800"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Fee Type <span className="text-red-500">*</span>
                                </Label>
                                <Select value={manualType} onValueChange={setManualType}>
                                    <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold">
                                        <SelectValue placeholder="Select Fee Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TUITION">Tuition / Term Fee</SelectItem>
                                        <SelectItem value="EXAM_FEE">Examination Fee</SelectItem>
                                        <SelectItem value="UNIFORM">School Uniform</SelectItem>
                                        <SelectItem value="BUS_TRANSPORT">Transportation / Bus</SelectItem>
                                        <SelectItem value="PTA_LEVY">PTA Levy</SelectItem>
                                        <SelectItem value="OTHER">Other / Miscellaneous</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Method & Academic Period */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Payment Method
                                </Label>
                                <Select value={manualMethod} onValueChange={setManualMethod}>
                                    <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold">
                                        <SelectValue placeholder="Method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CASH">Cash Deposit</SelectItem>
                                        <SelectItem value="BANK_TRANSFER">Direct Bank Transfer</SelectItem>
                                        <SelectItem value="POS">POS Terminal</SelectItem>
                                        <SelectItem value="CHEQUE">Bank Cheque</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Academic Term
                                </Label>
                                <Select value={manualTerm} onValueChange={setManualTerm}>
                                    <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold">
                                        <SelectValue placeholder="Term" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="First Term">First Term</SelectItem>
                                        <SelectItem value="Second Term">Second Term</SelectItem>
                                        <SelectItem value="Third Term">Third Term</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Academic Session
                                </Label>
                                <Input
                                    placeholder="2025/2026"
                                    value={manualSession}
                                    onChange={(e) => setManualSession(e.target.value)}
                                    className="h-11 text-xs font-bold rounded-xl border-slate-200 dark:border-slate-800"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Payment Notes / Reference (Optional)
                            </Label>
                            <Textarea
                                placeholder="e.g. Paid in cash at bursary counter, bank teller ref #847291..."
                                value={manualNotes}
                                onChange={(e) => setManualNotes(e.target.value)}
                                className="min-h-[80px] rounded-xl border-slate-200 dark:border-slate-800 text-xs"
                            />
                        </div>

                        <DialogFooter className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsManualModalOpen(false)}
                                className="h-11 px-5 rounded-xl font-bold text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={manualSubmitting || !manualStudentId || !manualAmount}
                                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white h-11 px-6 rounded-xl font-bold text-xs gap-2 shadow-lg shadow-blue-600/25 dark:shadow-blue-900/30 cursor-pointer"
                            >
                                {manualSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Saving Payment...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={16} />
                                        Save Payment Record
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL 2: TRANSACTION RECEIPT */}
            <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
                <DialogContent className="max-w-md p-0 overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border-none shadow-2xl">
                    {selectedReceipt && (
                        <div className="p-8 space-y-6">
                            {/* Receipt Header */}
                            <div className="text-center space-y-2 border-b border-dashed border-slate-200 dark:border-slate-800 pb-6">
                                <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                                    <Receipt size={24} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    School Fee Payment Receipt
                                </h3>
                                <p className="text-[11px] font-mono text-slate-400">
                                    REF: {selectedReceipt.paymentReference || selectedReceipt.reference || selectedReceipt.id}
                                </p>
                            </div>

                            {/* Amount Paid & Status */}
                            <div className="text-center py-2 space-y-1 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount Paid</span>
                                <p className="text-3xl font-black text-slate-900 dark:text-white">
                                    ₦{selectedReceipt.amount.toLocaleString()}
                                </p>
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                                    <CheckCircle2 size={12} /> {selectedReceipt.status}
                                </span>
                            </div>

                            {/* Details List */}
                            <div className="space-y-3 text-xs">
                                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                                    <span className="text-slate-400 font-medium">Student / Payer</span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {selectedReceipt.student?.name || selectedReceipt.parent?.fullName || "General Student"}
                                    </span>
                                </div>

                                {selectedReceipt.student?.studentCode && (
                                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                                        <span className="text-slate-400 font-medium">Student Code</span>
                                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                                            {selectedReceipt.student.studentCode}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                                    <span className="text-slate-400 font-medium">Fee Type</span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {selectedReceipt.paymentType || "School Fee"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                                    <span className="text-slate-400 font-medium">Payment Channel</span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {selectedReceipt.channel || "Online Gateway"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                                    <span className="text-slate-400 font-medium">Payment Date & Time</span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {format(new Date(selectedReceipt.createdAt), "PPpp")}
                                    </span>
                                </div>

                                {selectedReceipt.term && (
                                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                                        <span className="text-slate-400 font-medium">Academic Term & Session</span>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {selectedReceipt.term} {selectedReceipt.session ? `(${selectedReceipt.session})` : ""}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="pt-2 flex items-center justify-between gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => window.print()}
                                    className="flex-1 h-11 rounded-xl font-bold text-xs gap-1.5"
                                >
                                    <Printer size={16} />
                                    Print Receipt
                                </Button>
                                <Button
                                    onClick={() => setIsReceiptModalOpen(false)}
                                    className="flex-1 h-11 rounded-xl font-bold text-xs bg-slate-900 text-white dark:bg-slate-800 dark:text-white hover:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Configure Transcript Clearance Fee Dialog */}
            <Dialog open={isEditFeeModalOpen} onOpenChange={setIsEditFeeModalOpen}>
                <DialogContent className="max-w-md rounded-3xl p-6">
                    <DialogHeader className="space-y-2">
                        <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1">
                            <CreditCard size={24} />
                        </div>
                        <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
                            Set Transcript Clearance Fee
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500 leading-relaxed">
                            Set the fee charged to graduated students and alumni to preview and download their official academic transcript.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Transcript Fee Amount (₦)
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                                    ₦
                                </span>
                                <Input
                                    type="number"
                                    min="0"
                                    step="500"
                                    placeholder="5000"
                                    value={editingFee}
                                    onChange={(e) => setEditingFee(e.target.value)}
                                    className="pl-8 h-12 rounded-2xl text-base font-bold text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 focus:ring-purple-500"
                                />
                            </div>
                            <p className="text-[11px] text-slate-400">
                                Default fee is ₦5,000. Each payment allows the student to download 1 official stamped transcript copy.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-purple-900 dark:text-purple-200 space-y-1">
                            <p className="font-bold flex items-center gap-1.5">
                                <ShieldCheck size={14} className="text-purple-600" />
                                Automatic Bank Deposits
                            </p>
                            <p className="text-[11px] text-purple-700 dark:text-purple-300">
                                Fees paid by students are automatically transferred to your school's registered bank account via Flutterwave split payments.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => setIsEditFeeModalOpen(false)}
                            className="rounded-xl h-11 text-xs font-bold"
                            disabled={isSavingFee}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveTranscriptFee}
                            className="rounded-xl h-11 px-5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20"
                            disabled={isSavingFee}
                        >
                            {isSavingFee ? (
                                <>
                                    <Loader2 size={14} className="animate-spin mr-1.5" />
                                    Saving...
                                </>
                            ) : (
                                "Save Fee"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL 4: ADD SCHOOL BANK ACCOUNT */}
            <Dialog open={isAddBankModalOpen} onOpenChange={setIsAddBankModalOpen}>
                <DialogContent className="max-w-xl p-0 overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border-none shadow-2xl">
                    {/* Header */}
                    <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-64 h-full bg-blue-500/10 blur-2xl pointer-events-none" />
                        <div className="relative z-10 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="size-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                                    <Landmark className="size-5" />
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-400/15 text-blue-300 border border-blue-400/30">
                                    Official Settlement Conduit
                                </span>
                            </div>
                            <DialogTitle className="text-2xl font-black tracking-tight text-white">
                                Connect School Bank Account
                            </DialogTitle>
                            <DialogDescription className="text-blue-100/80 text-xs">
                                Route fee collections, transcript payments, and student disbursements directly into your school's verified bank account.
                            </DialogDescription>
                        </div>
                    </div>

                    <form onSubmit={handleSaveNewBank} className="p-6 sm:p-8 space-y-5 max-h-[75vh] overflow-y-auto">
                        {/* Live Virtual Bank Card Preview */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl border border-white/10">
                            <div className="absolute -right-16 -top-16 size-48 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
                            <div className="absolute -left-16 -bottom-16 size-48 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

                            <div className="relative z-10 flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    {/* Gold EMV Chip */}
                                    <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 border border-amber-600/40 shadow-inner flex items-center justify-center relative overflow-hidden shrink-0">
                                        <div className="w-full h-px bg-amber-700/30 absolute top-2" />
                                        <div className="w-full h-px bg-amber-700/30 absolute bottom-2" />
                                        <div className="h-full w-px bg-amber-700/30 absolute left-3" />
                                        <div className="h-full w-px bg-amber-700/30 absolute right-3" />
                                    </div>
                                    <Zap size={15} className="text-amber-300 shrink-0" />
                                </div>

                                <div className="text-right">
                                    <span className="text-[10px] font-black tracking-widest uppercase text-blue-300 block truncate max-w-[180px]">
                                        {bankList.find(b => b.code === newSelectedBank)?.name || "SELECT COMMERCIAL BANK"}
                                    </span>
                                    <span className="text-[9px] font-medium text-slate-400">
                                        Direct NUBAN Conduit
                                    </span>
                                </div>
                            </div>

                            {/* Card Account Number */}
                            <div className="relative z-10 mb-5">
                                <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase block mb-1">
                                    NUBAN Account Number
                                </span>
                                <div className="font-mono text-xl sm:text-2xl font-black tracking-[0.25em] text-white">
                                    {newAccountNumber ? (
                                        <>
                                            {newAccountNumber.slice(0, 4)}  {newAccountNumber.slice(4, 7)}  {newAccountNumber.slice(7, 10)}
                                            {"•".repeat(Math.max(0, 10 - newAccountNumber.length))}
                                        </>
                                    ) : (
                                        "••••  •••  •••"
                                    )}
                                </div>
                            </div>

                            {/* Card Bottom Row */}
                            <div className="relative z-10 flex items-end justify-between gap-4 pt-2 border-t border-white/10">
                                <div className="min-w-0 flex-1">
                                    <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase block">
                                        School Account Beneficiary
                                    </span>
                                    <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-100 truncate">
                                        {newBusinessName.trim() || schoolDisplayName.toUpperCase() || "SCHOOL INSTITUTION"}
                                    </p>
                                </div>

                                <div className="shrink-0">
                                    {resolvedNewAccountName ? (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm animate-in fade-in">
                                            <CheckCircle2 size={12} className="text-emerald-400" /> VERIFIED
                                        </div>
                                    ) : resolvingNewAccount ? (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/40 animate-pulse">
                                            <Loader2 size={12} className="animate-spin text-blue-400" /> VERIFYING
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/5 text-slate-400 border border-white/10">
                                            NUBAN ROUTING
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sandbox Test Mode Helper */}
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2.5">
                                <span className="text-lg">🧪</span>
                                <div>
                                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                                        Testing in Sandbox Mode?
                                    </span>
                                    <span className="text-[11px] text-amber-700 dark:text-amber-400">
                                        Test with Access Bank (044) & account <code className="font-mono font-bold">0690000031</code>
                                    </span>
                                </div>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    const access = bankList.find(b => b.code === "044") || bankList.find(b => b.name.toLowerCase().includes("access"))
                                    if (access) setNewSelectedBank(access.code)
                                    setNewAccountNumber("0690000031")
                                    if (!newBusinessName.trim() && schoolDisplayName) {
                                        setNewBusinessName(schoolDisplayName)
                                    }
                                }}
                                className="h-8 px-3 text-[11px] font-black rounded-xl border-amber-400/50 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-950/40 self-start sm:self-auto shrink-0 cursor-pointer"
                            >
                                ⚡ Auto-Fill Test Account
                            </Button>
                        </div>

                        {/* Popular Banks Quick-Select Chips */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Popular Commercial Banks
                                </span>
                                <span className="text-[10px] text-slate-400">1-Tap Select</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    { label: "Access Bank", match: "access" },
                                    { label: "GTBank", match: "guaranty" },
                                    { label: "Zenith Bank", match: "zenith" },
                                    { label: "First Bank", match: "first bank" },
                                    { label: "UBA", match: "united bank for africa" },
                                    { label: "Kuda", match: "kuda" },
                                    { label: "OPay", match: "paycom" },
                                    { label: "PalmPay", match: "palmpay" },
                                ].map((p, i) => {
                                    const found = bankList.find(b => b.name.toLowerCase().includes(p.match))
                                    if (!found) return null
                                    const isSelected = newSelectedBank === found.code

                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => {
                                                setNewSelectedBank(found.code)
                                                setResolvedNewAccountName(null)
                                                setNewResolutionError(null)
                                                setNewNameConfirmed(false)
                                            }}
                                            className={cn(
                                                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                                                isSelected
                                                    ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/30 scale-105"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700"
                                            )}
                                        >
                                            {p.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Full Bank Selector */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Commercial Bank <span className="text-red-500">*</span>
                            </Label>
                            <Select 
                                value={newSelectedBank} 
                                onValueChange={(val) => {
                                    setNewSelectedBank(val)
                                    setResolvedNewAccountName(null)
                                    setNewResolutionError(null)
                                    setNewNameConfirmed(false)
                                }}
                                disabled={fetchingBankList}
                            >
                                <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold">
                                    <SelectValue placeholder={fetchingBankList ? "Loading bank directory..." : "Choose commercial bank from full list"} />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {bankList.map((b) => (
                                        <SelectItem key={b.code} value={b.code} className="text-xs font-medium">
                                            {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 10-Digit Account Number */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    10-Digit NUBAN Account Number <span className="text-red-500">*</span>
                                </Label>
                                <span className="text-[11px] font-mono text-slate-400">
                                    {newAccountNumber.length} / 10 digits
                                </span>
                            </div>
                            <div className="relative">
                                <Input
                                    type="text"
                                    maxLength={10}
                                    placeholder="e.g. 0123456789"
                                    value={newAccountNumber}
                                    onChange={(e) => setNewAccountNumber(e.target.value.replace(/\D/g, ""))}
                                    className="h-11 text-sm font-black tracking-widest font-mono rounded-xl border-slate-200 dark:border-slate-800 pr-10"
                                    required
                                />
                                {resolvingNewAccount ? (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                    </div>
                                ) : resolvedNewAccountName ? (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                ) : null}
                            </div>
                            <p className="text-[11px] text-slate-400">
                                Enter your 10-digit NUBAN number. The official account name will be verified automatically with the banking registry.
                            </p>
                        </div>

                        {/* Account Name Resolution Card */}
                        {resolvingNewAccount && (
                            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 flex items-center gap-3">
                                <Loader2 className="h-5 w-5 animate-spin text-blue-600 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-blue-900 dark:text-blue-200">Verifying Bank Account...</p>
                                    <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80">Checking account number with NIBSS registry</p>
                                </div>
                            </div>
                        )}

                        {resolvedNewAccountName && (
                            <div className="space-y-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                            Verified Account Name (NIBSS)
                                        </p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">
                                            {resolvedNewAccountName}
                                        </p>
                                    </div>
                                </div>

                                <label className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200/60 dark:border-emerald-800/30 cursor-pointer hover:bg-emerald-50/40 transition-colors select-none">
                                    <input
                                        type="checkbox"
                                        checked={newNameConfirmed}
                                        onChange={(e) => setNewNameConfirmed(e.target.checked)}
                                        className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                                    />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                        I confirm this bank account belongs to our school institution.
                                    </span>
                                </label>
                            </div>
                        )}

                        {newResolutionError && (
                            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300 font-medium">
                                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                                <span>{newResolutionError}</span>
                            </div>
                        )}

                        {/* School / Display Name (Requirement 1: Auto add school name in the display name) */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    School / Beneficiary Display Name <span className="text-red-500">*</span>
                                </Label>
                                {resolvedNewAccountName && (
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setNewBusinessName(schoolDisplayName || "")}
                                            className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                                        >
                                            Use School Name
                                        </button>
                                        <span className="text-[10px] text-slate-400">•</span>
                                        <button
                                            type="button"
                                            onClick={() => setNewBusinessName(resolvedNewAccountName)}
                                            className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                                        >
                                            Use Verified Name
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="relative">
                                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder={schoolDisplayName || "e.g. Qefas International Academy"}
                                    value={newBusinessName}
                                    onChange={(e) => setNewBusinessName(e.target.value)}
                                    className="pl-10 h-11 text-xs font-bold rounded-xl border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                                    required
                                />
                            </div>
                            <p className="text-[11px] text-slate-400">
                                Auto-populated with your school name. This display name is recorded in the bank audit log and shown on student payment receipts.
                            </p>
                        </div>

                        {/* Security Notice */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                            <Lock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <span>Encrypted connection. Direct bank transfers & online fee payouts are processed with 256-bit SSL encryption.</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsAddBankModalOpen(false)}
                                className="rounded-xl h-11 text-xs font-bold text-slate-500"
                                disabled={savingNewBank}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={savingNewBank || !newSelectedBank || newAccountNumber.trim().length !== 10 || !newBusinessName.trim() || (!!resolvedNewAccountName && !newNameConfirmed)}
                                className="rounded-xl h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white text-xs font-bold shadow-lg shadow-blue-600/25 dark:shadow-blue-900/40 transition-all cursor-pointer"
                            >
                                {savingNewBank ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin mr-1.5" />
                                        Connecting Bank...
                                    </>
                                ) : (
                                    "Save & Connect Bank"
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

"use client"

import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Landmark, Sparkles, Receipt, GraduationCap } from "lucide-react"
import { useAdminFinance } from "./hooks/useAdminFinance"
import { FinanceHeaderAndStats } from "./components/FinanceHeaderAndStats"
import { FinanceOverviewTab } from "./components/FinanceOverviewTab"
import { FinanceTransactionsTab } from "./components/FinanceTransactionsTab"
import { FinanceVaultTab } from "./components/FinanceVaultTab"
import { FinanceTranscriptsTab } from "./components/FinanceTranscriptsTab"
import {
    RecordManualPaymentModal,
    TransactionReceiptModal,
    TranscriptFeeConfigModal,
} from "./components/FinanceModals"
import { ConnectBankAccountModal } from "./components/ConnectBankAccountModal"

export default function AdminFinancePage() {
    const f = useAdminFinance()

    if (f.loading) {
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
                    <p className="text-slate-400 text-xs font-medium">
                        Connecting to payment gateways and updating records...
                    </p>
                </div>
            </div>
        )
    }

    const totalRevenue = f.analytics?.totalRevenue || 0
    const pendingRevenue = f.analytics?.pendingRevenue || 0
    const activePayers = f.analytics?.activePayerCount || 0
    const averageTransaction = f.analytics?.averageTransaction || 0
    const accounts = f.analytics?.accounts || []

    return (
        <div className="space-y-8 pb-20 max-w-[1600px] mx-auto px-4 sm:px-6">
            <FinanceHeaderAndStats
                isVerified={f.analytics?.isVerified}
                isSchoolPaidPlan={f.isSchoolPaidPlan}
                schoolPlanName={f.schoolPlanName}
                totalRevenue={totalRevenue}
                pendingRevenue={pendingRevenue}
                activePayers={activePayers}
                averageTransaction={averageTransaction}
                onBack={() => f.router.push("/dashboard/admin")}
                onOpenManualModal={() => f.setIsManualModalOpen(true)}
                onExportCSV={f.handleExportCSV}
                onOpenAddBankModal={() => f.setIsAddBankModalOpen(true)}
            />

            <Tabs value={f.activeTab} onValueChange={f.setActiveTab} className="space-y-6">
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
                            Transactions ({f.totalTransactions})
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
                            Transcripts ({f.analytics?.transcriptCount || 0})
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="focus:outline-none">
                    <FinanceOverviewTab
                        schoolId={f.schoolId}
                        analytics={f.analytics}
                        accounts={accounts}
                        onSync={f.handleSync}
                        onManageBanks={() => f.router.push("/dashboard/admin/finance/bank-setup")}
                        onViewAllTransactions={() => f.setActiveTab("transactions")}
                        onOpenReceipt={f.openReceipt}
                    />
                </TabsContent>

                <TabsContent value="transactions" className="focus:outline-none">
                    <FinanceTransactionsTab
                        transactions={f.transactions}
                        transactionsLoading={f.transactionsLoading}
                        searchQuery={f.searchQuery}
                        setSearchQuery={f.setSearchQuery}
                        statusFilter={f.statusFilter}
                        setStatusFilter={f.setStatusFilter}
                        categoryFilter={f.categoryFilter}
                        setCategoryFilter={f.setCategoryFilter}
                        currentPage={f.currentPage}
                        totalPages={f.totalPages}
                        totalTransactions={f.totalTransactions}
                        onPageChange={f.loadTransactions}
                        onExportCSV={f.handleExportCSV}
                        onOpenReceipt={f.openReceipt}
                    />
                </TabsContent>

                <TabsContent value="vault" className="focus:outline-none">
                    <FinanceVaultTab
                        accounts={accounts}
                        bankAudits={f.bankAudits}
                        loadingAudits={f.loadingAudits}
                        copiedAccount={f.copiedAccount}
                        setCopiedAccount={f.setCopiedAccount}
                        currentUserName={f.user?.name || undefined}
                        currentUserEmail={f.user?.email || undefined}
                        currentUserRole={f.user?.role || undefined}
                        onOpenAddBankModal={() => f.setIsAddBankModalOpen(true)}
                        onSync={f.handleSync}
                        onRefreshAudits={f.loadBankAudits}
                    />
                </TabsContent>

                <TabsContent value="transcripts" className="focus:outline-none">
                    <FinanceTranscriptsTab
                        analytics={f.analytics}
                        transactions={f.transactions}
                        configuredTranscriptFee={f.configuredTranscriptFee}
                        isSchoolPaidPlan={f.isSchoolPaidPlan}
                        schoolPlanName={f.schoolPlanName}
                        onOpenFeeModal={f.handleOpenFeeModal}
                        onOpenAddBankModal={() => f.setIsAddBankModalOpen(true)}
                        onExportCSV={f.handleExportCSV}
                        onOpenReceipt={f.openReceipt}
                    />
                </TabsContent>
            </Tabs>

            <RecordManualPaymentModal
                open={f.isManualModalOpen}
                onOpenChange={f.setIsManualModalOpen}
                studentSearchTerm={f.studentSearchTerm}
                setStudentSearchTerm={f.setStudentSearchTerm}
                manualStudentId={f.manualStudentId}
                setManualStudentId={f.setManualStudentId}
                filteredStudents={f.filteredStudents}
                manualAmount={f.manualAmount}
                setManualAmount={f.setManualAmount}
                manualType={f.manualType}
                setManualType={f.setManualType}
                manualMethod={f.manualMethod}
                setManualMethod={f.setManualMethod}
                manualTerm={f.manualTerm}
                setManualTerm={f.setManualTerm}
                manualSession={f.manualSession}
                setManualSession={f.setManualSession}
                manualNotes={f.manualNotes}
                setManualNotes={f.setManualNotes}
                manualSubmitting={f.manualSubmitting}
                onSubmit={f.handleRecordPayment}
            />

            <TransactionReceiptModal
                open={f.isReceiptModalOpen}
                onOpenChange={f.setIsReceiptModalOpen}
                receipt={f.selectedReceipt}
            />

            <TranscriptFeeConfigModal
                open={f.isEditFeeModalOpen}
                onOpenChange={f.setIsEditFeeModalOpen}
                editingFee={f.editingFee}
                setEditingFee={f.setEditingFee}
                isSavingFee={f.isSavingFee}
                isSchoolPaidPlan={f.isSchoolPaidPlan}
                schoolPlanName={f.schoolPlanName}
                onSave={f.handleSaveTranscriptFee}
            />

            <ConnectBankAccountModal
                open={f.isAddBankModalOpen}
                onOpenChange={f.setIsAddBankModalOpen}
                schoolId={f.schoolId}
                schoolDisplayName={f.schoolDisplayName}
                schoolEmail={f.schoolEmail}
                currentUserName={f.user?.name || undefined}
                currentUserEmail={f.user?.email || undefined}
                currentUserRole={f.user?.role || undefined}
                onSuccess={async () => {
                    await Promise.all([f.loadAnalytics(), f.loadBankAudits()])
                }}
            />
        </div>
    )
}

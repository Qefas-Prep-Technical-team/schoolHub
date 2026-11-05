"use client"

import React from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Receipt, Loader2, CheckCircle2, Printer, CreditCard, ShieldCheck } from "lucide-react"
import { FinanceTransaction } from "@/lib/api/services/financeService"
import { AdminFinanceStudentOption } from "../hooks/useAdminFinance"

interface RecordManualPaymentModalProps {
    open: boolean; onOpenChange: (open: boolean) => void
    studentSearchTerm: string; setStudentSearchTerm: (v: string) => void
    manualStudentId: string; setManualStudentId: (v: string) => void
    filteredStudents: AdminFinanceStudentOption[]
    manualAmount: string; setManualAmount: (v: string) => void
    manualType: string; setManualType: (v: string) => void
    manualMethod: string; setManualMethod: (v: string) => void
    manualTerm: string; setManualTerm: (v: string) => void
    manualSession: string; setManualSession: (v: string) => void
    manualNotes: string; setManualNotes: (v: string) => void
    manualSubmitting: boolean; onSubmit: (e: React.FormEvent) => void
}

export function RecordManualPaymentModal({
    open, onOpenChange, studentSearchTerm, setStudentSearchTerm, manualStudentId, setManualStudentId,
    filteredStudents, manualAmount, setManualAmount, manualType, setManualType, manualMethod, setManualMethod,
    manualTerm, setManualTerm, manualSession, setManualSession, manualNotes, setManualNotes, manualSubmitting, onSubmit,
}: RecordManualPaymentModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl p-0 overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border-none shadow-2xl">
                <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white relative">
                    <DialogTitle className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                        <Receipt className="size-6 text-blue-400" /> Record Fee Payment
                    </DialogTitle>
                    <DialogDescription className="text-slate-300 text-xs mt-1">
                        Record cash, bank transfer, POS, or offline transcript clearance payments.
                    </DialogDescription>
                </div>

                <form onSubmit={onSubmit} className="p-6 sm:p-8 space-y-5">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Student <span className="text-red-500">*</span></Label>
                        <Input placeholder="Search student name or admission ID..." value={studentSearchTerm} onChange={(e) => setStudentSearchTerm(e.target.value)} className="h-10 text-xs rounded-xl border-slate-200 dark:border-slate-800" />
                        <Select value={manualStudentId} onValueChange={setManualStudentId}>
                            <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold">
                                <SelectValue placeholder="Select student from directory" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((st) => {
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Amount (₦) <span className="text-red-500">*</span></Label>
                            <Input type="number" min="1" placeholder="e.g. 75000" value={manualAmount} onChange={(e) => setManualAmount(e.target.value)} className="h-11 text-sm font-black rounded-xl border-slate-200 dark:border-slate-800" required />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Fee Type <span className="text-red-500">*</span></Label>
                            <Select value={manualType} onValueChange={setManualType}>
                                <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold"><SelectValue placeholder="Select Fee Type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TUITION">Tuition / Term Fee</SelectItem>
                                    <SelectItem value="TRANSCRIPT">Official Transcript Clearance</SelectItem>
                                    <SelectItem value="EXAM_FEE">Examination Fee</SelectItem>
                                    <SelectItem value="UNIFORM">School Uniform</SelectItem>
                                    <SelectItem value="BUS_TRANSPORT">Transportation / Bus</SelectItem>
                                    <SelectItem value="PTA_LEVY">PTA Levy</SelectItem>
                                    <SelectItem value="OTHER">Other / Miscellaneous</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Payment Method</Label>
                            <Select value={manualMethod} onValueChange={setManualMethod}>
                                <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold"><SelectValue placeholder="Method" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CASH">Cash Deposit</SelectItem>
                                    <SelectItem value="BANK_TRANSFER">Direct Bank Transfer</SelectItem>
                                    <SelectItem value="POS">POS Terminal</SelectItem>
                                    <SelectItem value="CHEQUE">Bank Cheque</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Academic Term</Label>
                            <Select value={manualTerm} onValueChange={setManualTerm}>
                                <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold"><SelectValue placeholder="Term" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="First Term">First Term</SelectItem>
                                    <SelectItem value="Second Term">Second Term</SelectItem>
                                    <SelectItem value="Third Term">Third Term</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Academic Session</Label>
                            <Input placeholder="2025/2026" value={manualSession} onChange={(e) => setManualSession(e.target.value)} className="h-11 text-xs font-bold rounded-xl border-slate-200 dark:border-slate-800" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Payment Notes / Reference (Optional)</Label>
                        <Textarea placeholder="e.g. Paid in cash at bursary counter, bank teller ref #847291..." value={manualNotes} onChange={(e) => setManualNotes(e.target.value)} className="min-h-[80px] rounded-xl border-slate-200 dark:border-slate-800 text-xs" />
                    </div>

                    <DialogFooter className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-11 px-5 rounded-xl font-bold text-xs">Cancel</Button>
                        <Button type="submit" disabled={manualSubmitting || !manualStudentId || !manualAmount} className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white h-11 px-6 rounded-xl font-bold text-xs gap-2 shadow-lg shadow-blue-600/25 dark:shadow-blue-900/30 cursor-pointer">
                            {manualSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving Payment...</> : <><CheckCircle2 size={16} /> Save Payment Record</>}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function TransactionReceiptModal({
    open, onOpenChange, receipt,
}: { open: boolean; onOpenChange: (open: boolean) => void; receipt: FinanceTransaction | null }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border-none shadow-2xl">
                {receipt && (
                    <div className="p-8 space-y-6">
                        <div className="text-center space-y-2 border-b border-dashed border-slate-200 dark:border-slate-800 pb-6">
                            <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto"><Receipt size={24} /></div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">School Fee Payment Receipt</h3>
                            <p className="text-[11px] font-mono text-slate-400">REF: {receipt.paymentReference || receipt.reference || receipt.id}</p>
                        </div>
                        <div className="text-center py-2 space-y-1 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount Paid</span>
                            <p className="text-3xl font-black text-slate-900 dark:text-white">₦{receipt.amount.toLocaleString()}</p>
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full"><CheckCircle2 size={12} /> {receipt.status}</span>
                        </div>
                        <div className="space-y-3 text-xs">
                            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-400 font-medium">Student / Payer</span>
                                <span className="font-bold text-slate-900 dark:text-white">{receipt.student?.name || receipt.parent?.fullName || "General Student"}</span>
                            </div>
                            {receipt.student?.studentCode && (
                                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                                    <span className="text-slate-400 font-medium">Student Code</span>
                                    <span className="font-mono font-bold text-slate-900 dark:text-white">{receipt.student.studentCode}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-400 font-medium">Fee Type</span>
                                <span className="font-bold text-slate-900 dark:text-white">{receipt.paymentType || "School Fee"}</span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-400 font-medium">Payment Channel</span>
                                <span className="font-bold text-slate-900 dark:text-white">{receipt.channel || "Online Gateway"}</span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-400 font-medium">Payment Date & Time</span>
                                <span className="font-bold text-slate-900 dark:text-white">{format(new Date(receipt.createdAt), "PPpp")}</span>
                            </div>
                            {receipt.term && (
                                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                                    <span className="text-slate-400 font-medium">Academic Term & Session</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{receipt.term} {receipt.session ? `(${receipt.session})` : ""}</span>
                                </div>
                            )}
                        </div>
                        <div className="pt-2 flex items-center justify-between gap-3">
                            <Button variant="outline" onClick={() => window.print()} className="flex-1 h-11 rounded-xl font-bold text-xs gap-1.5"><Printer size={16} /> Print Receipt</Button>
                            <Button onClick={() => onOpenChange(false)} className="flex-1 h-11 rounded-xl font-bold text-xs bg-slate-900 text-white dark:bg-slate-800 dark:text-white hover:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer">Close</Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export function TranscriptFeeConfigModal({
    open, onOpenChange, editingFee, setEditingFee, isSavingFee, isSchoolPaidPlan, schoolPlanName, onSave,
}: {
    open: boolean; onOpenChange: (open: boolean) => void; editingFee: string; setEditingFee: (v: string) => void
    isSavingFee: boolean; isSchoolPaidPlan: boolean; schoolPlanName: string; onSave: () => void
}) {
    const presets = [0, 2500, 5000, 10000]
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-3xl p-6">
                <DialogHeader className="space-y-2">
                    <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1"><CreditCard size={24} /></div>
                    <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Set Transcript Clearance Fee</DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 leading-relaxed">
                        Configure the clearance fee for graduated alumni and students downloading official transcripts ({schoolPlanName}).
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-3">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Quick Fee Presets</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {presets.map((amt) => (
                                <button key={amt} type="button" onClick={() => setEditingFee(String(amt))} className={`py-2 px-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${Number(editingFee) === amt ? "bg-purple-600 text-white border-purple-600 shadow-sm" : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"}`}>
                                    {amt === 0 ? "₦0 (Free)" : `₦${amt.toLocaleString()}`}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Transcript Fee Amount (₦)</Label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">₦</span>
                            <Input type="number" min="0" step="500" placeholder="5000" value={editingFee} onChange={(e) => setEditingFee(e.target.value)} className="pl-8 h-12 rounded-2xl text-base font-bold text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 focus:ring-purple-500" />
                        </div>
                        <p className="text-[11px] text-slate-400">
                            {isSchoolPaidPlan ? "Setting ₦0 grants active students complimentary access on your Paid Plan (Graduated alumni still pay ₦5,000 minimum)." : "Your school is on the Free Tier. Students unlock transcripts per term at this fee."}
                        </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-purple-900 dark:text-purple-200 space-y-1">
                        <p className="font-bold flex items-center gap-1.5"><ShieldCheck size={14} className="text-purple-600" /> Automatic Bank Deposits</p>
                        <p className="text-[11px] text-purple-700 dark:text-purple-300">
                            Fees paid by students and alumni are automatically transferred to your school&apos;s registered bank account via Flutterwave split payments.
                        </p>
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl h-11 text-xs font-bold" disabled={isSavingFee}>Cancel</Button>
                    <Button onClick={onSave} className="rounded-xl h-11 px-5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20" disabled={isSavingFee}>
                        {isSavingFee ? <><Loader2 size={14} className="animate-spin mr-1.5" /> Saving...</> : "Save Fee"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

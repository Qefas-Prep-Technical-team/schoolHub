"use client"

import React, { useState } from "react"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { financeService } from "@/lib/api/services/financeService"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { WalletCards, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "react-toastify"
import { BankStatusBanner } from "../../admin/components/BankStatusBanner"

export default function ParentPaymentPage() {
    const { user } = useAuthStore()
    const children = user?.children?.filter(c => c.linkStatus === "linked" || c.linkStatus === "ACCEPTED") || []
    
    const [selectedChildId, setSelectedChildId] = useState<string>("")
    const [amount, setAmount] = useState<string>("")
    const [paymentType, setPaymentType] = useState<string>("Tution Fee")
    const [term, setTerm] = useState<string>("First Term")
    const [session, setSession] = useState<string>("2024/2025")
    const [loading, setLoading] = useState(false)
    const [schoolStatus, setSchoolStatus] = useState<any>(null)

    React.useEffect(() => {
        if (selectedChildId) {
            const child = children.find(c => c.studentId === selectedChildId)
            const schoolId = (child as any)?.schoolId || (user as any)?.schoolId
            if (schoolId) {
                financeService.getSchoolAnalytics(schoolId)
                    .then(res => setSchoolStatus(res.paymentStatus))
                    .catch(console.error)
            }
        }
    }, [selectedChildId])

    const handleInitializePayment = async () => {
        if (!selectedChildId || !amount || parseFloat(amount) <= 0) {
            toast.error("Please select a child and enter a valid amount")
            return
        }

        const child = children.find(c => c.studentId === selectedChildId)
        if (!child) return

        // In a real scenario, we need the child's schoolId. 
        // If it's not in the auth store, we might need to fetch it or assume it's linked to the student object.
        // For this implementation, we'll try to find if the schoolId is available on the child object.
        // If not, we'll need to fetch student details.
        
        try {
            setLoading(true)
            
            // Note: In refined production code, schoolId should be part of the child object in auth store.
            // For now, we'll assume it might be there as an extra field if we updated the backend.
            const schoolId = (child as any).schoolId || (user as any).schoolId; // Fallback or improved logic

            const data = await financeService.initializePayment({
                schoolId: schoolId,
                studentId: selectedChildId,
                amount: parseFloat(amount),
                term,
                session,
                paymentType
            })

            if (data.authorization_url) {
                window.location.href = data.authorization_url
            } else {
                toast.error("Failed to get payment URL")
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to initialize payment")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">School Fee Payment</h1>
                <p className="text-muted-foreground">Make secure payments directly to your child's school account.</p>
            </div>

            {schoolStatus && <BankStatusBanner status={schoolStatus.status} />}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <WalletCards className="h-5 w-5 text-blue-500" />
                        Initialize Payment
                    </CardTitle>
                    <CardDescription>Select a child and enter the payment details below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="child">Select Child</Label>
                            <Select onValueChange={setSelectedChildId} value={selectedChildId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a child" />
                                </SelectTrigger>
                                <SelectContent>
                                    {children.map((child) => (
                                        <SelectItem key={child.studentId} value={child.studentId}>
                                            {child.studentName} ({child.studentCode})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (NGN)</Label>
                            <Input 
                                id="amount" 
                                type="number" 
                                placeholder="0.00" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paymentType">Payment Category</Label>
                            <Select onValueChange={setPaymentType} value={paymentType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Tution Fee">Tution Fee</SelectItem>
                                    <SelectItem value="Uniform">Uniform</SelectItem>
                                    <SelectItem value="Books">Books</SelectItem>
                                    <SelectItem value="Bus Fee">Bus Fee</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="term">Term</Label>
                                <Select onValueChange={setTerm} value={term}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="First Term">1st Term</SelectItem>
                                        <SelectItem value="Second Term">2nd Term</SelectItem>
                                        <SelectItem value="Third Term">3rd Term</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="session">Session</Label>
                                <Select onValueChange={setSession} value={session}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2023/2024">2023/2024</SelectItem>
                                        <SelectItem value="2024/2025">2024/2025</SelectItem>
                                        <SelectItem value="2025/2026">2025/2026</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-slate-50 dark:bg-slate-900/50 rounded-b-lg border-t p-6">
                    <Button 
                        className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700" 
                        onClick={handleInitializePayment}
                        disabled={loading || children.length === 0}
                    >
                        {loading ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Initializing...</>
                        ) : (
                            "Proceed to Payment"
                        )}
                    </Button>
                </CardFooter>
            </Card>

            {children.length === 0 && (
                <div className="text-center p-8 border-2 border-dashed rounded-xl">
                    <p className="text-muted-foreground">You have no linked children. Please link a child to make payments.</p>
                </div>
            )}
        </div>
    )
}

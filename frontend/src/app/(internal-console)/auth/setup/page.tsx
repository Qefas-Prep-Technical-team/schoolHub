"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ShieldCheck, Mail, Lock, ShieldAlert, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { apiClient as api } from "@/lib/api/client"

export default function StaffSetupPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    
    const [isLoading, setIsLoading] = useState(true)
    const [isVerifying, setIsVerifying] = useState(true)
    const [staffData, setStaffData] = useState<{ email: string, fullName: string } | null>(null)
    const [error, setError] = useState<string | null>(null)
    
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    })

    // Verify token on mount
    useEffect(() => {
        if (!token) {
            setError("Invitation token is missing. Please check the link in your email.")
            setIsVerifying(false)
            return
        }

        api.get(`/api/platform/staff/invite/verify?token=${token}`)
            .then(res => {
                setStaffData(res.data.data)
                setIsVerifying(false)
            })
            .catch(err => {
                setError(err.response?.data?.message || "Invalid or expired invitation link.")
                setIsVerifying(false)
            })
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }
        
        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters long")
            return
        }

        setIsLoading(true)
        try {
            await api.post('/api/platform/staff/invite/complete', {
                token,
                password: formData.password
            })
            toast.success("Account setup securely! You can now log in.")
            router.push("/auth/login") // redirect to internal console login
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to set up account")
            setIsLoading(false)
        }
    }

    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <Loader2 size={32} className="animate-spin text-indigo-500" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Verifying Secure Link...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
                <Card className="max-w-md w-full bg-white dark:bg-slate-900 border-red-500/20 rounded-[2rem] p-8 text-center shadow-xl">
                    <ShieldAlert size={48} className="text-red-500 mx-auto mb-6" />
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Access Denied</h2>
                    <p className="text-sm font-medium text-slate-500 mb-8">{error}</p>
                    <Button onClick={() => router.push("/auth/login")} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl h-12 font-bold hover:scale-[1.02] transition-transform">
                        Return to Login
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <Card className="max-w-md w-full bg-white dark:bg-slate-900 border-none rounded-[2.5rem] shadow-2xl overflow-hidden relative">
                <div className="h-32 bg-indigo-600 w-full absolute top-0 left-0" />
                <CardHeader className="relative pt-12 pb-8 px-10 text-center">
                    <div className="h-20 w-20 bg-white dark:bg-slate-900 rounded-3xl mx-auto shadow-xl flex items-center justify-center mb-6 border-[8px] border-white dark:border-slate-900 -mt-20">
                        <ShieldCheck size={32} className="text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Initialize Account</h1>
                    <p className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center justify-center gap-2">
                        <Mail size={14} className="text-indigo-400" />
                        {staffData?.email}
                    </p>
                </CardHeader>

                <CardContent className="px-10 pb-10">
                    <div className="mb-8 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                        <p className="text-[10px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-widest text-center leading-relaxed">
                            Welcome {staffData?.fullName?.split(' ')[0]}! Set up your secure password to access the Qefas Admin Infrastructure.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                                <Lock size={12} className="text-slate-400" />
                                Secure Password
                            </Label>
                            <Input 
                                type="password" 
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="h-12 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl"
                                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                Confirm Password
                            </Label>
                            <Input 
                                type="password" 
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="h-12 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl"
                                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                            />
                        </div>

                        <Button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] mt-4 shadow-xl shadow-indigo-600/20"
                        >
                            {isLoading ? "Provisioning..." : "Activate Account"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

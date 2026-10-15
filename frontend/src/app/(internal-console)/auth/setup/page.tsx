"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ShieldCheck, Mail, Lock, ShieldAlert, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { apiClient as api } from "@/lib/api/client"

function StaffSetupForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const errorParam = searchParams.get("error")
    
    const [isLoading, setIsLoading] = useState(false)
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

        api.get(`/platform/staff/invite/verify?token=${token}`)
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
            await api.post('/platform/staff/invite/complete', {
                token,
                password: formData.password
            })
            toast.success("Account setup securely! You can now log in.")
            setIsLoading(false)
            window.location.href = "/auth/login" // force hard redirect to avoid router push hanging
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

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500 font-bold tracking-widest text-[10px]">
                                Or activate with Single Sign-On
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            title="Register & Activate with Google"
                            onClick={() => {
                                window.location.href = `/api/auth/google?role=staff&inviteToken=${encodeURIComponent(token || "")}`;
                            }}
                            className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-semibold text-xs text-slate-700 dark:text-slate-200 shadow-sm hover:scale-[1.02]"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>Google</span>
                        </button>

                        <button
                            type="button"
                            title="Register & Activate with Facebook"
                            onClick={() => {
                                window.location.href = `/api/auth/facebook?role=staff&inviteToken=${encodeURIComponent(token || "")}`;
                            }}
                            className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-semibold text-xs text-slate-700 dark:text-slate-200 shadow-sm hover:scale-[1.02]"
                        >
                            <svg className="w-4 h-4 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            <span>Facebook</span>
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function StaffSetupPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
                    <Loader2 size={32} className="animate-spin text-indigo-500" />
                </div>
            }
        >
            <StaffSetupForm />
        </Suspense>
    )
}

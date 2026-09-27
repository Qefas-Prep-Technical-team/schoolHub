"use client"

import { useState } from "react"
import { usePlatformLoginMutation } from "./usePlatformAuthMutations"
import { ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image" // We don't have an image, we'll use icon

export default function PlatformLoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const loginMutation = usePlatformLoginMutation()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        loginMutation.mutate({ email, password })
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 lg:p-8 font-sans transition-colors duration-300">
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl dark:shadow-none border border-transparent dark:border-slate-800 overflow-hidden flex flex-col md:flex-row min-h-[700px] transition-colors duration-300"
            >
                {/* ─── LEFT SIDE (Blue Gradient) ─── */}
                <div className="w-full md:w-5/12 lg:w-1/2 p-10 lg:p-14 flex flex-col justify-between bg-gradient-to-br from-[#3b82f6] via-[#2563eb] to-[#1e3a8a] relative overflow-hidden">
                    {/* Background glow effects */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute -top-[20%] -left-[20%] w-[70%] h-[70%] bg-cyan-400/30 blur-[100px] rounded-full"></div>
                        <div className="absolute -bottom-[20%] -right-[20%] w-[70%] h-[70%] bg-blue-400/20 blur-[100px] rounded-full"></div>
                    </div>

                    <div className="relative z-10">
                        {/* Logo / Header */}
                        <div className="flex items-center gap-2 text-white mb-16">
                            <ShieldCheck className="w-6 h-6" />
                            <span className="font-bold text-lg tracking-wide">QefasHub</span>
                        </div>

                        {/* Main Text */}
                        <div className="mb-12">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 text-white text-sm font-medium mb-6 shadow-sm">
                                Platform Staff Portal 🔒
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                                Establish Secure Link
                            </h1>
                            <p className="text-blue-100 text-base max-w-sm">
                                Authenticate to access the internal platform console and manage school operations.
                            </p>
                        </div>
                    </div>

                    {/* Steps / Cards */}
                    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-auto">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-6 transform transition-transform hover:-translate-y-1">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-blue-600/30">
                                1
                            </div>
                            <p className="text-slate-900 dark:text-white font-bold text-sm leading-snug">
                                Verify your<br />credentials
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 flex flex-col gap-6">
                            <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-bold">
                                2
                            </div>
                            <p className="text-white font-semibold text-sm leading-snug">
                                Establish secure<br />connection
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 flex flex-col gap-6">
                            <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-bold">
                                3
                            </div>
                            <p className="text-white font-semibold text-sm leading-snug">
                                Access Ops<br />Dashboard
                            </p>
                        </div>
                    </div>
                </div>

                {/* ─── RIGHT SIDE (Form) ─── */}
                <div className="w-full md:w-7/12 lg:w-1/2 p-10 lg:p-16 xl:p-24 flex flex-col justify-center bg-white dark:bg-slate-900 relative transition-colors duration-300">
                    <div className="max-w-md w-full mx-auto">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white text-center mb-10 transition-colors">
                            Operations Login
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 ml-1 transition-colors">Terminal ID (Email)</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="agent@qefashub.com"
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl py-4 px-5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium shadow-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 ml-1 transition-colors">Access Key</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl py-4 pl-5 pr-12 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium ml-1 mt-2 leading-relaxed transition-colors">
                                    At least 12 characters, no more than 20 characters.<br/>
                                    Uppercase letters, lowercase letters, numbers, and symbols.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loginMutation.isPending}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
                            >
                                {loginMutation.isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Continue"
                                )}
                            </button>
                        </form>

                        <div className="mt-8 flex items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors">
                            <span>Need access? <a href="#" className="text-blue-600 dark:text-blue-500 font-bold hover:underline">Contact Admin</a></span>
                        </div>

                        <div className="mt-8 relative flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100 dark:border-slate-800 transition-colors"></div>
                            </div>
                            <div className="relative bg-white dark:bg-slate-900 px-4 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors">
                                Or
                            </div>
                        </div>

                        <button
                            type="button"
                            className="mt-8 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign in with SSO
                        </button>

                        <p className="mt-10 text-center text-xs text-slate-400 dark:text-slate-500 leading-relaxed px-4 transition-colors">
                            By continuing, you confirm that you carefully have read and agree to the Qefas 
                            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ml-1">Privacy Policy</a> and 
                            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ml-1">Terms of Service</a>.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

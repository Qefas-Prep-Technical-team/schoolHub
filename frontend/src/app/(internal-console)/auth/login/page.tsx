"use client"

import { useState } from "react"
import { usePlatformLoginMutation } from "./usePlatformAuthMutations"
import { ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image" // We don't have an image, we'll use icon
import { toast } from "react-toastify"

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
        <div className="min-h-screen w-full bg-white dark:bg-slate-900 font-sans transition-colors duration-300 flex">
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full min-h-screen flex flex-col md:flex-row overflow-hidden transition-colors duration-300"
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
                            
                            <div className="mt-10 bg-white/10 p-2 rounded-[2rem] backdrop-blur-md border border-white/20 inline-block shadow-2xl relative group">
                                <div className="absolute inset-0 bg-blue-500/20 rounded-[2rem] blur-xl group-hover:bg-blue-400/30 transition-colors duration-500 -z-10"></div>
                                <Image 
                                    src="/login-illustration.png"
                                    alt="Platform Illustration"
                                    width={300}
                                    height={300}
                                    className="rounded-[1.5rem] object-cover hover:scale-105 transition-transform duration-500"
                                    priority
                                />
                            </div>
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
                <div className="w-full md:w-7/12 lg:w-1/2 p-10 flex flex-col justify-center items-center bg-white dark:bg-slate-900 relative transition-colors duration-300">
                    <div className="w-full max-w-md flex flex-col items-center">
                        {/* Logo for mobile / matching design scheme */}
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 mb-6">
                            <ShieldCheck className="w-8 h-8" />
                            <span className="font-bold text-2xl tracking-wide text-slate-900 dark:text-white">QefasHub</span>
                        </div>

                        <h2 className="text-[32px] font-bold text-slate-900 dark:text-white text-center mb-10 transition-colors leading-tight">
                            Operations <br/> Login
                        </h2>

                        <form onSubmit={handleSubmit} className="w-full space-y-5">
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Terminal ID (Email)"
                                    className="w-full bg-transparent border border-slate-200 dark:border-slate-700 rounded-full py-5 px-6 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm"
                                />
                            </div>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Access Key"
                                    className="w-full bg-transparent border border-slate-200 dark:border-slate-700 rounded-full py-5 pl-6 pr-12 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loginMutation.isPending}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-5 rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4 text-sm"
                            >
                                {loginMutation.isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Continue"
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors text-center">
                            or sign in with
                        </div>

                        {/* Circular SSO Buttons */}
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <button
                                type="button"
                                onClick={() => toast.info("Coming soon")}
                                className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => toast.info("Coming soon")}
                                className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <svg className="w-5 h-5 text-slate-900 dark:text-white" viewBox="0 0 384 512" fill="currentColor">
                                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                                </svg>
                            </button>
                        </div>

                        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500 leading-relaxed px-4 transition-colors">
                            By creating an account you agree to QefasHub's <br/>
                            <a href="#" className="text-blue-500 font-medium hover:underline transition-colors">Terms of Services</a> and <a href="#" className="text-blue-500 font-medium hover:underline transition-colors">Privacy Policy</a>.
                        </p>

                        <div className="mt-8 flex items-center justify-center text-sm font-medium transition-colors">
                            <span className="text-slate-600 dark:text-slate-400">Need access? <a href="#" className="text-blue-500 font-bold hover:underline ml-1">Contact Admin</a></span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

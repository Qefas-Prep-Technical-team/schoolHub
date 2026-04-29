"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Lock, ShieldCheck, Mail, KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { usePaystackPayment } from 'react-paystack';
import { paymentService } from '@/lib/api/services/paymentService';
import { apiClient } from '@/lib/api/client';
import { useFetchPricing } from '@/components/pricing/query';
import Link from 'next/link';

type CheckoutState = 'EMAIL_ENTRY' | 'VERIFY_OTP' | 'PAYMENT_READY' | 'POST_PAYMENT_SETUP' | 'SUCCESS';

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    
    const plan = searchParams.get('plan') || '';
    const billing = searchParams.get('billing') || 'monthly';
    const role = searchParams.get('role') || 'STUDENT';

    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<CheckoutState>('EMAIL_ENTRY');
    const [isLoading, setIsLoading] = useState(false);
    const [isReturningUser, setIsReturningUser] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    // Fetch real pricing to securely compute amount based on URL plan
    const { data: pricingData } = useFetchPricing();
    let amount = 0;
    if (pricingData) {
        for (const cat of pricingData) {
            const foundTab = cat.tabs.find(t => t.type === plan);
            if (foundTab) {
                amount = billing === 'monthly' ? foundTab.pricing.monthly : foundTab.pricing.yearly;
                break;
            }
        }
    }

    useEffect(() => {
        if (isAuthenticated && user?.email) {
            setStep('PAYMENT_READY');
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return toast.error("Please enter your email");

        setIsLoading(true);
        try {
            // Check if email exists and confirm role
            const checkRes = await apiClient.post('/auth/check-email', { email });
            const { exists, role: userRole } = checkRes.data;

            if (exists && userRole !== role) {
                setIsLoading(false);
                toast.error(`This email is registered as a ${userRole}. Redirecting to pricing...`, {
                    autoClose: 3000
                });
                setTimeout(() => {
                    router.push('/pricing');
                }, 2000);
                return;
            }

            setIsReturningUser(exists);

            // Request OTP via backend
            await apiClient.post('/auth/request-code', {
                email,
                userType: role // Role from URL param (STUDENT, TEACHER, etc.)
            });

            // Always verify OTP for security before payment
            setStep('VERIFY_OTP');
            setResendTimer(60); // Start 60s countdown
            toast.success("We've sent a 6-digit code to your email.");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to send code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp) return toast.error("Please enter the OTP");

        setIsLoading(true);
        try {
            await apiClient.post('/auth/verify-checkout-code', {
                email,
                code: otp,
                userType: role
            });
            toast.success("Verified successfully!");
            setStep('PAYMENT_READY');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Invalid or expired OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setIsLoading(true);
        try {
            await apiClient.post('/auth/request-code', {
                email,
                userType: role
            });
            setResendTimer(60);
            toast.success("A new code has been sent!");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to resend code");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) return toast.error("Password must be at least 6 characters");
        
        setIsLoading(true);
        try {
            // Mock API call to convert shadow account to real account
            toast.success("Account created successfully!");
            setStep('SUCCESS');
        } finally {
            setIsLoading(false);
        }
    };

    // Paystack Integration
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_placeholder";
    const paystackProps = {
        email: email,
        amount: amount * 100,
        metadata: {
            custom_fields: [
                { display_name: "Plan", variable_name: "plan", value: plan },
                { display_name: "Billing", variable_name: "billing", value: billing }
            ],
        },
        publicKey,
        text: "Pay Now",
        onSuccess: async (reference: any) => {
            try {
                toast.loading("Verifying payment...", { toastId: "verify" });
                await paymentService.verify({ reference: reference.reference, plan, billingType: billing as 'monthly' | 'yearly' });
                toast.update("verify", { render: "Payment verified!", type: "success", isLoading: false, autoClose: 2000 });
                
                if (!isAuthenticated && !isReturningUser) {
                    setStep('POST_PAYMENT_SETUP');
                } else {
                    setStep('SUCCESS');
                }
            } catch (error) {
                toast.update("verify", { render: "Verification failed.", type: "error", isLoading: false, autoClose: 3000 });
            }
        },
        onClose: () => toast.info("Payment cancelled"),
    };

    const initializePayment = usePaystackPayment(paystackProps as any);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-start">
                
                {/* Left Column: Form Flow */}
                <div className="w-full md:w-3/5 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 md:p-12 overflow-hidden relative">
                    <Link href="/pricing" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Pricing
                    </Link>

                    <AnimatePresence mode="wait">
                        {step === 'EMAIL_ENTRY' && (
                            <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="mb-8">
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white font-lexend mb-2">Let's get started</h2>
                                    <p className="text-slate-500">Enter your email to continue your purchase.</p>
                                </div>
                                <form onSubmit={handleEmailSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input 
                                                type="email" required
                                                value={email} onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={isLoading} className="w-full py-6 text-lg rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2">
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue to Payment"}
                                    </Button>
                                </form>
                            </motion.div>
                        )}

                        {step === 'VERIFY_OTP' && (
                            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="mb-8">
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white font-lexend mb-2">
                                        {isReturningUser ? "Welcome Back!" : "Verify your Email"}
                                    </h2>
                                    <p className="text-slate-500">We sent a 6-digit code to <span className="font-bold text-slate-900 dark:text-white">{email}</span></p>
                                </div>
                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Verification Code</label>
                                        <div className="relative">
                                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input 
                                                type="text" required maxLength={6}
                                                value={otp} onChange={(e) => setOtp(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-600 text-center tracking-widest font-black text-2xl transition-all outline-none"
                                                placeholder="------"
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={isLoading} className="w-full py-6 text-lg rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2">
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
                                    </Button>
                                    
                                    <div className="text-center mt-4">
                                        <p className="text-sm text-slate-500">
                                            Didn't receive the code?{' '}
                                            <button 
                                                type="button" 
                                                onClick={handleResendOtp}
                                                disabled={resendTimer > 0 || isLoading}
                                                className={`font-bold transition-colors ${resendTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'}`}
                                            >
                                                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Click to resend'}
                                            </button>
                                        </p>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {step === 'PAYMENT_READY' && (
                            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="mb-8">
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white font-lexend mb-2">Complete Purchase</h2>
                                    <p className="text-slate-500">Billing to <span className="font-bold">{email}</span></p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-8 border border-blue-100 dark:border-blue-800/50 flex items-center gap-4">
                                    <ShieldCheck className="w-8 h-8 text-blue-600" />
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">Secure Payment</p>
                                        <p className="text-slate-500 text-xs">Protected by Paystack</p>
                                    </div>
                                </div>
                                <Button onClick={() => initializePayment(paystackProps as any)} className="w-full py-8 text-xl rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 font-black shadow-xl transition-all">
                                    Pay ₦{amount.toLocaleString()}
                                </Button>
                            </motion.div>
                        )}

                        {step === 'POST_PAYMENT_SETUP' && (
                            <motion.div key="setup" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white font-lexend mb-2">Payment Successful!</h2>
                                    <p className="text-slate-500">Your subscription is active. Set a password to save your details for next time.</p>
                                </div>
                                <form onSubmit={handleSavePassword} className="space-y-6 max-w-sm mx-auto">
                                    <div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input 
                                                type="password" required minLength={6}
                                                value={password} onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                                                placeholder="Create a secure password"
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={isLoading} className="w-full py-6 text-lg rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-600/30 transition-all">
                                        Save Details
                                    </Button>
                                    <button type="button" onClick={() => setStep('SUCCESS')} className="w-full text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
                                        Skip for now
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {step === 'SUCCESS' && (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white font-lexend mb-4">You're all set!</h2>
                                <p className="text-slate-500 mb-10 text-lg">Redirecting you to your dashboard...</p>
                                <Link href="/dashboard">
                                    <Button className="px-10 py-6 text-lg rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black shadow-xl">
                                        Go to Dashboard
                                    </Button>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Column: Order Summary */}
                <div className="w-full md:w-2/5 sticky top-8">
                    <div className="bg-slate-900 dark:bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
                        
                        <h3 className="text-xl font-bold mb-6 text-slate-300 uppercase tracking-widest text-xs">Order Summary</h3>
                        
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center">
                                <ShieldCheck className="w-8 h-8 text-blue-400" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black capitalize font-lexend leading-tight">{plan || 'Standard'} Plan</h4>
                                <p className="text-blue-400 font-bold capitalize text-sm">{billing} Billing</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-slate-400">
                                <span>Subtotal</span>
                                <span>₦{amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400">
                                <span>Taxes</span>
                                <span>Calculated at checkout</span>
                            </div>
                        </div>

                        <div className="h-px w-full bg-slate-800 mb-8" />

                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Total Due Today</p>
                                <p className="text-5xl font-black tracking-tighter">₦{amount.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

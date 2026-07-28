"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, ShieldCheck, Mail, KeyRound, Loader2, Zap, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { usePaystackPayment } from 'react-paystack';
import { paymentService } from '@/lib/api/services/paymentService';
import { apiClient } from '@/lib/api/client';
import { useFetchPricing } from '@/components/pricing/query';
import { useCheckoutStore } from '@/utils/CheckoutStore';
import { useQueryClient } from '@tanstack/react-query';
import { schoolQueryKeys } from '@/lib/api/hooks/useSchool';
import Link from 'next/link';

type CheckoutState = 'EMAIL_ENTRY' | 'VERIFY_OTP' | 'PASSWORD_SETUP' | 'PAYMENT_READY' | 'VERIFYING_PAYMENT' | 'POST_PAYMENT_SETUP' | 'SUCCESS';

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isAuthenticated, updateUser, hasCompletedOnboarding } = useAuthStore();
    const { plan, billing, role, discountedAmount, isUpgrade, redirectBackUrl, clearCheckout } = useCheckoutStore();
    const queryClient = useQueryClient();

    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<CheckoutState>('EMAIL_ENTRY');
    const [isLoading, setIsLoading] = useState(false);
    const [isReturningUser, setIsReturningUser] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    // Fetch real pricing to securely compute amount based on URL plan
    const { data: pricingData } = useFetchPricing();
    let amount = 0;
    let selectedPlanFeatures: string[] = [];
    let hasPlanTrial = false;
    let trialDaysCount = 0;
    let selectedPlanName = '';

    if (pricingData) {
        // Map role to category for lookup
        const roleToCategory: Record<string, string> = {
            'ADMIN': 'schools',
            'TEACHER': 'teachers',
            'PARENT': 'parents',
            'STUDENT': 'students'
        };
        const targetCategory = roleToCategory[role] || 'students';

        let selectedPlanTab = null;

        for (const cat of pricingData) {
            // First try matching category AND type
            if (cat.category.toLowerCase() === targetCategory.toLowerCase()) {
                const foundTab = cat.tabs.find(t => t.type.toLowerCase() === plan.toLowerCase());
                if (foundTab) {
                    selectedPlanTab = foundTab;
                    break;
                }
            }
        }

        // Fallback to any category if role-specific lookup failed
        if (!selectedPlanTab) {
            for (const cat of pricingData) {
                const foundTab = cat.tabs.find(t => t.type.toLowerCase() === plan.toLowerCase());
                if (foundTab) {
                    selectedPlanTab = foundTab;
                    break;
                }
            }
        }

        if (selectedPlanTab) {
            amount = billing === 'monthly' ? selectedPlanTab.pricing.monthly : selectedPlanTab.pricing.yearly;
            selectedPlanFeatures = selectedPlanTab.features || [];
            hasPlanTrial = selectedPlanTab.hasTrial;
            trialDaysCount = selectedPlanTab.trialDays;
            // Use the actual name from the plan data
            selectedPlanName = selectedPlanTab.name;
        }
    }

    const planDisplayName = selectedPlanName || (plan ? `${plan.charAt(0).toUpperCase() + plan.slice(1)}` : 'Standard');

    // Secure re-verification of trial eligibility
    // Allow trials if:
    // 1. Plan supports trials (hasPlanTrial)
    // 2. Not an upgrade flow (isUpgrade)
    // 3. User is NOT authenticated (New registration) OR User is authenticated but on FREE plan and hasn't used trial
    const canUseTrial = hasPlanTrial && !isUpgrade && (
        !isAuthenticated ||
        (user?.plan?.toUpperCase() === 'FREE' && !user?.trialUsed)
    );

    // Apply pro-rated discount if this is an upgrade
    const finalAmount = (isUpgrade && discountedAmount !== undefined) ? discountedAmount : amount;

    // Paystack requires a minimum amount for card storage. We'll use ₦100 as a validation fee.
    const checkoutAmount = canUseTrial ? 100 : finalAmount;

    useEffect(() => {
        if (!plan) {
            router.push('/pricing');
            return;
        }
        if (isAuthenticated && user?.email) {
            setStep('PAYMENT_READY');
        }
    }, [isAuthenticated, user, plan, router]);

    useEffect(() => {
        if (step === 'SUCCESS') {
            // Invalidate all school queries (billing, stats, etc.) with the correct key
            if (queryClient) {
                const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId;
                if (schoolId) {
                    queryClient.invalidateQueries({ queryKey: schoolQueryKeys.billing(schoolId) });
                } else {
                    queryClient.invalidateQueries({ queryKey: ['school'] });
                }
                queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            }
            const timer = setTimeout(() => {
                let targetUrl = `/dashboard/${role?.toLowerCase() || 'admin'}/billing`;
                if (isAuthenticated && !hasCompletedOnboarding) {
                    targetUrl = `/onboarding?type=${role}`;
                }

                clearCheckout();
                router.push(targetUrl);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [step, router, clearCheckout, queryClient, user, role, isAuthenticated, hasCompletedOnboarding]);

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
            const { exists, role: userRole, plan: userPlan, trialUsed } = checkRes.data;

            if (exists) {
                if (userPlan || trialUsed !== undefined) {
                    updateUser({ plan: userPlan, trialUsed });
                }
            }

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
            const res = await apiClient.post('/auth/verify-checkout-code', {
                email,
                code: otp,
                userType: role,
                plan: plan // Pass selected plan type
            });

            if (res.data.userId) {
                setRegisteredUserId(res.data.userId);
            }

            if (res.data.plan || res.data.trialUsed !== undefined) {
                updateUser({ plan: res.data.plan, trialUsed: res.data.trialUsed });
            }

            toast.success("Verified successfully!");
            if (!isAuthenticated && !isReturningUser) {
                setStep('PASSWORD_SETUP');
            } else {
                setStep('PAYMENT_READY');
            }
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
        if (password.length < 8) return toast.error("Password must be at least 8 characters");
        if (password !== confirmPassword) return toast.error("Passwords do not match");

        setIsLoading(true);
        try {
            await apiClient.post('/auth/finalize-checkout-setup', {
                email,
                userType: role,
                password,
                planId: plan, // Using 'plan' as the identifier to be resolved by backend
                billingCycle: billing,
                acceptTerms: acceptTerms
            });
            toast.success("Account setup successful! Proceeding to payment.");
            setStep('PAYMENT_READY');
        } catch (error: any) {
            console.error("Setup error:", error);
            toast.error(error.response?.data?.message || "Failed to finalize account setup");
        } finally {
            setIsLoading(false);
        }
    };

    // Paystack Integration
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_placeholder";
    const paystackProps = {
        email: email,
        amount: checkoutAmount * 100,
        metadata: {
            custom_fields: [
                { display_name: "Plan", variable_name: "plan", value: plan },
                { display_name: "Billing", variable_name: "billing", value: billing },
                { display_name: "Is Trial", variable_name: "is_trial", value: canUseTrial.toString() },
                { display_name: "Is Upgrade", variable_name: "is_upgrade", value: isUpgrade?.toString() || 'false' },
                { display_name: "User ID", variable_name: "user_id", value: user?.id || registeredUserId || "" },
                { display_name: "User Role", variable_name: "user_role", value: role }
            ],
        },
        publicKey,
        text: "Pay Now",
        onSuccess: async (reference: any) => {
            try {
                setStep('VERIFYING_PAYMENT');
                toast.loading("Verifying payment...", { toastId: "verify" });
                await paymentService.verify({ reference: reference.reference, plan, billingType: billing as "monthly" | "yearly" });

                // Refresh billing status immediately
                if (queryClient) {
                    queryClient.invalidateQueries({ queryKey: ['school'] });
                    queryClient.invalidateQueries({ queryKey: ['user-profile'] });
                    queryClient.invalidateQueries({ queryKey: schoolQueryKeys.billing(user?.schools?.[0]?.schoolId || user?.tenantId || "") });
                }

                toast.update("verify", { render: "Payment verified!", type: "success", isLoading: false, autoClose: 2000 });

                // Sync updated plan to auth store so pricing page reflects it immediately
                updateUser({
                    plan: plan || undefined,
                    subscriptionStatus: 'ACTIVE',
                    trialUsed: canUseTrial ? true : user?.trialUsed,
                });

                setIsLoading(false); // Clear initializing state

                if (!isAuthenticated && !isReturningUser) {
                    setStep('POST_PAYMENT_SETUP');
                } else {
                    setStep('SUCCESS');
                }
            } catch (error) {
                setIsLoading(false);
                setStep('PAYMENT_READY');
                toast.update("verify", { render: "Verification failed.", type: "error", isLoading: false, autoClose: 3000 });
            }
        },
        onClose: () => {
            setIsLoading(false);
            toast.info("Payment cancelled");
        },
    };

    const initializePaystack = usePaystackPayment(paystackProps as any);

    const handlePayment = () => {
        if (!email) return toast.error("Please provide an email");
        setIsLoading(true);
        try {
            initializePaystack(paystackProps as any);
        } catch (error: any) {
            setIsLoading(false);
            toast.error("Payment initialization failed");
            console.error("Paystack Init Error:", error);
        }
    };

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

                        {step === 'PASSWORD_SETUP' && (
                            <motion.div key="password-setup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="mb-8">
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white font-lexend mb-2">Create Account</h2>
                                    <p className="text-slate-500">Choose a secure password to protect your institutional identity.</p>
                                </div>
                                <form onSubmit={handleSavePassword} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type={showPassword ? "text" : "password"} required minLength={6}
                                                value={password} onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type={showPassword ? "text" : "password"} required minLength={6}
                                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    {/* Privacy and Policy Checkbox */}
                                    <div className="flex flex-col pt-2">
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <div className="relative flex items-center h-5">
                                                <input
                                                    type="checkbox"
                                                    checked={acceptTerms}
                                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-blue-600 checked:border-blue-600 transition-all duration-200"
                                                />
                                                <CheckCircle2 className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity left-0.5 top-1 pointer-events-none" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-tight">
                                                I agree to the{" "}
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setShowTermsModal(true); }}
                                                    className="text-blue-600 hover:text-blue-700 font-bold underline underline-offset-4"
                                                >
                                                    Terms of Service
                                                </button>{" "}
                                                and{" "}
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setShowPrivacyModal(true); }}
                                                    className="text-blue-600 hover:text-blue-700 font-bold underline underline-offset-4"
                                                >
                                                    Privacy Policy
                                                </button>
                                            </span>
                                        </label>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoading || !acceptTerms}
                                        className={`w-full py-6 text-lg rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-2 
                                            ${acceptTerms
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
                                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save & Continue to Payment"}
                                    </Button>
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
                                        <p className="text-slate-500 text-xs">Protected by Secure Gateway</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handlePayment}
                                    disabled={isLoading}
                                    className="w-full py-8 text-xl rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 font-black shadow-xl transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            Initializing...
                                        </>
                                    ) : (
                                        canUseTrial ? "Initialize Free Trial" : `Pay ₦${checkoutAmount.toLocaleString()}`
                                    )}
                                </Button>
                            </motion.div>
                        )}

                        {step === 'VERIFYING_PAYMENT' && (
                            <motion.div key="verifying" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 flex flex-col items-center justify-center">
                                <div className="relative size-24 mb-8 flex items-center justify-center">
                                    {/* Revolving Double-layered Gradient Border */}
                                    <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-white/5 animate-spin" style={{ borderTopColor: '#2563eb', borderRightColor: '#3b82f6', animationDuration: '1s' }} />
                                    <div className="absolute inset-2 rounded-full border-4 border-slate-100 dark:border-white/5 animate-spin" style={{ borderBottomColor: '#f97316', animationDuration: '1.5s', animationDirection: 'reverse' }} />
                                    <ShieldCheck className="size-10 text-blue-600 animate-pulse" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white font-lexend mb-4">Verifying Payment</h2>
                                <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed mb-4">
                                    Securely confirming your transaction credentials with the payment network...
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                                    Please do not close this tab or refresh the page
                                </p>
                            </motion.div>
                        )}

                        {step === 'POST_PAYMENT_SETUP' && (
                            <motion.div key="setup" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white font-lexend mb-2">Payment Successful!</h2>
                                    <p className="text-slate-500 mb-8">Your subscription is active and your account is ready.</p>

                                    <Link href={`/login/${role === 'ADMIN' ? 'school-admin' : role?.toLowerCase() || 'school-admin'}`}>
                                        <Button className="w-full py-6 text-lg rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2">
                                            Go to Login <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        )}

                        {step === 'SUCCESS' && (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white font-lexend mb-4">You're all set!</h2>
                                <p className="text-slate-500 mb-10 text-lg">
                                    Redirecting you to your billing dashboard...
                                </p>
                                <Link href={`/dashboard/${role?.toLowerCase() || 'admin'}/billing`}>
                                    <Button className="px-10 py-6 text-lg rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black shadow-xl">
                                        Go to Billing page
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
                                <h4 className="text-2xl font-black capitalize font-lexend leading-tight">{planDisplayName} Plan</h4>
                                <p className="text-blue-400 font-bold capitalize text-sm">{billing} Billing</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-slate-400">
                                <span>Plan Subtotal ({billing})</span>
                                <span>₦{amount.toLocaleString()}</span>
                            </div>

                            {isUpgrade && discountedAmount !== undefined && amount > discountedAmount && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="flex justify-between items-center text-emerald-400 font-bold bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20"
                                >
                                    <span className="flex items-center gap-2 text-xs">
                                        <Zap className="w-4 h-4" />
                                        Upgrade Credit (Pro-rated)
                                    </span>
                                    <span className="text-sm">- ₦{(amount - discountedAmount).toLocaleString()}</span>
                                </motion.div>
                            )}

                            {isUpgrade && (discountedAmount === undefined || amount === discountedAmount) && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[10px] text-amber-400 font-black uppercase tracking-widest bg-amber-400/10 p-3 rounded-xl text-center border border-amber-400/20"
                                >
                                    Cycle Reset: Full price applies (Used &gt; 15 days or no previous payment found)
                                </motion.div>
                            )}

                            <div className="flex justify-between items-center text-slate-400">
                                <span>Taxes</span>
                                <span>Calculated at checkout</span>
                            </div>
                        </div>

                        <div className="h-px w-full bg-slate-800 mb-8" />

                        {selectedPlanFeatures.length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-400" /> What you'll gain
                                </h4>
                                <ul className="space-y-3">
                                    {selectedPlanFeatures.slice(0, 5).map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                    {selectedPlanFeatures.length > 5 && (
                                        <li className="text-slate-500 text-xs italic pl-7">+ and many more premium features</li>
                                    )}
                                </ul>
                            </div>
                        )}

                        <div className="h-px w-full bg-slate-800 mb-8" />

                        <div className="flex justify-between items-end">
                            <div className="w-full">
                                <p className="text-sm text-slate-400 mb-1">Total Due Today</p>
                                {canUseTrial ? (
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black text-slate-500 line-through opacity-50">₦{amount.toLocaleString()}</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black tracking-tighter text-white">₦0</span>
                                            <span className="text-blue-400 text-sm font-bold uppercase">({trialDaysCount} Days Free)</span>
                                        </div>
                                        {/* ── ₦100 Card Validation Notice ── */}
                                        <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3">
                                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                                            <div className="text-xs leading-relaxed text-amber-200">
                                                <span className="font-bold text-amber-300">₦100 card validation charge applies.</span>
                                                {" "}This is a one-time, non-refundable fee used solely to verify and securely store your card details for
                                                {" "}auto-renewal at the end of your free trial. You will <span className="font-semibold">not</span> be
                                                {" "}charged your subscription fee today.
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-5xl font-black tracking-tighter">₦{checkoutAmount.toLocaleString()}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Privacy Policy Modal */}
            {showPrivacyModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-slate-100 dark:border-slate-800"
                    >
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white font-lexend">Privacy Policy</h3>
                                <p className="text-slate-500 text-sm font-bold">Last updated: May 2024</p>
                            </div>
                            <button
                                onClick={() => setShowPrivacyModal(false)}
                                className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto max-h-[calc(80vh-160px)] prose dark:prose-invert prose-slate">
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">1. Information We Collect</h4>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                We collect information you provide directly to us when you create an account, such as your name, email address, and institutional affiliation.
                            </p>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">2. How We Use Your Information</h4>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                We use the information we collect to provide, maintain, and improve our services, and to communicate with you about your account.
                            </p>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">3. Data Security</h4>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                We implement industry-standard security measures to protect your personal data from unauthorized access or disclosure.
                            </p>
                        </div>
                        <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <Button
                                onClick={() => setShowPrivacyModal(false)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black"
                            >
                                I Understand
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Terms of Service Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-slate-100 dark:border-slate-800"
                    >
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white font-lexend">Terms of Service</h3>
                                <p className="text-slate-500 text-sm font-bold">Last updated: May 2024</p>
                            </div>
                            <button
                                onClick={() => setShowTermsModal(false)}
                                className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto max-h-[calc(80vh-160px)] prose dark:prose-invert prose-slate">
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">1. Acceptance of Terms</h4>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                By accessing or using our platform, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                            </p>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">2. Use License</h4>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                Permission is granted to temporarily use our platform for personal, non-commercial institutional use only.
                            </p>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">3. Disclaimer</h4>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                The materials on our platform are provided on an 'as is' basis. We make no warranties, expressed or implied.
                            </p>
                        </div>
                        <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <Button
                                onClick={() => setShowTermsModal(false)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black"
                            >
                                I Accept
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

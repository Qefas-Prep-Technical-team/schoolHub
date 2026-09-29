"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Lock, ShieldCheck,
  Mail, KeyRound, Loader2, Eye, EyeOff, AlertTriangle,
  Tag, X, Zap, Star, Crown, BadgeCheck, Sparkles
} from "lucide-react";
import { toast } from "react-toastify";
import { paymentService } from "@/lib/api/services/paymentService";
import { apiClient } from "@/lib/api/client";
import { useFetchPricing } from "@/components/pricing/query";
import { useCheckoutStore } from "@/utils/CheckoutStore";
import { useQueryClient } from "@tanstack/react-query";
import { schoolQueryKeys } from "@/lib/api/hooks/useSchool";
import Link from "next/link";
import { Player } from "@lottiefiles/react-lottie-player";

type CheckoutState =
  | "EMAIL_ENTRY"
  | "VERIFY_OTP"
  | "PASSWORD_SETUP"
  | "PAYMENT_READY"
  | "VERIFYING_PAYMENT"
  | "POST_PAYMENT_SETUP"
  | "SUCCESS";

const STEPS: CheckoutState[] = ["EMAIL_ENTRY", "VERIFY_OTP", "PASSWORD_SETUP", "PAYMENT_READY"];

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <Star className="w-5 h-5" />,
  starter: <Zap className="w-5 h-5" />,
  pro: <Crown className="w-5 h-5" />,
  enterprise: <Sparkles className="w-5 h-5" />,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser, hasCompletedOnboarding } = useAuthStore();
  const { plan, billing: initialBilling, role, discountedAmount, isUpgrade, resetCycle, clearCheckout } = useCheckoutStore();
  const queryClient = useQueryClient();

  // Local billing cycle — user can toggle this on the checkout page
  const [selectedBilling, setSelectedBilling] = useState<"monthly" | "yearly">(initialBilling as "monthly" | "yearly" || "monthly");
  const [monthQty, setMonthQty] = useState(1); // number of months to pay for at once

  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<CheckoutState>("EMAIL_ENTRY");
  const [isLoading, setIsLoading] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountNaira: number;
    message: string;
    couponId: string;
  } | null>(null);

  const isPaymentInFlight = React.useRef(false);

  // Pricing
  const { data: pricingData } = useFetchPricing();
  let amount = 0;
  let monthlyPrice = 0;
  let yearlyPrice = 0;
  let selectedPlanFeatures: string[] = [];
  let hasPlanTrial = false;
  let trialDaysCount = 0;
  let selectedPlanName = "";

  // Resolve pricing for selected billing cycle
  const billing = selectedBilling; // alias so rest of file still works
  if (pricingData) {
    const roleToCategory: Record<string, string> = {
      ADMIN: "schools", TEACHER: "teachers", PARENT: "parents", STUDENT: "students",
    };
    const targetCategory = roleToCategory[role] || "students";

    let selectedPlanTab = null;
    for (const cat of pricingData) {
      if (cat.category.toLowerCase() === targetCategory.toLowerCase()) {
        const found = cat.tabs.find((t: { type: string }) => t.type.toLowerCase() === plan.toLowerCase());
        if (found) { selectedPlanTab = found; break; }
      }
    }
    if (!selectedPlanTab) {
      for (const cat of pricingData) {
        const found = cat.tabs.find((t: { type: string }) => t.type.toLowerCase() === plan.toLowerCase());
        if (found) { selectedPlanTab = found; break; }
      }
    }
    if (selectedPlanTab) {
      // Always compute both so we can show savings
      monthlyPrice = selectedPlanTab.pricing?.monthly ?? 0;
      yearlyPrice = selectedPlanTab.pricing?.yearly ?? 0;
      amount = billing === "monthly" ? monthlyPrice * monthQty : yearlyPrice;
      selectedPlanFeatures = selectedPlanTab.features || [];
      hasPlanTrial = selectedPlanTab.hasTrial;
      trialDaysCount = selectedPlanTab.trialDays;
      selectedPlanName = selectedPlanTab.name;
    }
  }

  const planDisplayName = selectedPlanName || (plan ? `${plan.charAt(0).toUpperCase() + plan.slice(1)}` : "Standard");
  // Allow trial if: plan has trial AND (unauthenticated user OR user on FREE plan with no trial used)
  // Note: Users upgrading FROM free to paid still qualify for trial on their first time
  const canUseTrial = hasPlanTrial && !isUpgrade && (!isAuthenticated || !user?.trialUsed);
  const isDowngrade = !isUpgrade && discountedAmount === 0 && !!plan;
  const baseAmount = (isUpgrade && discountedAmount !== undefined) ? discountedAmount : amount;
  const couponDiscount = appliedCoupon?.discountNaira || 0;
  const finalAmount = Math.max(0, baseAmount - couponDiscount);
  const checkoutAmount = canUseTrial ? 100 : finalAmount;

  // Redirect guard
  useEffect(() => {
    if (!plan) { router.push("/pricing"); return; }
    // If already logged in, skip email/OTP entirely
    if (isAuthenticated && user?.email) {
      setEmail(user.email); // lock in the server-known email
      setStep("PAYMENT_READY");
    }
  }, [isAuthenticated, user, plan, router]);

  // Success redirect
  useEffect(() => {
    if (step === "SUCCESS") {
      if (queryClient) {
        const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId;
        if (schoolId) queryClient.invalidateQueries({ queryKey: schoolQueryKeys.billing(schoolId) });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      }
      const timer = setTimeout(() => {
        let targetUrl = `/dashboard/${role?.toLowerCase() || "admin"}/billing`;
        if (isAuthenticated && !hasCompletedOnboarding) targetUrl = `/onboarding?type=${role}`;
        clearCheckout();
        router.push(targetUrl);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, router, clearCheckout, queryClient, user, role, isAuthenticated, hasCompletedOnboarding]);

  // Resend OTP timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  // ─── Handlers ────────────────────────────────────────────────

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    setIsLoading(true);
    try {
      const checkRes = await apiClient.post("/auth/check-email", { email });
      const { exists, role: userRole, plan: userPlan, trialUsed } = checkRes.data;
      if (exists && (userPlan || trialUsed !== undefined)) updateUser({ plan: userPlan, trialUsed });

      // GUARD 1: Role mismatch — existing user registered as different role
      if (exists && userRole && role && userRole.toUpperCase() !== role.toUpperCase()) {
        toast.error(`This email is registered as a ${userRole}. Redirecting you to pricing...`, { autoClose: 4000 });
        setTimeout(() => router.push("/pricing"), 2500);
        return;
      }

      // GUARD 2: Plan-category mismatch — chosen plan not available for this role
      // (catches cases where e.g. a TEACHER tries to buy a Schools-only plan)
      if (pricingData && role && plan) {
        const roleToCategory: Record<string, string> = {
          ADMIN: "schools", TEACHER: "teachers", PARENT: "parents", STUDENT: "students",
        };
        const targetCategory = roleToCategory[role] || "";
        const planExistsForRole = pricingData
          .filter((cat: { category: string }) => cat.category.toLowerCase() === targetCategory.toLowerCase())
          .some((cat: { tabs: { type: string }[] }) =>
            cat.tabs.some((t) => t.type.toLowerCase() === plan.toLowerCase())
          );
        if (!planExistsForRole) {
          toast.error(`The "${plan}" plan is not available for ${role.toLowerCase()} accounts. Please choose the correct plan.`, { autoClose: 5000 });
          setTimeout(() => router.push("/pricing"), 3000);
          return;
        }
      }

      setIsReturningUser(exists);
      await apiClient.post("/auth/request-code", { email, userType: role });
      setStep("VERIFY_OTP");
      setResendTimer(60);
      toast.success("We've sent a 6-digit code to your email.");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to send code. Please try again.");
    } finally { setIsLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error("Please enter the OTP");
    setIsLoading(true);
    try {
      const res = await apiClient.post("/auth/verify-checkout-code", { email, code: otp, userType: role, plan });
      if (res.data.userId) setRegisteredUserId(res.data.userId);
      if (res.data.plan || res.data.trialUsed !== undefined) updateUser({ plan: res.data.plan, trialUsed: res.data.trialUsed });
      toast.success("Verified!");
      if (!isAuthenticated && !isReturningUser) setStep("PASSWORD_SETUP");
      else setStep("PAYMENT_READY");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Invalid or expired OTP");
    } finally { setIsLoading(false); }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      await apiClient.post("/auth/request-code", { email, userType: role });
      setResendTimer(60);
      toast.success("A new code has been sent!");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to resend");
    } finally { setIsLoading(false); }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    if (!acceptTerms) return toast.error("Please accept the terms to continue");
    setIsLoading(true);
    try {
      const res = await apiClient.post("/auth/finalize-checkout-setup", { email, userType: role, password, planId: plan, billingCycle: billing, acceptTerms });
      if (res.data.token && res.data.user) {
        useAuthStore.getState().setAuth(res.data.user, res.data.token);
      }
      toast.success("Account ready!");
      setStep("PAYMENT_READY");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to set up account");
    } finally { setIsLoading(false); }
  };

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return toast.error("Enter a coupon code");
    setCouponLoading(true);
    try {
      const res = await apiClient.post("/payment/coupon/validate", {
        code: couponCode.trim(),
        email: email || user?.email || "",
        plan: plan || "",
        role: role || "ADMIN",
        amountNaira: baseAmount,
      });
      setAppliedCoupon({
        code: res.data.data.code,
        discountNaira: res.data.data.discountNaira,
        message: res.data.data.message,
        couponId: res.data.data.couponId,
      });
      toast.success(res.data.data.message);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err?.response?.data?.error || "Invalid coupon code");
    } finally { setCouponLoading(false); }
  }, [couponCode, email, user?.email, plan, role, baseAmount]);

  const handlePayment = async () => {
    if (!email) return toast.error("Please provide an email");
    if (isPaymentInFlight.current) { toast.info("Payment already in progress"); return; }
    isPaymentInFlight.current = true;
    setIsLoading(true);
    try {
      const userId = user?.id || registeredUserId || "";
      const res = await paymentService.initialize({
        amount: checkoutAmount,
        email,
        plan,
        metadata: {
          billing, months: billing === "monthly" ? monthQty : 1, is_trial: canUseTrial, is_upgrade: isUpgrade, reset_cycle: resetCycle,
          user_role: role, name: user?.name || email, userId,
          couponId: appliedCoupon?.couponId,
          couponCode: appliedCoupon?.code,
          couponDiscount: appliedCoupon?.discountNaira || 0,
        },
      });
      const checkoutUrl: string = res.authorization_url || res.checkoutUrl;
      if (checkoutUrl) window.location.href = checkoutUrl;
      else throw new Error("No checkout URL returned");
    } catch (error: unknown) {
      isPaymentInFlight.current = false;
      setIsLoading(false);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err?.response?.data?.message || err?.message || "Payment initialization failed");
    }
  };

  const currentStepIndex = STEPS.indexOf(step);
  const visibleSteps = isReturningUser ? 3 : 4;

  // ─── Render ──────────────────────────────────────────────────
  if (step === "VERIFYING_PAYMENT") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 max-w-md w-full text-center shadow-2xl">
          <div className="relative size-24 mb-8 flex items-center justify-center mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100 animate-spin" style={{ borderTopColor: "#4f46e5", animationDuration: "1s" }} />
            <div className="absolute inset-2 rounded-full border-4 border-slate-100 animate-spin" style={{ borderBottomColor: "#f59e0b", animationDuration: "1.5s", animationDirection: "reverse" }} />
            <ShieldCheck className="size-10 text-indigo-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Verifying Payment</h2>
          <p className="text-slate-500 text-sm">Please don't close or refresh this tab</p>
        </div>
      </div>
    );
  }

  if (step === "SUCCESS" || step === "POST_PAYMENT_SETUP") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 max-w-md w-full text-center shadow-2xl">
          {step === "SUCCESS" ? (
            <>
              <div className="w-40 h-40 mx-auto -mb-4">
                <Player autoplay keepLastFrame src="https://lottie.host/a2960c47-4b7b-4c47-ad8f-01cc9d174e63/Mfm99mhpXR.json" style={{ width: "100%", height: "100%" }} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Payment Successful! 🎉</h2>
              <p className="text-slate-500 text-sm mb-6">Your <span className="font-bold text-indigo-600">{planDisplayName}</span> plan is now active.</p>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400"><Loader2 className="w-3 h-3 animate-spin" /><span>Redirecting in 3 seconds...</span></div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-green-600" /></div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Account Ready!</h2>
              <p className="text-slate-500 text-sm mb-6">Your subscription is active.</p>
              <Link href={`/login/${role === "ADMIN" ? "school-admin" : role?.toLowerCase()}`} className="block w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-center hover:bg-indigo-700 transition-colors">
                Go to Login
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 py-10 px-4 lg:px-8">
      {/* Top bar */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <Link href="/pricing" className="flex items-center gap-2 text-base font-semibold text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Pricing
        </Link>
        <div className="flex items-center gap-2 text-white/50 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Secured by 256-bit SSL</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">

        {/* ── LEFT COLUMN: Plan Card + Form ─────────────────── */}
        <div className="space-y-4">

          {/* Plan cart card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-white/5">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-indigo-600/30">
                {PLAN_ICONS[plan?.toLowerCase()] || <ShieldCheck className="w-7 h-7" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-slate-900 dark:text-white text-2xl leading-tight">{planDisplayName} Plan</h3>
                <p className="text-indigo-500 text-base font-semibold capitalize mt-0.5">{billing} billing · {role?.toLowerCase()} account</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-4xl font-black text-slate-900 dark:text-white">₦{baseAmount.toLocaleString()}</p>
                <p className="text-sm text-slate-400 font-medium">/{billing === "monthly" ? (monthQty > 1 ? `${monthQty} mo` : "mo") : "yr"}</p>
              </div>
            </div>

            {canUseTrial && (
              <div className="mt-5 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-5 py-3.5">
                <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  {trialDaysCount}-day free trial — only ₦100 validation charge today
                </p>
              </div>
            )}

            {selectedPlanFeatures.length > 0 && (
              <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
                {selectedPlanFeatures.slice(0, 8).map((f: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-base text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-white/5 overflow-hidden">

            {/* Step indicator */}
            {!isDowngrade && (
              <div className="flex border-b border-slate-100 dark:border-slate-800">
                {(isAuthenticated ? ["PAYMENT_READY"] : (isReturningUser ? ["EMAIL_ENTRY", "VERIFY_OTP", "PAYMENT_READY"] : STEPS)).map((s, i) => {
                  const idx = STEPS.indexOf(s as CheckoutState);
                  const current = STEPS.indexOf(step);
                  const done = current > idx;
                  const active = current === idx;
                  const labels: Record<string, string> = { EMAIL_ENTRY: "Account", VERIFY_OTP: "Verify", PASSWORD_SETUP: "Security", PAYMENT_READY: "Payment" };
                  return (
                    <div key={s} className={`flex-1 flex flex-col items-center py-4 gap-1.5 text-xs font-semibold transition-colors ${active ? "text-indigo-600" : done ? "text-emerald-600" : "text-slate-400"}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${active ? "bg-indigo-600 text-white" : done ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                        {done ? "✓" : i + 1}
                      </div>
                      <span className="hidden sm:block">{labels[s]}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="p-10">
              <AnimatePresence mode="wait">

                {/* EMAIL */}
                {step === "EMAIL_ENTRY" && (
                  <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Let's get started</h2>
                    <p className="text-slate-500 text-lg mb-8">Enter your email to begin your purchase.</p>
                    <form onSubmit={handleEmailSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-base"
                            placeholder="you@example.com" />
                        </div>
                      </div>
                      <button type="submit" disabled={isLoading}
                        className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Continue</span><ArrowRight className="w-5 h-5" /></>}
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* OTP */}
                {step === "VERIFY_OTP" && (
                  <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">{isReturningUser ? "Welcome back!" : "Verify your email"}</h2>
                    <p className="text-slate-500 text-lg mb-8">We sent a code to <span className="font-bold text-slate-700 dark:text-white">{email}</span></p>
                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Verification Code</label>
                        <div className="relative">
                          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-center tracking-[0.5em] font-black text-2xl transition-all"
                            placeholder="• • • • • •" />
                        </div>
                      </div>
                      <button type="submit" disabled={isLoading}
                        className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Verify & Continue</span><ArrowRight className="w-5 h-5" /></>}
                      </button>
                      <p className="text-center text-sm text-slate-500">
                        Didn't get it?{" "}
                        <button type="button" onClick={handleResendOtp} disabled={resendTimer > 0}
                          className={`font-bold ${resendTimer > 0 ? "text-slate-400" : "text-indigo-600 hover:text-indigo-700"}`}>
                          {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
                        </button>
                      </p>
                    </form>
                  </motion.div>
                )}

                {/* PASSWORD */}
                {step === "PASSWORD_SETUP" && (
                  <motion.div key="password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Create your password</h2>
                    <p className="text-slate-500 text-lg mb-8">Choose a strong password for your account.</p>
                    <form onSubmit={handleSavePassword} className="space-y-5">
                      {[
                        { label: "Password", val: password, set: setPassword, placeholder: "Min 8 characters" },
                        { label: "Confirm Password", val: confirmPassword, set: setConfirmPassword, placeholder: "Re-enter password" },
                      ].map(({ label, val, set, placeholder }) => (
                        <div key={label}>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{label}</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input type={showPassword ? "text" : "password"} required minLength={8} value={val} onChange={(e) => set(e.target.value)}
                              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-base transition-all"
                              placeholder={placeholder} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      ))}
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-0.5 w-4 h-4 rounded accent-indigo-600" />
                        <span className="text-sm text-slate-500">
                          I agree to the{" "}
                          <Link href="/terms" target="_blank" className="text-indigo-600 font-semibold hover:underline">Terms of Service</Link>
                          {" "}and{" "}
                          <Link href="/privacy" target="_blank" className="text-indigo-600 font-semibold hover:underline">Privacy Policy</Link>
                        </span>
                      </label>
                      <button type="submit" disabled={isLoading || !acceptTerms}
                        className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Continue to Payment</span><ArrowRight className="w-5 h-5" /></>}
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* PAYMENT_READY — downgrade or normal pay */}
                {step === "PAYMENT_READY" && (
                  <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    {isDowngrade ? (
                      <div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Confirm Downgrade</h2>
                        <p className="text-slate-500 text-lg mb-8">Switching to <span className="font-bold text-amber-600">{planDisplayName}</span></p>
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 mb-8 border border-amber-200 dark:border-amber-800/50">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-2 font-medium">
                              <li>✓ Current plan stays active until billing period ends</li>
                              <li>✓ No charge today — new price applies at renewal</li>
                              <li className="text-red-600">✗ Higher-tier features lost at renewal</li>
                            </ul>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <button onClick={async () => {
                            setIsLoading(true);
                            try {
                              await apiClient.post("/payment/schedule-downgrade", { plan, billingType: billing });
                              queryClient.invalidateQueries({ queryKey: ["school"] });
                              setStep("SUCCESS");
                            } catch (err: unknown) {
                              const e = err as { response?: { data?: { message?: string } } };
                              toast.error(e?.response?.data?.message || "Failed to schedule downgrade");
                            } finally { setIsLoading(false); }
                          }} disabled={isLoading}
                            className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-base transition-all flex items-center justify-center gap-2">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Downgrade"}
                          </button>
                          <button onClick={() => router.back()} className="w-full py-3 rounded-2xl text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors">
                            Cancel — Keep Current Plan
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Ready to pay</h2>
                        <p className="text-slate-500 text-lg mb-8">Billing to <span className="font-bold text-slate-700 dark:text-white">{email}</span></p>
                        <div className="flex items-center gap-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-5 mb-8">
                          <BadgeCheck className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">Secure Payment</p>
                            <p className="text-sm text-slate-500">Your payment info is encrypted end-to-end</p>
                          </div>
                        </div>
                        <button onClick={handlePayment} disabled={isLoading}
                          className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-60">
                          {isLoading ? <><Loader2 className="w-6 h-6 animate-spin" />Redirecting...</> : canUseTrial ? "Start Free Trial" : `Pay ₦${checkoutAmount.toLocaleString()}`}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Order Summary ────────────────────── */}
        <div className="lg:sticky lg:top-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-xl border border-white/5">
            <h3 className="font-black text-slate-900 dark:text-white text-2xl mb-6">Order Summary</h3>

            {/* ── Billing cycle toggle ── */}
            {!isUpgrade && !isDowngrade && monthlyPrice > 0 && yearlyPrice > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Billing Cycle</p>
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                  <button
                    onClick={() => { setSelectedBilling("monthly"); setAppliedCoupon(null); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedBilling === "monthly"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                      }`}>
                    Monthly
                  </button>
                  <button
                    onClick={() => { setSelectedBilling("yearly"); setAppliedCoupon(null); setMonthQty(1); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${selectedBilling === "yearly"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                      }`}>
                    Yearly
                    {monthlyPrice > 0 && yearlyPrice > 0 && (
                      <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-full">
                        Save {Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100)}%
                      </span>
                    )}
                  </button>
                </div>
                {selectedBilling === "yearly" && monthlyPrice > 0 && yearlyPrice > 0 && (
                  <p className="text-xs text-emerald-600 font-semibold mt-2 text-center">
                    ₦{(monthlyPrice * 12 - yearlyPrice).toLocaleString()} saved vs monthly billing
                  </p>
                )}
              </div>
            )}

            {/* ── Month quantity picker (monthly billing only) ── */}
            {!isUpgrade && !isDowngrade && selectedBilling === "monthly" && monthlyPrice > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Number of Months</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setMonthQty((q) => Math.max(1, q - 1)); setAppliedCoupon(null); }}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-lg flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
                    disabled={monthQty <= 1}
                  >−</button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{monthQty}</span>
                    <span className="text-slate-400 font-semibold ml-1.5 text-sm">{monthQty === 1 ? "month" : "months"}</span>
                  </div>
                  <button
                    onClick={() => { setMonthQty((q) => Math.min(12, q + 1)); setAppliedCoupon(null); }}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-lg flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
                    disabled={monthQty >= 12}
                  >+</button>
                </div>
                {monthQty > 1 && (
                  <p className="text-xs text-indigo-500 font-semibold mt-2 text-center">
                    {monthQty} × ₦{monthlyPrice.toLocaleString()} = ₦{(monthlyPrice * monthQty).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Line items */}
            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-base">{planDisplayName} Plan ({billing === "monthly" && monthQty > 1 ? `${monthQty} months` : billing})</span>
                <span className="font-bold text-slate-900 dark:text-white text-lg">₦{amount.toLocaleString()}</span>
              </div>

              {isUpgrade && discountedAmount !== undefined && amount > discountedAmount && (
                <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-4 py-2.5 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5 text-sm">
                    <Zap className="w-3.5 h-3.5" /> Upgrade Credit
                  </span>
                  <span className="text-emerald-600 font-bold">-₦{(amount - discountedAmount).toLocaleString()}</span>
                </div>
              )}

              {appliedCoupon && (
                <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-4 py-2.5 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5 text-sm">
                    <Tag className="w-3.5 h-3.5" /> {appliedCoupon.code}
                    <button onClick={() => setAppliedCoupon(null)} className="ml-1 text-slate-400 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                  </span>
                  <span className="text-emerald-600 font-bold">-₦{appliedCoupon.discountNaira.toLocaleString()}</span>
                </div>
              )}

              {canUseTrial && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Trial validation charge</span>
                  <span className="font-bold text-slate-900 dark:text-white">₦100</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-base">Delivery</span>
                <span className="font-bold text-emerald-600 text-base">FREE</span>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-black text-slate-900 dark:text-white text-lg">Total</span>
                <span className="text-4xl font-black text-indigo-600">₦{checkoutAmount.toLocaleString()}</span>
              </div>
              {selectedBilling === "yearly" && monthlyPrice > 0 && (
                <p className="text-xs text-slate-400 mt-1 text-right line-through">₦{(monthlyPrice * 12).toLocaleString()} if billed monthly</p>
              )}
            </div>

            {/* Coupon code */}
            {!appliedCoupon && (
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Promo Code</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      placeholder="SAVE20"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}
                    className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-black transition-all disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0">
                    {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                  </button>
                </div>
              </div>
            )}

            {appliedCoupon && (
              <div className="mb-6 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-4 py-3.5 border border-emerald-200 dark:border-emerald-800">
                <BadgeCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex-1">{appliedCoupon.message}</p>
                <button onClick={() => setAppliedCoupon(null)} className="text-slate-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
              </div>
            )}

            {/* CTA button */}
            {step === "PAYMENT_READY" && !isDowngrade && (
              <button onClick={handlePayment} disabled={isLoading}
                className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-base hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-60">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>{canUseTrial ? "Start Free Trial" : `Pay ₦${checkoutAmount.toLocaleString()}`}</span><ArrowRight className="w-5 h-5" /></>}
              </button>
            )}

            {/* Payment icons */}
            <div className="flex items-center justify-center gap-3 mt-5">
              {["Visa", "Mastercard", "Verve"].map((b) => (
                <div key={b} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-black text-slate-500">{b}</div>
              ))}
            </div>

            {/* Trust badge */}
            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Secure SSL · Encrypted Checkout</span>
            </div>
          </div>

          {/* Help card */}
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <p className="text-white/40 text-sm">Need help? <Link href="/support" className="text-indigo-400 hover:text-indigo-300 font-semibold">Contact support →</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { paymentService } from "@/lib/api/services/paymentService";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useCheckoutStore } from "@/utils/CheckoutStore";
import { useQueryClient } from "@tanstack/react-query";
import { schoolQueryKeys } from "@/lib/api/hooks/useSchool";
import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Lottie from "lottie-react";
import SuccessLottie from "@/lotties/Success.json";

type CallbackState = "VERIFYING" | "SUCCESS" | "FAILED";

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();
  const { plan, billing, role, clearCheckout } = useCheckoutStore();

  const [state, setState] = useState<CallbackState>("VERIFYING");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [countdown, setCountdown] = useState(5);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      const txRef = searchParams.get("tx_ref");
      const transactionId = searchParams.get("transaction_id");
      const flwStatus = searchParams.get("status");
      const psReference = searchParams.get("reference");

      const reference = txRef || psReference;

      if (flwStatus === "cancelled" || flwStatus === "failed") {
        setState("FAILED");
        setErrorMsg("Payment was cancelled or failed. Please try again.");
        return;
      }

      if (!reference) {
        setState("FAILED");
        setErrorMsg("No payment reference found in URL. Please contact support.");
        return;
      }

      try {
        const res = await paymentService.verify({
          reference,
          transaction_id: transactionId || undefined,
          plan: plan || "",
          billingType: (billing as "monthly" | "yearly") || "monthly",
        });

        if (res?.data) {
          setPaymentMethod(res.data.paymentMethod);
          setExpiryDate(res.data.expiryDate);
        }

        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        queryClient.invalidateQueries({ queryKey: ["school"] });
        const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId;
        if (schoolId) {
          queryClient.invalidateQueries({
            queryKey: schoolQueryKeys.billing(schoolId),
          });
        }

        updateUser({
          plan: plan || undefined,
          subscriptionStatus: "ACTIVE",
          trialUsed: user?.trialUsed || false,
        });

        setState("SUCCESS");

        setTimeout(() => {
          clearCheckout();
          const targetUrl = `/dashboard/${role?.toLowerCase() || "admin"}/billing`;
          router.push(targetUrl);
        }, 5000);
      } catch (err: unknown) {
        const error = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          "Payment verification failed. Please contact support.";
        setErrorMsg(msg);
        setState("FAILED");
      }
    };

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state === "SUCCESS") {
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state]);

  const transactionId = searchParams.get("transaction_id") || searchParams.get("tx_ref") || "PENDING";
  const today = new Date();
  const dateString = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeString = today.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 py-12">
      {state === "VERIFYING" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-12 max-w-md w-full text-center"
        >
          <div className="relative size-24 mb-8 flex items-center justify-center mx-auto">
            <div
              className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-white/5 animate-spin"
              style={{ borderTopColor: "#2563eb", borderRightColor: "#3b82f6", animationDuration: "1s" }}
            />
            <div
              className="absolute inset-2 rounded-full border-4 border-slate-100 dark:border-white/5 animate-spin"
              style={{ borderBottomColor: "#f97316", animationDuration: "1.5s", animationDirection: "reverse" }}
            />
            <ShieldCheck className="size-10 text-blue-600 animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white font-lexend mb-4">
            Verifying Payment
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">
            Securely confirming your transaction with the payment network...
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">
            Please do not close this tab or refresh the page
          </p>
        </motion.div>
      )}

      {state === "FAILED" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-12 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white font-lexend mb-3">
            Verification Failed
          </h2>
          <p className="text-slate-500 mb-8 text-sm leading-relaxed">
            {errorMsg}
          </p>
          <div className="space-y-3">
            <Link href="/checkout">
              <Button className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-600/30 transition-all">
                Try Again
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost" className="w-full py-4 rounded-2xl text-slate-500 hover:text-slate-700 font-bold">
                Back to Pricing
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {state === "SUCCESS" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Ticket Body */}
          <div className="relative bg-white dark:bg-slate-900 rounded-t-[2rem] rounded-b-[0.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-none w-full border border-b-0 border-slate-100 dark:border-slate-800">
            {/* Top Section */}
            <div className="p-10 pb-6 flex flex-col items-center text-center">
              <Lottie 
                  animationData={SuccessLottie} 
                  loop={false}
                  style={{ height: '140px', width: '140px', marginBottom: '8px' }}
              />
              <h2 className="text-2xl font-black text-slate-900 dark:text-white font-lexend mt-2">
                Thank you
              </h2>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                Your payment has been processed successfully.
              </p>
            </div>

            {/* Dotted Divider & Punch Holes */}
            <div className="relative h-8 w-full bg-transparent overflow-hidden flex items-center justify-center">
              {/* Left Hole */}
              <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 dark:bg-slate-950 rounded-full border border-r-0 border-slate-100 dark:border-slate-800 shadow-inner z-10" />
              {/* Right Hole */}
              <div className="absolute right-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 dark:bg-slate-950 rounded-full border border-l-0 border-slate-100 dark:border-slate-800 shadow-inner z-10" />
              {/* Dotted Line */}
              <div className="w-full border-t-[3px] border-dashed border-slate-200 dark:border-slate-700 mx-8 relative z-0" />
            </div>

            {/* Bottom Section */}
            <div className="p-8 pt-4 space-y-6 rounded-b-[2rem] bg-white dark:bg-slate-900 border border-t-0 border-slate-100 dark:border-slate-800 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-none relative">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ticket ID</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white max-w-[150px] truncate">{transactionId}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Paid</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{dateString} | {timeString}</p>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-6 flex relative shrink-0 items-center">
                  <div className="w-5 h-5 rounded-full bg-red-500 absolute left-0 mix-blend-multiply dark:mix-blend-screen" />
                  <div className="w-5 h-5 rounded-full bg-amber-400 absolute left-3 mix-blend-multiply dark:mix-blend-screen" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white capitalize">
                    {paymentMethod ? `${paymentMethod.replace('_', ' ')} Payment` : 'Card Payment'}
                  </p>
                  <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                    Subscription Expiry: {expiryDate ? new Date(expiryDate).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Barcode Mock */}
              <div className="pt-6 flex flex-col items-center">
                <div className="h-14 w-full flex items-center justify-between px-2 opacity-60 dark:invert">
                  {Array.from({ length: 42 }).map((_, i) => {
                    const width = [2, 4, 3, 2, 6, 2, 3, 2][i % 8];
                    return (
                      <div key={i} className={`bg-slate-900 h-full rounded-[1px]`} style={{ width: `${width}px` }} />
                    )
                  })}
                </div>
                <p className="text-[9px] text-slate-400 font-mono tracking-[0.2em] mt-3">
                  {transactionId.replace(/\D/g, '').padEnd(16, '0').slice(0,16)}
                </p>
              </div>
              
              {/* Jagged bottom edge (CSS zig-zag) */}
              <div className="absolute -bottom-2 left-0 w-full h-4 overflow-hidden">
                <div className="w-full h-8 -mt-4 bg-[radial-gradient(circle,transparent_4px,#fff_5px)] dark:bg-[radial-gradient(circle,transparent_4px,#0f172a_5px)] bg-[length:12px_12px]" />
              </div>
            </div>
            
          </div>

          <div className="mt-12 flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin text-slate-400" />
            <p className="text-sm text-slate-500 font-medium">
              Redirecting to your dashboard in <span className="font-bold text-slate-700 dark:text-slate-300">{countdown}s</span>
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

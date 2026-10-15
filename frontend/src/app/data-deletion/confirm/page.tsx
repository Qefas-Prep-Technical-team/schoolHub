"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Clock,
  Smartphone,
  MapPin,
  Mail,
  User,
  ExternalLink,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { toast } from "react-toastify";

interface DeactivationResult {
  email: string;
  role: string;
  ticketId: string;
  time: string;
  device: string;
  location: string;
}

function ConfirmDeactivationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const ticketId = searchParams.get("ticketId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DeactivationResult | null>(null);

  useEffect(() => {
    if (!token || !ticketId) {
      setError("Invalid or missing deactivation link parameters. Please submit a new deletion request.");
      setLoading(false);
      return;
    }

    let isMounted = true;

    const performConfirmation = async () => {
      try {
        const response = await apiClient.post("/auth/account/confirm-deactivation", {
          token,
          ticketId,
        });

        if (isMounted) {
          if (response.data?.success) {
            setResult(response.data.data);
            toast.success("Your account is successfully deactivated");
          } else {
            setError(response.data?.message || "Failed to confirm account deactivation.");
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorMsg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            "The deactivation link is invalid or has expired. Please submit a new deletion request.";
          setError(errorMsg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    performConfirmation();

    return () => {
      isMounted = false;
    };
  }, [token, ticketId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-rose-500 selection:text-white flex flex-col justify-between">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-rose-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-base tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Qefas Hub
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-200 dark:border-slate-800 rounded-md px-1.5 py-0.5">
                Privacy Portal
              </span>
            </div>
          </Link>
          <Link
            href="/data-deletion"
            className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Data Deletion Hub
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Confirming Account Deactivation
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Verifying your cryptographic security token and revoking all active authentication sessions...
            </p>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-8 sm:p-12 text-center shadow-xl space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Deactivation Link Invalid or Expired
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                {error}
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/data-deletion"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition shadow-md shadow-indigo-600/20"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Submit New Request
              </Link>
              <a
                href="mailto:support@qefashub.com"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs py-3 px-6 rounded-xl transition"
              >
                Contact Support
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
            {/* Success Header Badge */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full">
                  Confirmation Completed
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight pt-2">
                  Your account is successfully deactivated
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Your credentials have been neutralized, all active device sessions terminated, and your 30-day statutory recovery grace period has commenced.
                </p>
              </div>
            </div>

            {/* Audit Tracking Summary Table */}
            <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span>Audit Step 2 Telemetry</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {result?.ticketId || ticketId}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Account Email</span>
                    <span className="font-bold text-slate-900 dark:text-white break-all">
                      {result?.email || "Account email verified"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Role</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {result?.role || "Verified User"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Smartphone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Confirmation Device</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {result?.device || "Web Client"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Location</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {result?.location || "Verified Region"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 sm:col-span-2">
                  <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Effective Timestamp</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {result?.time || new Date().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statutory Compliance Advisory */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 flex items-start gap-3">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                <strong className="block font-bold">30-Day Safe Recovery Period</strong>
                Your profile is now invisible to school rosters and login attempts will be rejected. In accordance with GDPR and app store policies, all personal media and credentials will be permanently erased after 30 days unless you reach out to restore access.
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs py-3.5 px-8 rounded-xl transition shadow-lg"
              >
                Return to Login
                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs py-3.5 px-6 rounded-xl transition"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Qefas Hub. All rights reserved. Data Protection & Privacy Governance.</p>
      </footer>
    </div>
  );
}

export default function ConfirmDeactivationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading deactivation verification...</p>
          </div>
        </div>
      }
    >
      <ConfirmDeactivationContent />
    </Suspense>
  );
}

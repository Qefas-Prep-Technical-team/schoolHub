"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ArrowLeft,
  AlertTriangle,
  Lock,
  UserX,
  FileText,
  Clock,
  Info,
  Loader2,
  Mail,
  Trash2,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { apiClient } from "@/lib/api/client";
import { toast } from "react-toastify";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type RoleType = "STUDENT" | "TEACHER" | "PARENT" | "ADMIN";

function HeaderTooltip({
  content,
  size = 15,
  side = "top",
  className = "",
}: {
  content: string;
  size?: number;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="More information"
            className={`inline-flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30 shrink-0 ${className}`}
          >
            <Info size={size} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="max-w-xs sm:max-w-sm md:max-w-md p-3.5 text-xs leading-relaxed bg-slate-950 text-slate-100 dark:bg-slate-900 dark:text-slate-200 border border-slate-800 shadow-2xl rounded-xl text-left z-50 font-normal normal-case tracking-normal"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function DataDeletionContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || searchParams.get("confirmation_code") || "";
  
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"request" | "deactivate" | "retention">("request");

  // Code copy state
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);

  // Public Deletion Request Form State
  const [requestEmail, setRequestEmail] = useState("");
  const [requestRole, setRequestRole] = useState<RoleType>("STUDENT");
  const [requestReason, setRequestReason] = useState("");
  const [requestAcknowledged, setRequestAcknowledged] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestSubmittedReceipt, setRequestSubmittedReceipt] = useState<string | null>(null);

  // Authenticated Deactivation State
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivateReason, setDeactivateReason] = useState("");
  const [showDeactivateConfirmModal, setShowDeactivateConfirmModal] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivationSuccess, setDeactivationSuccess] = useState<string | null>(null);

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublicRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestEmail || !requestEmail.includes("@")) {
      toast.error("Please provide a valid email address");
      return;
    }
    if (!requestAcknowledged) {
      toast.error("You must confirm acknowledgment of the data deletion policy");
      return;
    }

    setIsSubmittingRequest(true);
    try {
      const response = await apiClient.post("/auth/account/deletion-request", {
        email: requestEmail,
        role: requestRole,
        reason: requestReason,
        confirmAcknowledgment: requestAcknowledged,
      });

      if (response.data?.success) {
        toast.success("An email has been sent to you with the deactivation instructions");
        setRequestSubmittedReceipt(requestEmail);
      } else {
        toast.error(response.data?.message || "Failed to submit request");
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "An unexpected error occurred while submitting your request.";
      toast.error(errorMsg);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleSelfDeactivate = async () => {
    if (!deactivatePassword) {
      toast.error("Password is required to confirm account deactivation");
      return;
    }

    setIsDeactivating(true);
    try {
      const response = await apiClient.post("/auth/account/deactivate", {
        password: deactivatePassword,
        reason: deactivateReason,
      });

      if (response.data?.success) {
        toast.success("Your account has been deactivated.");
        setDeactivationSuccess(response.data.data?.ticketId || "SUCCESS");
        clearAuth();
        setShowDeactivateConfirmModal(false);
      } else {
        toast.error(response.data?.message || "Failed to deactivate account");
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Password verification failed or an error occurred.";
      toast.error(errorMsg);
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-2.5 sm:px-4 lg:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">Qefas Hub</span>
              <span className="ml-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/60">
                Compliance
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/privacy-policy"
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors hidden sm:inline-flex items-center gap-1"
            >
              Privacy Policy
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              href="/login"
              className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3.5 py-2 rounded-xl transition-all inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container - Reduced left/right margins on web (max-w-5xl, px-2 to px-6) and mobile (px-2) */}
      <main className="max-w-5xl mx-auto px-2 sm:px-4 lg:px-6 py-6 sm:py-10 relative z-10 space-y-6 sm:space-y-8">
        
        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-3xl mx-auto px-1 sm:px-2">
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Data Protection & Privacy Governance
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center flex-wrap gap-2 text-center">
            <span>User Data Deletion &amp; Account Governance</span>
            <HeaderTooltip
              content="This portal provides comprehensive data erasure and account deactivation governance in accordance with GDPR Article 17 ('Right to be Forgotten'), CCPA, and Meta Platform Policies. Use this interface if you have uninstalled the application, are concluding your enrollment or employment, or wish to sever third-party social linkages. Deactivation terminates active sessions immediately, while permanent deletion purges personal credentials and media assets following a 30-day grace period."
              size={18}
            />
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            In compliance with Meta Platform Policies, GDPR, and global data privacy standards, you have the right to request permanent deletion of your personal data or deactivate your account at any time.
          </p>
        </div>

        {/* Facebook Callback Confirmation Banner (Shown if code is present) */}
        {code && (
          <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500/40 dark:border-emerald-500/30 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Request Processed
                    </span>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      Verified
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    Facebook Account Data Unlinked
                  </h2>
                </div>
              </div>

              <div className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between sm:justify-start gap-3">
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirmation Code</p>
                  <code className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 break-all">
                    {code}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Copy Code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-5 sm:pt-6 space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Your Facebook OAuth linkage has been severed from Qefas Hub. In compliance with Meta Platform Terms, your Facebook user ID, social access tokens, and cached authentication cookies have been dissociated.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 rounded-xl p-3 sm:p-3.5">
                  <p className="text-[11px] font-bold text-slate-900 dark:text-white">Social ID Dissociated</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Stored Facebook ID unlinked from user record</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 rounded-xl p-3 sm:p-3.5">
                  <p className="text-[11px] font-bold text-slate-900 dark:text-white">Active Sessions Revoked</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">OAuth tokens expired and invalidated</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 rounded-xl p-3 sm:p-3.5">
                  <p className="text-[11px] font-bold text-slate-900 dark:text-white">Compliance Logged</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Audit ticket logged under high priority</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex items-center justify-center">
          <div className="bg-slate-200/80 dark:bg-slate-900/90 p-1 sm:p-1.5 rounded-2xl flex items-center gap-1 border border-slate-300 dark:border-slate-800 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab("request")}
              className={`flex-1 sm:flex-initial px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === "request"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Mail className="w-4 h-4" />
              Public Deletion Request
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("deactivate")}
              className={`flex-1 sm:flex-initial px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === "deactivate"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <UserX className="w-4 h-4" />
              Self-Service Deactivation
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("retention")}
              className={`flex-1 sm:flex-initial px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === "retention"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Clock className="w-4 h-4" />
              Retention Policy
            </button>
          </div>
        </div>

        {/* TAB 1: Public Deletion Request Form */}
        {activeTab === "request" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 shadow-xl space-y-5 sm:space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
                <span>Submit a Data Deletion Request</span>
                <HeaderTooltip
                  content="Submitting this form initiates an auditable data deletion request that is logged directly into the compliance system. The platform verifies your account email, records client telemetry for verification, and automatically emails you secure deactivation instructions with a confirmation token. Use this method if you cannot sign into your account or have uninstalled the mobile app. Once confirmed, all active device sessions and authentication refresh tokens are terminated within 24 hours."
                  size={16}
                />
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                If you have uninstalled the application, cannot access your account, or wish to exercise your statutory right to be forgotten under GDPR/CCPA, please submit your request below.
              </p>
            </div>

            {requestSubmittedReceipt ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/60 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Deletion Request Queued</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  We have received your deletion request for <strong className="text-slate-900 dark:text-white">{requestSubmittedReceipt}</strong>. An email has been sent to you with the deactivation instructions and a secure button to finalize deactivation.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRequestSubmittedReceipt(null);
                      setRequestEmail("");
                      setRequestReason("");
                      setRequestAcknowledged(false);
                    }}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Submit another request
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePublicRequestSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Account Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={requestEmail}
                      onChange={(e) => setRequestEmail(e.target.value)}
                      placeholder="e.g. user@schoolhub.io"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Ecosystem Role <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={requestRole}
                      onChange={(e) => setRequestRole(e.target.value as RoleType)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="STUDENT">Student</option>
                      <option value="TEACHER">Teacher / Staff</option>
                      <option value="PARENT">Parent / Guardian</option>
                      <option value="ADMIN">School Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Reason for Request <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    placeholder="Provide details or reference for your data deletion request..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                {/* Mandatory Acknowledgment */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                  <input
                    type="checkbox"
                    id="ack-policy"
                    checked={requestAcknowledged}
                    onChange={(e) => setRequestAcknowledged(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="ack-policy" className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer select-none">
                    <strong className="text-slate-900 dark:text-white block font-bold mb-0.5">
                      Statutory Policy & Deletion Acknowledgment
                    </strong>
                    I acknowledge that personal account data, authentication credentials, and uploaded files will be permanently purged after a 30-day grace period. Regulated educational archives (grades, academic transcripts) will be preserved in compliance with school institutional laws.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingRequest}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 inline-flex items-center justify-center gap-2"
                >
                  {isSubmittingRequest ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting Compliance Request...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Submit Permanent Deletion Request
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: Authenticated Self-Service Deactivation */}
        {activeTab === "deactivate" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 shadow-xl space-y-5 sm:space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <UserX className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />
                <span>Self-Service Account Deactivation</span>
                <HeaderTooltip
                  content="Direct self-service deactivation allows authenticated users to immediately revoke account access with password verification. Executing deactivation terminates all active browser sessions and mobile refresh tokens instantly, logs you out across all platforms, and flags your profile as inactive across school rosters. Use this when you require immediate credential revocation without waiting for email turnaround. School administrators retain the ability to reactivate verified accounts upon institutional request."
                  size={16}
                />
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Deactivate your personal account credentials immediately. All active sessions across all devices will be revoked instantly.
              </p>
            </div>

            {/* Prominent Settings Guidance Notice */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Self-Service Deactivation is located in your Settings
                </h4>
                <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 max-w-xl leading-relaxed">
                  The account deactivation button is available in your platform <strong>Settings</strong> page under the <strong>Security</strong> tab (<code>Settings &rarr; Security &rarr; Deactivate Account</code>). You can navigate to your settings to deactivate your account yourself with your password.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isAuthenticated && user ? (
                  <Link
                    href={`/dashboard/${(user.userType || "student").toLowerCase()}/settings`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20 whitespace-nowrap"
                  >
                    Open Your Settings
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    <Link
                      href="/dashboard/student/settings"
                      className="text-[11px] font-bold bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition"
                    >
                      Student Settings
                    </Link>
                    <Link
                      href="/dashboard/teacher/settings"
                      className="text-[11px] font-bold bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition"
                    >
                      Teacher Settings
                    </Link>
                    <Link
                      href="/dashboard/admin/settings"
                      className="text-[11px] font-bold bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition"
                    >
                      Admin Settings
                    </Link>
                    <Link
                      href="/dashboard/parent/settings"
                      className="text-[11px] font-bold bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition"
                    >
                      Parent Settings
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {deactivationSuccess ? (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/60 rounded-full flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Account Deactivated</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  Your account has been deactivated and all active device sessions have been severed. Reference ticket:{" "}
                  <code className="font-mono font-bold text-rose-600 dark:text-rose-400">{deactivationSuccess}</code>.
                </p>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Return to Login
                  </Link>
                </div>
              </div>
            ) : isAuthenticated && user ? (
              <div className="space-y-6">
                {/* User Snapshot Card */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                      {user.name ? user.name[0]?.toUpperCase() : "U"}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{user.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-lg">
                      {user.userType}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-5 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed space-y-1">
                    <p className="font-bold">What happens when you deactivate?</p>
                    <ul className="list-disc pl-4 space-y-1 text-amber-700 dark:text-amber-400">
                      <li>All session cookies and mobile device tokens are revoked immediately.</li>
                      <li>You will be signed out from all desktop and mobile applications.</li>
                      <li>Your profile is hidden from active student and staff rosters.</li>
                      <li>To restore your account later, you must contact your school administrator.</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Confirm Account Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={deactivatePassword}
                        onChange={(e) => setDeactivatePassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Reason for Leaving <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={deactivateReason}
                      onChange={(e) => setDeactivateReason(e.target.value)}
                      placeholder="Tell us why you are deactivating your account..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!deactivatePassword) {
                        toast.error("Please enter your password to confirm");
                        return;
                      }
                      setShowDeactivateConfirmModal(true);
                    }}
                    className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-rose-600/20 inline-flex items-center justify-center gap-2"
                  >
                    <UserX className="w-4 h-4" />
                    Deactivate Account
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Authentication Required for Direct Deactivation</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  You are currently signed out. To deactivate your account with real-time password verification, please sign in. If you no longer have access to your credentials, use the{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("request")}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Public Deletion Request form
                  </button>
                  .
                </p>
                <div>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-md shadow-indigo-600/20"
                  >
                    Sign In to Deactivate
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Data Retention & Purge Schedule */}
        {activeTab === "retention" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 shadow-xl space-y-5 sm:space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
                <span>Data Retention &amp; Purge Schedule</span>
                <HeaderTooltip
                  content="This schedule outlines the legal and technical retention windows across all user data categories. Ephemeral authentication tokens and OAuth bindings are shredded immediately upon deactivation. User-generated media and uploaded files are irreversibly deleted after the 30-day recovery grace period. Certain academic transcripts, attendance logs, and formal grades are retained under school institutional custody in an anonymized state to comply with statutory national educational record-keeping requirements."
                  size={16}
                />
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Overview of how different classes of data are handled upon deactivation or statutory deletion requests.
              </p>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                    <th className="py-3.5 px-4">Data Category</th>
                    <th className="py-3.5 px-4">Retention Window</th>
                    <th className="py-3.5 px-4">Purge Methodology</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  <tr>
                    <td className="py-4 px-4 text-slate-900 dark:text-white font-bold">
                      Social Linkages (Google, Facebook)
                    </td>
                    <td className="py-4 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                      Immediate
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                      Stored provider IDs unlinked instantly; session cache cleared within 24 hours.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-slate-900 dark:text-white font-bold">
                      Authentication Credentials & Tokens
                    </td>
                    <td className="py-4 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                      Immediate
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                      All refresh tokens and device sessions revoked across mobile and desktop apps.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-slate-900 dark:text-white font-bold">
                      Uploaded Files & Media
                    </td>
                    <td className="py-4 px-4 text-amber-600 dark:text-amber-400 font-bold">
                      30-Day Grace Period
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                      Avatars and user-uploaded media files permanently shredded from cloud storage.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-slate-900 dark:text-white font-bold">
                      Academic Transcripts & Grades
                    </td>
                    <td className="py-4 px-4 text-indigo-600 dark:text-indigo-400 font-bold">
                      Statutory Education Period
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                      Anonymized and retained under school custody to satisfy mandatory educational laws.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                If you have questions regarding school-specific retention schedules or need assistance with data export under GDPR Article 20, contact our compliance officer at{" "}
                <a href="mailto:privacy@schoolhub.io" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                  privacy@schoolhub.io
                </a>
                .
              </p>
            </div>
          </div>
        )}

        {/* Global Footer Help Links */}
        <div className="border-t border-slate-200 dark:border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} Qefas Hub. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy-policy" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Account Login
            </Link>
          </div>
        </div>
      </main>

      {/* Confirmation Modal for Self-Service Deactivation */}
      {showDeactivateConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Confirm Account Deactivation</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Are you sure you want to proceed? This will immediately revoke your active sessions and sign you out across all devices.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeactivating}
                onClick={() => setShowDeactivateConfirmModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs py-3 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeactivating}
                onClick={handleSelfDeactivate}
                className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-rose-600/20 inline-flex items-center justify-center gap-2"
              >
                {isDeactivating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deactivating...
                  </>
                ) : (
                  "Yes, Deactivate Now"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DataDeletionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DataDeletionContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useCreateLinkRequest } from "@/lib/api/hooks/useLinks";
import { Loader2, CheckCircle2, AlertCircle, School, LogIn, GraduationCap, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AxiosError } from "axios";

export default function JoinSchoolPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAuthStore();
  const { mutate: createLink, isPending, isSuccess, error } = useCreateLinkRequest();
  // Track whether we started the join flow so we keep showing loader even before isPending kicks in
  const [hasStarted, setHasStarted] = useState(false);
  // Track already-connected / pending errors for smart UI
  const [statusState, setStatusState] = useState<"idle" | "connecting" | "success" | "already_connected" | "pending_request" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Preserve the redirect so login/signup flows can return here
  useEffect(() => {
    if (typeof window !== "undefined" && code) {
      sessionStorage.setItem("pendingJoinRedirect", `/join/school/${code}`);
    }
  }, [code]);

  // Auto-trigger the link request for authenticated users
  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated || !user || hasStarted) return;
    if (!code) {
      console.error("JoinSchoolPage: Missing school code");
      return;
    }

    // Only students and teachers can link to a school via this page
    if (user.userType !== "STUDENT" && user.userType !== "TEACHER") return;

    setHasStarted(true);
    setStatusState("connecting");

    const linkType: "SCHOOL_STUDENT" | "SCHOOL_TEACHER" =
      user.userType === "TEACHER" ? "SCHOOL_TEACHER" : "SCHOOL_STUDENT";

    createLink(
      {
        targetCode: code,
        linkType,
        note: `Requested to join school via invitation link`,
      },
      {
        onSuccess: () => {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("pendingJoinRedirect");
          }
          setStatusState("success");
          setTimeout(() => {
            if (user.userType === "TEACHER") {
              router.push("/dashboard/teacher");
            } else {
              router.push("/dashboard/student");
            }
          }, 2500);
        },
        onError: (err) => {
          const msg =
            (err as AxiosError<{ message?: string }>)?.response?.data?.message || "";
          const lower = msg.toLowerCase();
          if (lower.includes("active relationship") || lower.includes("already exists")) {
            setStatusState("already_connected");
          } else if (lower.includes("pending request")) {
            setStatusState("pending_request");
          } else {
            setStatusState("error");
            setErrorMessage(msg);
          }
          console.error("JoinSchoolPage: Join request error", err);
        },
      }
    );
  }, [isInitialized, isAuthenticated, code, user, createLink, hasStarted, router]);

  const roleDashboard =
    user?.userType === "TEACHER"
      ? "/dashboard/teacher"
      : user?.userType === "STUDENT"
      ? "/dashboard/student"
      : user?.userType === "PARENT"
      ? "/dashboard/parent"
      : "/dashboard/admin";

  // ─── Loading / connecting (any auth state) ───────────────────────────────────
  if (!isInitialized || (isAuthenticated && (isPending || (hasStarted && statusState === "connecting")))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Connecting to School...</h1>
        <p className="text-slate-500 dark:text-gray-400">Please wait while we process your request.</p>
      </div>
    );
  }

  // ─── Success ─────────────────────────────────────────────────────────────────
  if (statusState === "success" || (isAuthenticated && isSuccess)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Request Sent!</h1>
        <p className="text-lg text-slate-600 dark:text-gray-300 max-w-md mb-8">
          Your request to join school <strong className="font-mono text-blue-600 dark:text-blue-400">{code}</strong> has been sent to the administrator.
          You will be redirected to your dashboard shortly.
        </p>
        <Button
          onClick={() => router.push(roleDashboard)}
          className="rounded-xl h-12 px-8 font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 text-white shadow-lg shadow-blue-600/25 dark:shadow-blue-950/60 cursor-pointer"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // ─── Already connected ────────────────────────────────────────────────────────
  if (statusState === "already_connected") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Already Connected!</h1>
        <p className="text-lg text-slate-600 dark:text-gray-300 max-w-md mb-8">
          Your account is already actively connected with this school.
        </p>
        <Button
          onClick={() => router.push(roleDashboard)}
          className="rounded-xl h-12 px-8 font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 text-white shadow-lg shadow-blue-600/25 dark:shadow-blue-950/60 cursor-pointer"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // ─── Pending request ──────────────────────────────────────────────────────────
  if (statusState === "pending_request") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Request Pending</h1>
        <p className="text-lg text-slate-600 dark:text-gray-300 max-w-md mb-8">
          You already have a pending connection request for this school awaiting administrator approval.
        </p>
        <Button
          onClick={() => router.push(roleDashboard)}
          className="rounded-xl h-12 px-8 font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 text-white shadow-lg shadow-blue-600/25 dark:shadow-blue-950/60 cursor-pointer"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // ─── Error (from state machine) ───────────────────────────────────────────────
  if (statusState === "error" || (isAuthenticated && error)) {
    const errMsg =
      errorMessage ||
      (error as AxiosError<{ message?: string }>)?.response?.data?.message ||
      "Failed to join school. The code might be invalid or your account may not be eligible to link.";
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Unable to Complete Request</h1>
        <p className="text-lg text-slate-600 dark:text-gray-300 max-w-md mb-8">{errMsg}</p>
        <div className="flex gap-4">
          <Button
            onClick={() => router.push(roleDashboard)}
            variant="outline"
            className="rounded-xl h-12 px-8 font-bold text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={() => { setStatusState("idle"); setHasStarted(false); }}
            className="rounded-xl h-12 px-8 font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 text-white shadow-lg shadow-blue-600/25 dark:shadow-blue-950/60 cursor-pointer"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // ─── Unauthenticated guest card ───────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100 dark:border-blue-900/50">
            <School size={40} />
          </div>

          <span className="inline-block px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider rounded-full mb-3 border border-blue-200/60 dark:border-blue-800/50">
            School Invitation
          </span>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            Join School Community
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-gray-400 mb-6">
            School Code: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{code}</span>
          </p>

          <div className="space-y-3 text-left mb-6">
            <Button
              onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/join/school/${code}`)}`)}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-blue-600/25 dark:shadow-indigo-950/60 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all border border-blue-400/20 dark:border-indigo-500/30 cursor-pointer"
            >
              <LogIn size={20} className="text-white shrink-0" />
              <span>I Have an Account • Sign In</span>
            </Button>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <span className="relative bg-white dark:bg-slate-900 px-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                Or Register New Account
              </span>
            </div>

            <Button
              onClick={() => router.push(`/signup/student?schoolCode=${code}&redirect=${encodeURIComponent(`/join/school/${code}`)}`)}
              variant="outline"
              className="w-full h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-800 font-bold flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-300 dark:hover:border-slate-700 transition-all cursor-pointer"
            >
              <GraduationCap size={20} className="text-blue-500 dark:text-blue-400 shrink-0" />
              <span>Register as Student</span>
            </Button>

            <Button
              onClick={() => router.push(`/signup/teacher?schoolCode=${code}&redirect=${encodeURIComponent(`/join/school/${code}`)}`)}
              variant="outline"
              className="w-full h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-800 font-bold flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-300 dark:hover:border-slate-700 transition-all cursor-pointer"
            >
              <Briefcase size={20} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span>Register as Teacher</span>
            </Button>
          </div>

          <p className="text-[11px] text-slate-400 text-center font-medium">
            By connecting, your account will request association with this school.
          </p>
        </div>
      </div>
    );
  }

  // ─── Fallback for authenticated users who are not student/teacher (admin, parent) ─
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
      <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
        <School className="w-10 h-10 text-blue-600 dark:text-blue-400" />
      </div>
      <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-2">School Invitation</h1>
      <p className="text-lg text-slate-600 dark:text-gray-300 max-w-md mb-8">
        This invitation link is designed for student and teacher accounts. Your current account type (<strong>{user?.userType}</strong>) cannot link to a school via this URL.
      </p>
      <Button
        onClick={() => router.push(roleDashboard)}
        className="rounded-xl h-12 px-8 font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 text-white shadow-lg cursor-pointer"
      >
        Go to Dashboard
      </Button>
    </div>
  );
}

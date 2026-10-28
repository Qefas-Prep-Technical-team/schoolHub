"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useCreateLinkRequest } from "@/lib/api/hooks/useLinks";
import { Loader2, CheckCircle2, AlertCircle, School, LogIn, UserPlus, GraduationCap, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AxiosError } from "axios";

export default function JoinSchoolPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAuthStore();
  const { mutate: createLink, isPending, isSuccess, error } = useCreateLinkRequest();
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;

    if (isAuthenticated && user && !hasStarted) {
      if (!code) {
        console.error("JoinSchoolPage: Missing school code");
        return;
      }

      setHasStarted(true);

      // Determine link type based on user role
      let linkType: "SCHOOL_STUDENT" | "SCHOOL_TEACHER" = "SCHOOL_STUDENT";
      if (user.userType === "TEACHER") linkType = "SCHOOL_TEACHER";

      createLink(
        {
          targetCode: code,
          linkType,
          note: `Requested to join school via invitation link`,
        },
        {
          onSuccess: () => {
            setTimeout(() => {
              router.push("/dashboard");
            }, 3000);
          },
          onError: (err) => {
            console.error("JoinSchoolPage: Join request error", err);
          },
        }
      );
    }
  }, [isInitialized, isAuthenticated, code, user, createLink, hasStarted, router]);

  if (!isInitialized || (isAuthenticated && isPending)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Connecting to School...</h1>
        <p className="text-slate-500 dark:text-gray-400">Please wait while we process your request.</p>
      </div>
    );
  }

  // Handle Unauthenticated Visitors
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <School size={40} />
          </div>

          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-black uppercase tracking-wider rounded-full mb-3">
            School Invitation
          </span>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            Join School Community
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-gray-400 mb-6">
            School Code: <span className="font-mono font-bold text-primary">{code}</span>
          </p>

          <div className="space-y-3 text-left mb-6">
            <Button
              onClick={() => router.push(`/login?redirect=/join/school/${code}`)}
              className="w-full h-14 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <LogIn size={20} />
              I Have an Account • Sign In
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
              onClick={() => router.push(`/signup/student?schoolCode=${code}`)}
              variant="outline"
              className="w-full h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-800 font-bold flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <GraduationCap size={20} className="text-blue-500" />
              Register as Student
            </Button>

            <Button
              onClick={() => router.push(`/signup/teacher?schoolCode=${code}`)}
              variant="outline"
              className="w-full h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-800 font-bold flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Briefcase size={20} className="text-emerald-500" />
              Register as Teacher
            </Button>
          </div>

          <p className="text-[11px] text-slate-400 text-center font-medium">
            By connecting, your account will request association with this school.
          </p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Request Sent!</h1>
        <p className="text-lg text-slate-600 dark:text-gray-300 max-w-md mb-8">
          Your request to join school <strong className="font-mono text-primary">{code}</strong> has been sent to the administrator. 
          You will be redirected to your dashboard shortly.
        </p>
        <Button onClick={() => router.push("/dashboard")} className="rounded-xl h-12 px-8 font-bold">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  if (error) {
    const errorMsg = (error as AxiosError<{message?: string}>)?.response?.data?.message || "";
    const isAlreadyConnected =
      errorMsg.toLowerCase().includes("active relationship") ||
      errorMsg.toLowerCase().includes("already exists");
    const isPendingRequest =
      errorMsg.toLowerCase().includes("pending request");

    if (isAlreadyConnected) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Already Connected!</h1>
          <p className="text-lg text-slate-600 dark:text-gray-300 max-w-md mb-8">
            Your account is already actively connected with this school.
          </p>
          <Button onClick={() => router.push("/dashboard")} className="rounded-xl h-12 px-8 font-bold">
            Go to Dashboard
          </Button>
        </div>
      );
    }

    if (isPendingRequest) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Request Pending</h1>
          <p className="text-lg text-slate-600 dark:text-gray-300 max-w-md mb-8">
            You already have a pending connection request for this school awaiting administrator approval.
          </p>
          <Button onClick={() => router.push("/dashboard")} className="rounded-xl h-12 px-8 font-bold">
            Go to Dashboard
          </Button>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Unable to Complete Request</h1>
        <p className="text-lg text-slate-600 dark:text-gray-300 max-w-md mb-8">
          {errorMsg || "Failed to join school. The code might be invalid or your account may not be eligible to link."}
        </p>
        <div className="flex gap-4">
          <Button onClick={() => router.push("/dashboard")} variant="outline" className="rounded-xl h-12 px-8 font-bold">
            Back to Dashboard
          </Button>
          <Button onClick={() => window.location.reload()} className="rounded-xl h-12 px-8 font-bold">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

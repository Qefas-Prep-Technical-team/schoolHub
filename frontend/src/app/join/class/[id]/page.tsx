"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { usePreviewClassById, useRequestToJoinClass } from "@/lib/api/hooks/useClasses";
import { Loader2, CheckCircle2, AlertCircle, BookOpen, LogIn, GraduationCap, School, User } from "lucide-react";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";

export default function JoinClassPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAuthStore();
  const { data: classData, isLoading: isClassLoading, error: classError } = usePreviewClassById(id);
  const { mutate: joinClass, isPending: isJoining, isSuccess, error: joinError } = useRequestToJoinClass();
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!isInitialized || isClassLoading || !classData) return;

    if (isAuthenticated && user && !hasStarted) {
      if (user.userType !== "STUDENT") {
        return;
      }

      if (!classData.classCode && !id) {
        console.error("JoinClassPage: Missing classCode in classData", classData);
        return;
      }

      setHasStarted(true);

      joinClass(
        {
          classCode: classData.classCode || id,
          note: `Requested to join class ${classData.name} via invitation link`,
        },
        {
          onSuccess: () => {
            setTimeout(() => {
              router.push("/dashboard");
            }, 3000);
          },
          onError: (err) => {
            console.error("JoinClassPage: Join request error", err);
          },
        }
      );
    }
  }, [isInitialized, isAuthenticated, classData, isClassLoading, user, joinClass, hasStarted, router, id]);

  if (!isInitialized || isClassLoading || (isAuthenticated && user?.userType === "STUDENT" && isJoining)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          {isClassLoading ? "Fetching Class Details..." : "Joining Class..."}
        </h1>
        <p className="text-slate-500 dark:text-gray-400">Please wait while we process your request.</p>
      </div>
    );
  }

  // Handle Unauthenticated Visitors
  if (!isAuthenticated && classData) {
    const schoolCode = classData.school?.schoolCode || "";
    const classCode = classData.classCode || "";

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <BookOpen size={40} />
          </div>

          <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider rounded-full mb-3">
            Class Invitation
          </span>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
            {classData.name}
          </h1>
          {classData.section && (
            <p className="text-sm font-bold text-slate-400 mb-4">Section: {classData.section}</p>
          )}

          {/* Class details badge card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 text-left space-y-2.5 mb-6 border border-slate-100 dark:border-slate-800">
            {classData.school && (
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <School size={16} className="text-primary shrink-0" />
                <span className="font-medium truncate">School: <strong className="font-bold">{classData.school.name}</strong></span>
              </div>
            )}
            {classData.teacher && (
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <User size={16} className="text-emerald-500 shrink-0" />
                <span className="font-medium truncate">Teacher: <strong className="font-bold">{classData.teacher.name}</strong></span>
              </div>
            )}
            {classData.subjects && classData.subjects.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <BookOpen size={16} className="text-purple-500 shrink-0" />
                <span className="font-medium truncate">
                  Subjects: <strong className="font-bold">{classData.subjects.map((s: { name: string }) => s.name).join(", ")}</strong>
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3 text-left mb-6">
            <Button
              onClick={() => router.push(`/login?redirect=/join/class/${id}`)}
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
                New Student?
              </span>
            </div>

            <Button
              onClick={() => router.push(`/signup/student?schoolCode=${schoolCode}&classCode=${classCode}`)}
              variant="outline"
              className="w-full h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-800 font-bold flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <GraduationCap size={20} className="text-blue-500" />
              Register as Student to Join
            </Button>
          </div>

          <p className="text-[11px] text-slate-400 text-center font-medium">
            Once registered or logged in, you will be enrolled into {classData.name}.
          </p>
        </div>
      </div>
    );
  }

  // Handle Logged-in Non-Student (e.g. Teacher/Admin)
  if (isAuthenticated && user?.userType !== "STUDENT") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
          <BookOpen className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Class Invitation</h1>
        <p className="text-lg text-slate-600 dark:text-gray-300 max-w-md mb-8">
          You are currently logged in as a <strong>{user?.userType}</strong>. Direct class enrollment via invitation links is designed for student accounts.
        </p>
        <Button onClick={() => router.push("/dashboard")} className="rounded-xl h-12 px-8 font-bold">
          Go to Dashboard
        </Button>
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
          Your request to join <strong>{classData?.name}</strong> has been sent successfully. 
          You will be redirected to your dashboard shortly.
        </p>
        <Button onClick={() => router.push("/dashboard")} className="rounded-xl h-12 px-8 font-bold">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  if (classError || joinError) {
    const errorMsg =
      (joinError as AxiosError<{ message?: string }>)?.response?.data?.message ||
      (classError as AxiosError<{ message?: string }>)?.response?.data?.message ||
      "";

    const isAlreadyEnrolled =
      errorMsg.toLowerCase().includes("already enrolled") ||
      errorMsg.toLowerCase().includes("already active");
    const isPendingRequest =
      errorMsg.toLowerCase().includes("pending join request") ||
      errorMsg.toLowerCase().includes("pending request");

    if (isAlreadyEnrolled) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Already Enrolled!</h1>
          <p className="text-lg text-slate-600 dark:text-gray-300 max-w-md mb-8">
            You are already an active enrolled student in <strong>{classData?.name || "this class"}</strong>.
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
            You already have a pending join request for <strong>{classData?.name || "this class"}</strong> awaiting teacher or school approval.
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
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Unable to Join Class</h1>
        <p className="text-lg text-slate-600 dark:text-gray-300 max-w-md mb-8">
          {errorMsg || "Failed to process join request. The class might not exist or may not be accepting join requests."}
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

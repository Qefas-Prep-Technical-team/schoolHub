"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { usePreviewClassById } from "@/lib/api/hooks/useClasses";
import { useCreateLinkRequest } from "@/lib/api/hooks/useLinks";
import { linkService } from "@/lib/api/services/linkService";
import { classService } from "@/lib/api/services/classService";
import { Loader2, CheckCircle2, AlertCircle, BookOpen, LogIn, GraduationCap, School, User } from "lucide-react";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import GoogleLoginButton from "@/app/(auth)/login/components/GoogleLoginButton";

type JoinStatus =
  | "idle"
  | "connecting"
  | "success"
  | "already_enrolled"
  | "pending_request"
  | "wrong_school"
  | "error";

export default function JoinClassPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAuthStore();
  const { data: classData, isLoading: isClassLoading, error: classError } = usePreviewClassById(id);
  const [hasStarted, setHasStarted] = useState(false);
  const [status, setStatus] = useState<JoinStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const isRunning = useRef(false);

  // Preserve join URL for login/signup redirect flow
  useEffect(() => {
    if (typeof window !== "undefined" && id) {
      sessionStorage.setItem("pendingJoinRedirect", `/join/class/${id}`);
    }
  }, [id]);

  // Auto-trigger join for authenticated students
  useEffect(() => {
    if (!isInitialized || isClassLoading || !classData) return;
    if (!isAuthenticated || !user) return;
    if (hasStarted || isRunning.current) return;
    // Only STUDENT accounts can auto-join a class via link
    if (user.userType !== "STUDENT") return;

    isRunning.current = true;
    setHasStarted(true);
    setStatus("connecting");

    const classCode = classData.classCode || id;
    const schoolCode = classData.school?.schoolCode;
    const schoolId = classData.schoolId || classData.school?.id;

    // Check whether student is already linked to this school
    // user.schools is an array of { schoolId, name } from the auth store
    const isLinkedToSchool =
      Array.isArray(user.schools) &&
      user.schools.some(
        (s) =>
          (schoolId && s.schoolId === schoolId) ||
          (schoolCode && s.schoolId)
      );

    const run = async () => {
      try {
        // Fire school link request first if not yet linked
        if (schoolCode && !isLinkedToSchool) {
          try {
            await linkService.createLinkRequest({
              targetCode: schoolCode,
              linkType: "SCHOOL_STUDENT",
              note: `Requested to join school via class invitation link`,
            });
            toast.info("School connection request also sent — awaiting admin approval.");
          } catch (schoolErr: unknown) {
            const schoolErrMsg =
              (schoolErr as AxiosError<{ message?: string }>)?.response?.data?.message || "";
            const lower = schoolErrMsg.toLowerCase();
            // Ignore "already connected" / "pending" — not blocking
            if (
              !lower.includes("already exists") &&
              !lower.includes("active relationship") &&
              !lower.includes("pending request")
            ) {
              console.warn("JoinClassPage: school link request failed (non-fatal):", schoolErrMsg);
            }
          }
        }

        // Now fire the class join request
        await classService.requestToJoinClass({
          classCode,
          note: `Requested to join class ${classData.name} via invitation link`,
        });

        if (typeof window !== "undefined") {
          sessionStorage.removeItem("pendingJoinRedirect");
        }

        setStatus("success");
        setTimeout(() => router.push("/dashboard/student"), 2500);
      } catch (err: unknown) {
        const msg =
          (err as AxiosError<{ message?: string }>)?.response?.data?.message || "";
        const lower = msg.toLowerCase();
        if (lower.includes("already enrolled") || lower.includes("already active")) {
          setStatus("already_enrolled");
        } else if (lower.includes("pending join request") || lower.includes("pending request")) {
          setStatus("pending_request");
        } else if (lower.includes("another school")) {
          setStatus("wrong_school");
          setErrorMsg(msg);
        } else {
          setStatus("error");
          setErrorMsg(msg || "Failed to join class. The class may not exist or is not accepting requests.");
        }
        console.error("JoinClassPage: join error", err);
      }
    };

    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, isAuthenticated, classData, isClassLoading, user, hasStarted, router, id]);

  // ─── Loading ──────────────────────────────────────────────────────────────────
  if (!isInitialized || isClassLoading || (isAuthenticated && user?.userType === "STUDENT" && status === "connecting")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 animate-spin mb-4" />
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          {isClassLoading ? "Fetching Class Details..." : "Joining Class..."}
        </h1>
        <p className="text-slate-500 dark:text-gray-400">Please wait while we process your request.</p>
      </div>
    );
  }

  // ─── Success ──────────────────────────────────────────────────────────────────
  if (status === "success") {
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
        <Button
          onClick={() => router.push("/dashboard/student")}
          className="rounded-xl h-12 px-8 font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-600 text-white shadow-lg shadow-emerald-600/25 dark:shadow-emerald-950/60 cursor-pointer"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // ─── Already enrolled ─────────────────────────────────────────────────────────
  if (status === "already_enrolled") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Already Enrolled!</h1>
        <p className="text-lg text-slate-600 dark:text-gray-300 max-w-md mb-8">
          You are already an active enrolled student in <strong>{classData?.name || "this class"}</strong>.
        </p>
        <Button
          onClick={() => router.push("/dashboard/student")}
          className="rounded-xl h-12 px-8 font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-600 text-white shadow-lg shadow-emerald-600/25 dark:shadow-emerald-950/60 cursor-pointer"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // ─── Pending request ──────────────────────────────────────────────────────────
  if (status === "pending_request") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Request Pending</h1>
        <p className="text-lg text-slate-600 dark:text-gray-300 max-w-md mb-8">
          You already have a pending join request for <strong>{classData?.name || "this class"}</strong> awaiting teacher or school approval.
        </p>
        <Button
          onClick={() => router.push("/dashboard/student")}
          className="rounded-xl h-12 px-8 font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-600 text-white shadow-lg shadow-emerald-600/25 dark:shadow-emerald-950/60 cursor-pointer"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // ─── Error (wrong school / generic) ──────────────────────────────────────────
  if (status === "error" || status === "wrong_school") {
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
          <Button
            onClick={() => router.push("/dashboard/student")}
            variant="outline"
            className="rounded-xl h-12 px-8 font-bold text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={() => { setStatus("idle"); setHasStarted(false); isRunning.current = false; }}
            className="rounded-xl h-12 px-8 font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-600 text-white shadow-lg shadow-emerald-600/25 dark:shadow-emerald-950/60 cursor-pointer"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // ─── Non-student authenticated user ──────────────────────────────────────────
  if (isAuthenticated && user?.userType !== "STUDENT") {
    const nonStudentDash =
      user?.userType === "TEACHER"
        ? "/dashboard/teacher"
        : user?.userType === "ADMIN"
        ? "/dashboard/admin"
        : "/dashboard/parent";
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
          <BookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Class Invitation</h1>
        <p className="text-lg text-slate-600 dark:text-gray-300 max-w-md mb-8">
          You are currently logged in as a <strong>{user?.userType}</strong>. Direct class enrollment via invitation links is designed for student accounts.
        </p>
        <Button
          onClick={() => router.push(nonStudentDash)}
          className="rounded-xl h-12 px-8 font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg cursor-pointer"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // ─── Class loading error ──────────────────────────────────────────────────────
  if (classError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Class Not Found</h1>
        <p className="text-lg text-slate-600 dark:text-gray-300 max-w-md mb-8">
          {(classError as AxiosError<{ message?: string }>)?.response?.data?.message ||
            "This class link is invalid or the class no longer exists."}
        </p>
        <Button
          onClick={() => router.push("/")}
          className="rounded-xl h-12 px-8 font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg cursor-pointer"
        >
          Go to Home
        </Button>
      </div>
    );
  }

  // ─── Unauthenticated guest with class preview ─────────────────────────────────
  if (!isAuthenticated && classData) {
    const schoolCode = classData.school?.schoolCode || "";
    const classCode = classData.classCode || "";

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100 dark:border-emerald-900/50">
            <BookOpen size={40} />
          </div>

          <span className="inline-block px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider rounded-full mb-3 border border-emerald-200/60 dark:border-emerald-800/50">
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
                <School size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
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
            {/* Google Sign-In — fastest path for new students */}
            <GoogleLoginButton
              userType="student"
              mode="signup"
              pill={false}
              showDivider={false}
              className="mb-1"
            />

            <Button
              onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/join/class/${id}`)}&role=student`)}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-600 text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/25 dark:shadow-emerald-950/60 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all border border-emerald-500/20 dark:border-emerald-500/30 cursor-pointer"
            >
              <LogIn size={20} className="text-white shrink-0" />
              <span>I Have an Account • Sign In</span>
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
              onClick={() => router.push(`/signup/student?schoolCode=${schoolCode}&classCode=${classCode}&redirect=${encodeURIComponent(`/join/class/${id}`)}`)}               
              variant="outline"
              className="w-full h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-800 font-bold flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-300 dark:hover:border-slate-700 transition-all cursor-pointer"
            >
              <GraduationCap size={20} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
              Register with Email
            </Button>
          </div>

          <p className="text-[11px] text-slate-400 text-center font-medium">
            Once registered or logged in, you will be enrolled into {classData.name}.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

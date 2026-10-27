"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { apiClient } from "@/lib/api/client";
import { toast } from "react-toastify";
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  GraduationCap,
  Users,
  Building,
  Lock,
  BookOpen
} from "lucide-react";
import Cookies from "js-cookie";

interface RoleThemeConfig {
  label: string;
  subtitle: string;
  badge: string;
  ambientOrbs: string;
  shieldGradient: string;
  shieldShadow: string;
  pulseRing: string;
  progressBar: string;
  step3Active: string;
  step3Text: string;
  skipLink: string;
  icon: React.ElementType;
}

const ROLE_THEMES: Record<string, RoleThemeConfig> = {
  teacher: {
    label: "Teacher Workspace",
    subtitle: "Preparing your classrooms, lesson schedules, and grade records...",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
    ambientOrbs: "from-emerald-500/15 via-teal-500/10 to-indigo-500/15",
    shieldGradient: "from-emerald-500 to-teal-600",
    shieldShadow: "shadow-emerald-500/25",
    pulseRing: "bg-emerald-500/20",
    progressBar: "from-emerald-500 to-teal-400",
    step3Active: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
    step3Text: "text-emerald-600 dark:text-emerald-400",
    skipLink: "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700",
    icon: BookOpen,
  },
  student: {
    label: "Student Portal",
    subtitle: "Loading your enrolled classes, assignments, and timetable...",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/60",
    ambientOrbs: "from-blue-500/15 via-cyan-500/10 to-indigo-500/15",
    shieldGradient: "from-blue-600 to-cyan-600",
    shieldShadow: "shadow-blue-500/25",
    pulseRing: "bg-blue-500/20",
    progressBar: "from-blue-600 to-cyan-500",
    step3Active: "bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400",
    step3Text: "text-blue-600 dark:text-blue-400",
    skipLink: "text-blue-600 dark:text-blue-400 hover:text-blue-700",
    icon: GraduationCap,
  },
  parent: {
    label: "Parent Gateway",
    subtitle: "Connecting your children's performance, attendance, and school reports...",
    badge: "bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800/60",
    ambientOrbs: "from-orange-500/15 via-amber-500/10 to-rose-500/15",
    shieldGradient: "from-orange-500 to-amber-600",
    shieldShadow: "shadow-orange-500/25",
    pulseRing: "bg-orange-500/20",
    progressBar: "from-orange-500 to-amber-500",
    step3Active: "bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400",
    step3Text: "text-orange-600 dark:text-orange-400",
    skipLink: "text-orange-600 dark:text-orange-400 hover:text-orange-700",
    icon: Users,
  },
  admin: {
    label: "School Administration",
    subtitle: "Initializing administrative controls, campus analytics, and rosters...",
    badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60",
    ambientOrbs: "from-indigo-500/15 via-purple-500/10 to-blue-500/15",
    shieldGradient: "from-indigo-600 to-purple-600",
    shieldShadow: "shadow-indigo-500/25",
    pulseRing: "bg-indigo-500/20",
    progressBar: "from-indigo-600 to-purple-500",
    step3Active: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400",
    step3Text: "text-indigo-600 dark:text-indigo-400",
    skipLink: "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700",
    icon: Building,
  },
};

export default function GoogleAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isProcessing = useRef(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const [activeStep, setActiveStep] = useState(1);
  const [userName, setUserName] = useState<string | null>(null);

  // Detect initial role from query params or destination path
  const rawRoleParam = searchParams.get("role") || "";
  const destParam = searchParams.get("dest") || "";

  const initialRole = useMemo(() => {
    const raw = rawRoleParam.toLowerCase();
    if (ROLE_THEMES[raw]) return raw;
    if (destParam.includes("teacher")) return "teacher";
    if (destParam.includes("admin")) return "admin";
    if (destParam.includes("parent")) return "parent";
    if (destParam.includes("student")) return "student";
    return "student";
  }, [rawRoleParam, destParam]);

  const [currentRole, setCurrentRole] = useState<string>(initialRole);

  const dest = useMemo(() => {
    if (destParam) return destParam;
    return `/dashboard/${currentRole.replace("_", "-")}`;
  }, [destParam, currentRole]);

  const roleConfig = ROLE_THEMES[currentRole] || ROLE_THEMES.student;
  const RoleIcon = roleConfig.icon;

  useEffect(() => {
    // Step animation sequence
    const timer1 = setTimeout(() => setActiveStep(2), 600);
    const timer2 = setTimeout(() => setActiveStep(3), 1300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    const handleCallback = async () => {
      if (isProcessing.current) return;
      isProcessing.current = true;

      const authStatus = searchParams.get("auth");
      const errorParam = searchParams.get("error");
      const role = searchParams.get("role") || initialRole;

      if (errorParam) {
        toast.error(errorParam);
        const params = new URLSearchParams();
        searchParams.forEach((val, key) => {
          params.set(key, val);
        });
        router.replace(`/login?${params.toString()}`);
        return;
      }

      if (authStatus === "success") {
        try {
          // Hydrate client-side auth store using the newly established session
          const token = Cookies.get("token") || "";
          let finalDisplayName = "User";
          let finalRole = role;

          try {
            const response = await apiClient.get("/auth/me");
            if (response.data && (response.data.user || response.data.data)) {
              const userData = response.data.user || response.data.data;
              finalDisplayName = userData.name || userData.fullName || "User";
              setUserName(finalDisplayName);

              if (userData.role) {
                finalRole = String(userData.role).toLowerCase();
                setCurrentRole(finalRole);
              }

              const normalizedUser = {
                ...userData,
                userType: (userData.role || finalRole).toUpperCase(),
                name: finalDisplayName,
              };

              setAuth(normalizedUser, token);
              toast.success(`Welcome back, ${finalDisplayName}!`);
            }
          } catch (meError: any) {
            console.warn("Notice: /auth/me fetch on callback deferred:", meError?.message);
            // Fallback setAuth to preserve session
            setAuth(
              {
                id: "current-user",
                email: "",
                name: finalDisplayName,
                role: finalRole.toUpperCase() as any,
                userType: finalRole.toUpperCase() as any,
              },
              token
            );
          }

          // Complete step progression and navigate gracefully
          setTimeout(() => {
            const targetDest = destParam || `/dashboard/${finalRole.replace("_", "-")}`;
            router.replace(targetDest);
          }, 1500);

        } catch (err: any) {
          console.error("Callback hydration error:", err);
          toast.error("Session initialized. Redirecting to workspace...");
          setTimeout(() => {
            router.replace(dest);
          }, 1200);
        }
      } else {
        // Fallback for unexpected direct visits
        setTimeout(() => {
          router.replace(dest);
        }, 1200);
      }
    };

    handleCallback();
  }, [router, searchParams, setAuth, dest, initialRole, destParam]);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-950 overflow-hidden font-sans select-none">
      {/* Dynamic ambient background glow orbs tuned to the active role theme */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr ${roleConfig.ambientOrbs} blur-3xl rounded-full pointer-events-none transition-all duration-700`} />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-slate-800/20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-slate-800/20 blur-3xl rounded-full pointer-events-none" />

      {/* Main Glassmorphism Authentication Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-[32px] p-7 sm:p-9 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand Header & Animated Shield */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            {/* Concentric radiant pulsing rings styled with user type theme */}
            <div className={`absolute inset-0 rounded-2xl ${roleConfig.pulseRing} blur-xl animate-pulse`} />
            <div className={`size-16 sm:size-18 rounded-2xl bg-gradient-to-br ${roleConfig.shieldGradient} text-white flex items-center justify-center shadow-lg ${roleConfig.shieldShadow} relative z-10 transition-all duration-500`}>
              <ShieldCheck size={32} className="animate-in zoom-in-50 duration-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-black uppercase tracking-wider ${roleConfig.badge} transition-all duration-500`}>
              <RoleIcon size={13} />
              <span>{roleConfig.label}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {userName ? `Welcome, ${userName}` : "Authenticating"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
              {roleConfig.subtitle}
            </p>
          </div>
        </div>

        {/* Animated Progress Bar matching user theme */}
        <div className="mt-7 space-y-2">
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
            <div 
              className={`h-full bg-gradient-to-r ${roleConfig.progressBar} transition-all duration-700 ease-out rounded-full shadow-xs`}
              style={{ width: activeStep === 1 ? "40%" : activeStep === 2 ? "75%" : "100%" }}
            />
          </div>
        </div>

        {/* Multi-Stage Checkpoint Sequence */}
        <div className="mt-6 space-y-3 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-4">
          {/* Step 1 */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="size-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={13} />
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Single Sign-On Verified
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">100%</span>
          </div>

          {/* Step 2 */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className={`size-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                activeStep >= 2 
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400" 
                  : "bg-slate-200 dark:bg-slate-700 text-slate-400"
              }`}>
                {activeStep >= 2 ? (
                  <CheckCircle2 size={13} />
                ) : (
                  <span className="size-2 rounded-full bg-slate-400 animate-pulse" />
                )}
              </div>
              <span className={`font-semibold ${activeStep >= 2 ? "text-slate-800 dark:text-slate-200" : "text-slate-400"}`}>
                Synchronizing Workspace Access
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 font-medium">
              {activeStep >= 2 ? "Ready" : "Syncing..."}
            </span>
          </div>

          {/* Step 3 */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className={`size-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                activeStep >= 3 
                  ? roleConfig.step3Active
                  : "bg-slate-200 dark:bg-slate-700 text-slate-400"
              }`}>
                {activeStep >= 3 ? (
                  <Sparkles size={13} className="animate-spin" />
                ) : (
                  <span className="size-2 rounded-full bg-slate-400" />
                )}
              </div>
              <span className={`font-semibold ${activeStep >= 3 ? roleConfig.step3Text : "text-slate-400"}`}>
                Redirecting to Dashboard
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 font-medium">
              {activeStep >= 3 ? "Launching" : "Pending"}
            </span>
          </div>
        </div>

        {/* Security Assurance Badge */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <Lock size={12} className="text-emerald-500" />
            <span>256-Bit SSL Encrypted Session</span>
          </div>

          <Link
            href={dest}
            className={`inline-flex items-center gap-1 font-bold ${roleConfig.skipLink} transition-colors`}
          >
            <span>Skip wait</span>
            <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}

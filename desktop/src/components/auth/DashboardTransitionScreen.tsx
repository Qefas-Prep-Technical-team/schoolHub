import React, { useEffect, useState } from "react";
import { getRoleTheme } from "../../theme/roleTheme";
import { UserRole } from "../../services/AuthService";
import {
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Users,
} from "lucide-react";

const ROLE_META: Record<
  UserRole,
  {
    Icon: React.FC<{ className?: string }>;
    greeting: string;
    subtitle: string;
    steps: string[];
  }
> = {
  ADMIN: {
    Icon: ShieldCheck,
    greeting: "Welcome back, Administrator",
    subtitle: "Loading your management console...",
    steps: [
      "Verifying admin credentials...",
      "Loading school data...",
      "Preparing management console...",
      "Almost there...",
    ],
  },
  TEACHER: {
    Icon: BookOpen,
    greeting: "Welcome back, Teacher",
    subtitle: "Preparing your classroom workspace...",
    steps: [
      "Verifying teacher credentials...",
      "Syncing class records...",
      "Loading student data...",
      "Almost there...",
    ],
  },
  STUDENT: {
    Icon: GraduationCap,
    greeting: "Welcome back, Student",
    subtitle: "Loading your learning dashboard...",
    steps: [
      "Verifying student credentials...",
      "Fetching your assignments...",
      "Loading exam results...",
      "Almost there...",
    ],
  },
  PARENT: {
    Icon: Users,
    greeting: "Welcome back",
    subtitle: "Fetching your child's progress...",
    steps: [
      "Verifying your account...",
      "Fetching ward information...",
      "Loading progress reports...",
      "Almost there...",
    ],
  },
};

interface DashboardTransitionScreenProps {
  role: UserRole;
  userName?: string;
}

export const DashboardTransitionScreen: React.FC<
  DashboardTransitionScreenProps
> = ({ role, userName }) => {
  const theme = getRoleTheme(role);
  const meta = ROLE_META[role] ?? ROLE_META.ADMIN;
  const { Icon } = meta;

  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    // Smooth progress animation
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        const increment = prev < 60 ? 3.5 : prev < 85 ? 1.5 : 0.4;
        return Math.min(100, prev + increment);
      });
    }, 40);

    // Cycle loading step messages
    const stepTimer = setInterval(() => {
      setStepIdx((prev) => Math.min(prev + 1, meta.steps.length - 1));
    }, 600);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, [meta.steps.length]);

  const greeting = userName
    ? `Welcome back, ${userName}!`
    : meta.greeting;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950 overflow-hidden">
      {/* Ambient radial glow */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${theme.primaryHex}66 0%, transparent 70%)`,
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(${theme.primaryHex} 1px, transparent 1px), linear-gradient(90deg, ${theme.primaryHex} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Floating orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-[0.08] animate-pulse"
        style={{ background: theme.primaryHex }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full blur-3xl opacity-[0.08] animate-pulse"
        style={{ background: theme.primaryHex, animationDelay: "0.8s" }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center max-w-xs w-full">

        {/* Logo / Icon stack */}
        <div className="relative flex items-center justify-center">
          {/* Outer pulse ring */}
          <div
            className="absolute -inset-4 rounded-full opacity-20 animate-ping"
            style={{ background: theme.primaryHex, animationDuration: "2s" }}
          />
          <div
            className="absolute -inset-2 rounded-3xl opacity-30 blur-md animate-pulse"
            style={{ background: theme.primaryHex }}
          />
          {/* Icon box */}
          <div
            className="relative h-28 w-28 rounded-3xl flex items-center justify-center shadow-2xl border border-white/10"
            style={{
              background: `linear-gradient(145deg, ${theme.primaryHex}ee, ${theme.primaryHex}77)`,
            }}
          >
            <img
              src="/schoolhub.png"
              alt="QefasHub"
              className="h-16 w-16 object-contain drop-shadow-lg"
              onError={(e) => {
                // Fallback if logo not found
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          {/* Role icon badge */}
          <div
            className="absolute -bottom-3 -right-3 h-10 w-10 rounded-xl flex items-center justify-center shadow-lg border-2 border-slate-950"
            style={{ background: theme.primaryHex }}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Text block */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
            QefasHub Desktop
          </p>
          <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
            {greeting}
          </h1>
          {/* Role pill */}
          <div className="flex justify-center">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
            >
              <Icon className="h-3 w-3" />
              {theme.label} Portal
            </span>
          </div>
        </div>

        {/* Progress section */}
        <div className="w-full space-y-3">
          {/* Bar */}
          <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all ease-out"
              style={{
                width: `${progress}%`,
                transitionDuration: "80ms",
                background: `linear-gradient(90deg, ${theme.primaryHex}, ${theme.primaryHex}99)`,
                boxShadow: `0 0 10px ${theme.primaryHex}66`,
              }}
            />
          </div>

          {/* Step label */}
          <div className="flex items-center justify-center gap-2 min-h-[20px]">
            <div
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: theme.primaryHex }}
            />
            <p
              key={stepIdx}
              className="text-[11px] text-slate-400 font-medium animate-in fade-in duration-300"
            >
              {meta.steps[stepIdx]}
            </p>
          </div>
        </div>

        {/* Bottom caption */}
        <p className="text-[10px] text-slate-600 font-medium">
          Powered by SQLite · Secure Local Auth
        </p>
      </div>
    </div>
  );
};

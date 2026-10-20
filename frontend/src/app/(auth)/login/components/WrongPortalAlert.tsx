"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, X, AlertCircle } from "lucide-react";
import { useErrorToast } from "@/lib/hooks/useToast";

interface WrongPortalAlertProps {
  currentPortalName?: string;
  serverError?: string;
  className?: string;
  onDismiss?: () => void;
}

const roleMeta: Record<
  string,
  { title: string; portalUrl: string; btnColor: string; badgeColor: string }
> = {
  student: {
    title: "Student Portal",
    portalUrl: "/login/student",
    btnColor: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25",
    badgeColor:
      "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  },
  teacher: {
    title: "Teacher Portal",
    portalUrl: "/login/teacher",
    btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25",
    badgeColor:
      "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  "school admin": {
    title: "School Admin Portal",
    portalUrl: "/login/school-admin",
    btnColor: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25",
    badgeColor:
      "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  admin: {
    title: "School Admin Portal",
    portalUrl: "/login/school-admin",
    btnColor: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25",
    badgeColor:
      "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  parent: {
    title: "Parent Portal",
    portalUrl: "/login/parent",
    btnColor: "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25",
    badgeColor:
      "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  },
  "platform staff": {
    title: "Platform Console",
    portalUrl: "/auth/login",
    btnColor: "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/25",
    badgeColor:
      "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  },
  staff: {
    title: "Platform Console",
    portalUrl: "/auth/login",
    btnColor: "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/25",
    badgeColor:
      "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  },
};

export default function WrongPortalAlert({
  currentPortalName,
  serverError,
  className = "",
  onDismiss,
}: WrongPortalAlertProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorToast = useErrorToast();

  const [dismissed, setDismissed] = useState(false);
  const [eventData, setEventData] = useState<{
    error?: string;
    wrong_portal?: boolean;
    detected_role?: string;
    correct_portal?: string;
  } | null>(null);
  const hasToasted = useRef(false);

  useEffect(() => {
    const handleWrongPortalEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        error: string;
        wrong_portal: boolean;
        detected_role?: string;
        correct_portal?: string;
      }>;
      if (customEvent.detail) {
        setEventData(customEvent.detail);
        setDismissed(false);
      }
    };
    window.addEventListener("wrong_portal_event", handleWrongPortalEvent);
    return () => window.removeEventListener("wrong_portal_event", handleWrongPortalEvent);
  }, []);

  const queryError = eventData?.error || searchParams?.get("error") || "";
  const queryWrongPortal = eventData?.wrong_portal ?? (searchParams?.get("wrong_portal") === "true");
  const queryDetectedRole = eventData?.detected_role || searchParams?.get("detected_role") || "";
  const queryCorrectPortal = eventData?.correct_portal || searchParams?.get("correct_portal") || "";

  const activeError = serverError || queryError;

  // Determine if this is a wrong portal error
  const isWrongPortal =
    queryWrongPortal ||
    activeError.toLowerCase().includes("please login through the correct portal") ||
    activeError.toLowerCase().includes("registered as a");

  // Determine detected role
  let detectedRole = queryDetectedRole;
  if (!detectedRole && isWrongPortal) {
    if (activeError.toLowerCase().includes("school admin")) {
      detectedRole = "School Admin";
    } else if (activeError.toLowerCase().includes("teacher")) {
      detectedRole = "Teacher";
    } else if (activeError.toLowerCase().includes("student")) {
      detectedRole = "Student";
    } else if (activeError.toLowerCase().includes("parent")) {
      detectedRole = "Parent";
    } else if (activeError.toLowerCase().includes("staff")) {
      detectedRole = "Platform Staff";
    }
  }

  const metaKey = (detectedRole || "").toLowerCase();
  const meta = roleMeta[metaKey] || {
    title: `${detectedRole || "Correct"} Portal`,
    portalUrl: queryCorrectPortal || "/login",
    btnColor: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25",
    badgeColor: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  };

  const destinationPortal = queryCorrectPortal || meta.portalUrl;

  useEffect(() => {
    if (activeError && !dismissed && !hasToasted.current) {
      hasToasted.current = true;
      errorToast.show(activeError);
    }
  }, [activeError, dismissed, errorToast]);

  // If user clears or changes error, reset dismissed state
  useEffect(() => {
    if (serverError) {
      setDismissed(false);
    }
  }, [serverError]);

  if (!activeError || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    setEventData(null);
    onDismiss?.();
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      url.searchParams.delete("wrong_portal");
      url.searchParams.delete("detected_role");
      url.searchParams.delete("correct_portal");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    }
  };

  const handleSwitchPortal = () => {
    router.push(destinationPortal);
  };

  if (isWrongPortal && detectedRole) {
    return (
      <div
        className={`w-full relative overflow-hidden rounded-2xl border border-amber-300 dark:border-amber-700/60 bg-gradient-to-br from-amber-50 via-rose-50/50 to-orange-50/40 dark:from-amber-950/40 dark:via-rose-950/30 dark:to-orange-950/20 p-4 sm:p-5 shadow-lg shadow-amber-500/5 animate-in fade-in slide-in-from-top-3 duration-300 mb-5 ${className}`}
      >
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 rounded-full bg-amber-400/10 dark:bg-amber-500/10 blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3.5">
          {/* Animated Warning Icon */}
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Wrong Portal Detected
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badgeColor}`}
              >
                Registered as {detectedRole}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              This account is registered as a{" "}
              <strong className="font-bold text-slate-900 dark:text-white">
                {detectedRole}
              </strong>
              {currentPortalName ? (
                <>
                  , but you are attempting to log in from the{" "}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {currentPortalName}
                  </strong>
                  .
                </>
              ) : (
                ". Please sign in through your designated portal."
              )}
            </p>

            <div className="mt-3.5 flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleSwitchPortal}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all duration-200 active:scale-95 cursor-pointer hover:shadow-lg ${meta.btnColor}`}
              >
                <span>Go to {meta.title}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                Stay here
              </button>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss alert"
            className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Generic Error Banner
  return (
    <div
      className={`w-full relative rounded-2xl border border-rose-200 dark:border-rose-800/60 bg-rose-50/80 dark:bg-rose-950/30 p-3.5 sm:p-4 text-rose-800 dark:text-rose-200 flex items-start gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300 mb-5 ${className}`}
    >
      <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0 pr-6 text-xs sm:text-sm font-medium leading-relaxed">
        {activeError}
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss error"
        className="absolute top-2.5 right-2.5 p-1 rounded-md text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

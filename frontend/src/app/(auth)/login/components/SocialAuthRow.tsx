"use client";

import { useState } from "react";
import { usePublicPlatformSettings } from "@/lib/api/hooks/usePlatformGovernance";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

interface SocialAuthRowProps {
  userType: string;
  mode?: "signin" | "signup";
  label?: string;
  className?: string;
}

export default function SocialAuthRow({
  userType,
  mode = "signin",
  label,
  className = "",
}: SocialAuthRowProps) {
  const [loadingProvider, setLoadingProvider] = useState<"google" | "facebook" | null>(null);
  const { data: settings } = usePublicPlatformSettings();

  // Map URL role to backend feature role
  const roleMap: Record<string, string> = {
    school: "admin",
    "school-admin": "admin",
    admin: "admin",
    teacher: "teacher",
    student: "student",
    parent: "parent",
    staff: "staff",
  };
  const backendRole = roleMap[userType.toLowerCase()] || userType.toLowerCase();

  // Global platform settings
  const googleGlobal = settings ? String(settings.google_auth_enabled) !== "false" : true;
  const facebookGlobal = settings ? String(settings.facebook_auth_enabled) !== "false" : true;

  // Role-specific settings
  const googleFeature = settings?.google_login_feature as Record<string, boolean> | undefined;
  const facebookFeature = settings?.facebook_login_feature as Record<string, boolean> | undefined;

  const googleEnabled = googleGlobal && (googleFeature ? googleFeature[backendRole] !== false : true);
  const facebookEnabled = facebookGlobal && (facebookFeature ? facebookFeature[backendRole] !== false : true);

  if (!googleEnabled && !facebookEnabled) {
    return null;
  }

  const defaultLabel = mode === "signup" ? "or sign up with" : "or sign in with";
  const displayLabel = label || defaultLabel;

  const handleGoogleClick = () => {
    setLoadingProvider("google");
    window.location.href = `/api/auth/google?role=${encodeURIComponent(backendRole)}`;
  };

  const handleFacebookClick = () => {
    toast.info(
      `${mode === "signup" ? "Facebook sign up" : "Facebook sign in"} is coming soon!`,
      { toastId: "facebook-auth-coming-soon" }
    );
  };

  return (
    <div className={`w-full text-center ${className}`}>
      {/* Divider / Label */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white dark:bg-slate-900 px-4 text-slate-500 dark:text-slate-400 font-medium text-xs">
            {displayLabel}
          </span>
        </div>
      </div>

      {/* Circular SSO Buttons Matching Console Login */}
      <div className="flex items-center justify-center gap-4">
        {googleEnabled && (
          <button
            type="button"
            title={`${mode === "signup" ? "Sign up" : "Sign in"} with Google`}
            disabled={!!loadingProvider}
            onClick={handleGoogleClick}
            className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loadingProvider === "google" ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-500 dark:text-slate-400" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
          </button>
        )}

        {facebookEnabled && (
          <button
            type="button"
            title={`${mode === "signup" ? "Sign up" : "Sign in"} with Facebook (Coming Soon)`}
            onClick={handleFacebookClick}
            className="relative w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <svg className="w-5 h-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="absolute -top-1.5 -right-2 bg-blue-600 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm border border-white dark:border-slate-900 pointer-events-none">
              Soon
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Wifi, WifiOff } from "lucide-react";

export default function NetworkStatusBanner() {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const hasBeenOfflineRef = React.useRef<boolean>(false);

  // Only show the banner in dashboard routes (e.g. /dashboard/*, /console/*) or active assessment portals
  const isDashboardRoute =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/console") ||
    pathname?.startsWith("/Exams&Quizzes") ||
    pathname?.startsWith("/exams&quizzes");

  useEffect(() => {
    // Initial mount check
    if (typeof window !== "undefined") {
      const initialOnline = navigator.onLine;
      setIsOnline(initialOnline);
      // If student is currently offline on page load/reload, show the offline pill persistently
      if (!initialOnline) {
        hasBeenOfflineRef.current = true;
        setShowBanner(true);
      } else {
        // If already online on reload/navigation, do NOT show the online banner
        setShowBanner(false);
      }
    }

    let hideTimer: NodeJS.Timeout | null = null;

    const handleOnline = () => {
      setIsOnline(true);
      // Only show the "Online" pill if the user previously went offline in this session
      if (hasBeenOfflineRef.current) {
        setShowBanner(true);
        if (hideTimer) clearTimeout(hideTimer);
        // Disappear after staying for 3 seconds
        hideTimer = setTimeout(() => {
          setShowBanner(false);
          hasBeenOfflineRef.current = false;
        }, 3000);
      }
    };

    const handleOffline = () => {
      hasBeenOfflineRef.current = true;
      if (hideTimer) clearTimeout(hideTimer);
      setIsOnline(false);
      // Offline stays persistent until connection is restored
      setShowBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      if (hideTimer) clearTimeout(hideTimer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Only show inside dashboard/exam routes and when showBanner is active
  if (!isDashboardRoute || !showBanner) {
    return null;
  }

  return (
    <aside
      aria-label="Network connection status"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-3"
    >
      <div
        className={`pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-md border text-xs font-bold transition-all ${isOnline
          ? "bg-emerald-600/90 text-white border-emerald-400/40 shadow-emerald-950/25"
          : "bg-rose-600/95 text-white border-rose-400/50 shadow-rose-950/30"
          }`}
      >
        <div className="relative flex items-center justify-center">
          <span
            className={`w-2 h-2 rounded-full ${isOnline ? "bg-white" : "bg-white animate-ping"
              }`}
          />
          {!isOnline && (
            <span className="absolute w-2 h-2 rounded-full bg-white" />
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline</span>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}



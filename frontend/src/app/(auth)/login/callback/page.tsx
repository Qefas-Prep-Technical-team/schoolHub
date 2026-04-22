"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";

import { toast } from "react-toastify";
import axios from "axios";
import { Loader2 } from "lucide-react";

/** Maps raw/internal error messages to safe, user-friendly strings. */
function getSafeErrorMessage(raw: string): string {
    if (!raw) return "Google sign-in failed. Please try again.";

    // Covers google-auth-library errors that embed the token in the message
    if (raw.toLowerCase().includes("wrong number of segments")) {
        return "Google sign-in configuration error. Please contact support.";
    }
    if (raw.toLowerCase().includes("invalid token") || raw.toLowerCase().includes("jwt")) {
        return "Your session token is invalid. Please sign in again.";
    }
    if (raw.toLowerCase().includes("no session")) {
        return "No session found. Please try signing in again.";
    }
    if (raw.toLowerCase().includes("id token")) {
        return "Could not complete Google sign-in. Please try again.";
    }
    // Backend messages are safe to show (they're written by us)
    if (raw.length < 120 && !raw.startsWith("ya29.") && !raw.includes("eyJ")) {
        return raw;
    }
    // Catch-all: don't leak anything long/token-like
    return "Google sign-in failed. Please try again.";
}

export default function GoogleAuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isProcessing = useRef(false);
    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        const handleCallback = async () => {
            if (isProcessing.current) return;
            isProcessing.current = true;

            const role = searchParams.get("role");
            
            try {
                // 1. Get the session from Supabase
                const supabaseClient = getSupabase();
                const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

                
                if (sessionError) throw sessionError;
                if (!session) {
                    toast.error("No session found. Please try again.");
                    router.push("/login");
                    return;
                }

                // 2. Extract Supabase's own signed JWT (always present in the session).
                // Supabase does not forward the Google ID token (provider_id_token) reliably,
                // so we verify the Supabase access_token on the backend instead.
                // It's a proper signed JWT containing the user's email, name, and Google sub.
                const supabaseToken = session.access_token;

                if (!supabaseToken) {
                    throw new Error("No session token found. Please sign in again.");
                }

                // 3. Finalize authentication with our custom backend
                const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
                const response = await axios.post(`${backendUrl}/auth/google`, {
                    idToken: supabaseToken,   // field name kept for backend compatibility
                    userRole: role
                });

                if (response.data.success) {
                    const { user, token } = response.data.data;
                    const actualRole = user.role;
                    
                    setAuth(user, token);

                    // Handle "Wrong Portal" detection feedback
                    if (role && role !== actualRole) {
                        toast.info(`Detected as ${actualRole}. Redirecting to the correct portal...`, {
                            autoClose: 5000,
                            icon: "🚀"
                        });
                    } else {
                        toast.success(`Welcome back, ${user.name}!`);
                    }
                    
                    // Redirect based on ACTUAL role from backend
                    const dashboardPath = `/dashboard/${actualRole.toLowerCase().replace('_', '-')}`;
                    router.push(dashboardPath);
                } else {
                    throw new Error(response.data.message || "Backend authentication failed");
                }

            } catch (error: any) {
                console.error("Auth Callback Error:", error);

                // Sanitize: never show raw token strings or internal library errors to the user.
                // error.message from google-auth-library can contain the full token value.
                const rawMessage: string = error.response?.data?.message || error.message || "";
                const friendlyMessage = getSafeErrorMessage(rawMessage);

                toast.error(friendlyMessage);
                router.push("/login");
            }
        };

        handleCallback();
    }, [router, searchParams, setAuth]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0F172A]">
            <div className="p-8 bg-white dark:bg-[#1E293B] rounded-3xl shadow-xl flex flex-col items-center gap-6 max-w-sm w-full">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse" />
                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin relative z-10" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Authenticating</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Finalizing your secure session...</p>
                </div>
            </div>
        </div>
    );
}

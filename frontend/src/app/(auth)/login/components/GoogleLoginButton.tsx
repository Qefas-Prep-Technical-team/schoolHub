"use client";

import { getSupabase } from "@/lib/supabaseClient";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { toast } from "react-toastify";
import { usePublicPlatformSettings } from "@/lib/api/hooks/usePlatformGovernance";

interface GoogleLoginButtonProps {
    userType: string;
}

export default function GoogleLoginButton({ userType }: GoogleLoginButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { data: settings, isLoading: settingsLoading } = usePublicPlatformSettings();

    const googleAuthEnabledGlobal = String(settings?.google_auth_enabled) === "true";
    const googleLoginFeature = settings?.google_login_feature as Record<string, boolean> | undefined;
    
    // Map URL role to backend feature role
    const roleMap: Record<string, string> = {
        'school-admin': 'admin',
        'teacher': 'teacher',
        'student': 'student',
        'parent': 'parent'
    };
    const backendRole = roleMap[userType.toLowerCase()] || userType.toLowerCase();
    
    const googleAuthEnabledForRole = googleLoginFeature ? googleLoginFeature[backendRole] !== false : true;
    const isEnabled = !!settings && googleAuthEnabledGlobal && googleAuthEnabledForRole;

    if (settingsLoading) return <div className="h-14 w-full bg-slate-50 dark:bg-slate-800 animate-pulse rounded-xl" />;
    if (!isEnabled) return null;

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const supabaseClient = getSupabase();
            const { error } = await supabaseClient.auth.signInWithOAuth({

                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/login/callback?role=${userType}`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });

            if (error) throw error;
        } catch (error: unknown) {
            console.error("Google login error:", error);
            toast.error("Login failed");
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-100 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-900 px-4 text-gray-400 font-bold tracking-widest">
                        Or continue with
                    </span>
                </div>
            </div>
            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="flex items-center justify-center w-full h-14 gap-3 cursor-pointer bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Connecting Google...</span>
                    </div>
                ) : (
                    <>
                        <FcGoogle size={24} className="group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-black text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                            Continue with Google
                        </span>
                    </>
                )}
            </button>
        </>
    );
}

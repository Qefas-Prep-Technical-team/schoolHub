"use client";

import { FaFacebook } from "react-icons/fa6";
import { useState } from "react";
import { usePublicPlatformSettings } from "@/lib/api/hooks/usePlatformGovernance";

interface FacebookLoginButtonProps {
    userType: string;
    pill?: boolean;
    className?: string;
    mode?: "signin" | "signup";
    showDivider?: boolean;
}

export default function FacebookLoginButton({ 
    userType, 
    pill = false, 
    className = "", 
    mode = "signin",
    showDivider = false,
}: FacebookLoginButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { data: settings, isLoading: settingsLoading } = usePublicPlatformSettings();

    const fbAuthEnabledGlobal = settings ? String(settings.facebook_auth_enabled) !== "false" : true;
    const fbLoginFeature = settings?.facebook_login_feature as Record<string, boolean> | undefined;
    
    // Map URL role to backend feature role
    const roleMap: Record<string, string> = {
        'school': 'admin',
        'school-admin': 'admin',
        'admin': 'admin',
        'teacher': 'teacher',
        'student': 'student',
        'parent': 'parent',
        'staff': 'staff',
    };
    const backendRole = roleMap[userType.toLowerCase()] || userType.toLowerCase();
    
    const fbAuthEnabledForRole = fbLoginFeature ? fbLoginFeature[backendRole] !== false : true;
    const isEnabled = fbAuthEnabledGlobal && fbAuthEnabledForRole;

    if (settingsLoading) {
        return (
            <div className={`h-14 w-full bg-slate-100 dark:bg-slate-800 animate-pulse ${pill ? 'rounded-full' : 'rounded-2xl'} my-2`} />
        );
    }

    if (!isEnabled) return null;

    const handleFacebookLogin = () => {
        setIsLoading(true);
        window.location.href = `/api/auth/facebook?role=${encodeURIComponent(backendRole)}`;
    };

    const isSignUp = mode === "signup";

    return (
        <div className={`w-full ${className}`}>
            {showDivider && (
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-slate-900 px-4 text-slate-400 dark:text-slate-500 font-bold tracking-widest text-[10px]">
                            {isSignUp ? "Or sign up with" : "Or continue with"}
                        </span>
                    </div>
                </div>
            )}
            <button
                type="button"
                onClick={handleFacebookLogin}
                disabled={isLoading}
                className={`flex items-center justify-center w-full h-14 gap-3 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 ${pill ? 'rounded-full' : 'rounded-2xl'} hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-300 shadow-sm hover:shadow-md group relative overflow-hidden`}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#1877F2] border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                            Connecting Facebook...
                        </span>
                    </div>
                ) : (
                    <>
                        <FaFacebook size={22} className="text-[#1877F2] group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-wide">
                            {isSignUp ? "Sign up with Facebook" : "Sign in with Facebook"}
                        </span>
                    </>
                )}
            </button>
        </div>
    );
}

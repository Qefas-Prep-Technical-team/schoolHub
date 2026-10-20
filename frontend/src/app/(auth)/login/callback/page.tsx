"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { apiClient } from "@/lib/api/client";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import Cookies from "js-cookie";

export default function GoogleAuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isProcessing = useRef(false);
    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        const handleCallback = async () => {
            if (isProcessing.current) return;
            isProcessing.current = true;

            const authStatus = searchParams.get("auth");
            const errorParam = searchParams.get("error");
            const role = searchParams.get("role") || "student";
            const dest = searchParams.get("dest") || `/dashboard/${role.toLowerCase().replace('_', '-')}`;

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
                    const response = await apiClient.get("/auth/me");

                    if (response.data && (response.data.user || response.data.data)) {
                        const userData = response.data.user || response.data.data;
                        const normalizedUser = {
                            ...userData,
                            userType: (userData.role || role).toUpperCase(),
                            name: userData.name || userData.fullName || "User",
                        };

                        setAuth(normalizedUser, token);
                        toast.success(`Welcome, ${normalizedUser.name}!`);
                    } else {
                        // Fallback user object if /auth/me returns minimal payload
                        setAuth(
                            {
                                id: "me",
                                email: "",
                                name: "User",
                                role: role.toUpperCase(),
                                userType: role.toUpperCase() as any,
                            },
                            token
                        );
                        toast.success("Welcome back!");
                    }

                    router.replace(dest);
                } catch (err: unknown) {
                    console.error("Failed to hydrate user profile after Google sign-in:", err);
                    // Even if /auth/me fails, cookies are set so navigate to destination
                    router.replace(dest);
                }
                return;
            }

            // If arrived with no parameters, redirect to login
            router.replace("/login");
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

"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function JoinRedirectContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            router.replace(`/auth/setup?token=${encodeURIComponent(token)}`);
        } else {
            router.replace("/auth/setup");
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
            <p className="text-sm font-semibold text-slate-400 tracking-wide">
                Redirecting to account setup...
            </p>
        </div>
    );
}

export default function JoinRedirectPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                    <p className="text-sm font-semibold text-slate-400 tracking-wide">
                        Loading...
                    </p>
                </div>
            }
        >
            <JoinRedirectContent />
        </Suspense>
    );
}

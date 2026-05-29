"use client";
import { useTenantBranding } from "@/lib/api/hooks/useTenantBranding";

export default function Header() {
    const { branding } = useTenantBranding();

    return (
        <header className="absolute top-0 left-0 z-10 w-full px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
                {branding.isBranded && branding.logo ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 p-1">
                        <img src={branding.logo} alt={branding.schoolName || "School"} className="h-full w-full object-contain rounded-full" />
                    </div>
                ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <span className="material-symbols-outlined text-lg">school</span>
                    </div>
                )}
                
                <p className="text-xl font-bold text-text-light dark:text-text-dark">
                    {branding.isBranded && branding.schoolName ? branding.schoolName : "Qefas Hub"}
                </p>
            </div>
        </header>
    );
}

"use client"
import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "./components/app-sidebar"
import TopNavBar from "./components/TopNavBar"
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute"
import { TrialBanner } from "@/components/subscription/TrialBanner"

import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { useSchoolSettings } from "@/lib/api/hooks/useSchool"

export default function Layout({ children }: { children: React.ReactNode }) {
    const { user } = useAuthStore()
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || ""
    const { data: settings } = useSchoolSettings(schoolId)
    
    const [isCollapsed, setIsCollapsed] = useState(false)

    const primaryColor = settings?.themeColor || "#2563eb"

    return (
        <ProtectedAdminRoute>
            <div style={{ "--primary-color": primaryColor } as React.CSSProperties}>


            <SidebarProvider 
                open={!isCollapsed} 
                onOpenChange={(open) => setIsCollapsed(!open)}
                style={{
                    "--sidebar-width": "260px",
                    "--sidebar-width-icon": "64px",
                } as React.CSSProperties}
            >
                <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 min-w-full relative overflow-x-hidden font-sans">
                    <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} primaryColor={primaryColor} />
                    
                    <SidebarInset className="relative flex-1 h-screen overflow-hidden bg-transparent">
                        <TopNavBar isCollapsed={isCollapsed} primaryColor={primaryColor} />
                        <div className="flex-1 overflow-y-auto p-4 md:p-8">
                            <TrialBanner />
                            {children}
                        </div>
                    </SidebarInset>
                </div>
            </SidebarProvider>
            </div>
        </ProtectedAdminRoute>
    )
}


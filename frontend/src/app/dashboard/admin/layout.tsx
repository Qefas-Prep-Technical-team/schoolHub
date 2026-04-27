"use client"
import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "./components/app-sidebar"
import TopNavBar from "./components/TopNavBar"
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute"
import { TrialBanner } from "@/components/subscription/TrialBanner"

export default function Layout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    return (
        <ProtectedAdminRoute>


            <SidebarProvider 
                open={!isCollapsed} 
                onOpenChange={(open) => setIsCollapsed(!open)}
                style={{
                    "--sidebar-width": "260px",
                    "--sidebar-width-icon": "64px",
                } as React.CSSProperties}
            >
                <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 min-w-full relative overflow-x-hidden font-sans">
                    <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                    
                    <SidebarInset className="relative flex-1 h-screen overflow-hidden bg-transparent">
                        <TopNavBar />
                        <div className="flex-1 overflow-y-auto p-4 md:p-8">
                            <TrialBanner />
                            {children}
                        </div>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </ProtectedAdminRoute>
    )
}

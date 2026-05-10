// app/dashboard/layout.tsx
"use client"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { ParentSidebar } from "./components/app-sidebar"
import TopNavBar from "./components/TopNavBar"
import { TrialBanner } from "@/components/subscription/TrialBanner"
import { useState, useEffect } from "react"
import { ProtectedParentRoute } from "./components/ProtectedParentRoute"
import FeatureGuard from "@/components/auth/FeatureGuard"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        // <ProtectedParentRoute>
        <SidebarProvider
            style={{
                "--sidebar-width": "280px",
                "--sidebar-width-icon": "64px",
            } as React.CSSProperties}
        >
            <ParentSidebar />
            <SidebarInset className="flex flex-col h-screen overflow-hidden bg-slate-50/50 dark:bg-slate-950/50 transition-all duration-300 ease-in-out">
                <TopNavBar />
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-4 md:p-6 lg:p-10">
                        <TrialBanner />
                        <FeatureGuard role="parent">
                            {children}
                        </FeatureGuard>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
        // </ProtectedParentRoute>
    )
}

"use client"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import TopNavBar from "./components/TopNavBar"
import { useState } from "react"
import { ProtectedStudentRoute } from "./components/ProtectedStudentRoute"
import { StudentSidebar } from "./components/app-sidebar"
import StudentBottomNav from "./components/StudentBottomNav"
import { TrialBanner } from "@/components/subscription/TrialBanner"

export default function Layout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    return (
        <ProtectedStudentRoute>
            <SidebarProvider 
                open={!isCollapsed} 
                onOpenChange={(open) => setIsCollapsed(!open)}
                style={{
                    "--sidebar-width": "260px",
                    "--sidebar-width-icon": "64px",
                } as React.CSSProperties}
            >
                <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 min-w-full relative overflow-x-hidden font-sans">
                    <StudentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                    
                    <SidebarInset className="relative flex-1 flex flex-col h-screen overflow-hidden bg-transparent pb-[4.5rem] md:pb-0">
                        <TopNavBar 
                            onToggleSidebar={() => setIsCollapsed(!isCollapsed)} 
                            isCollapsed={isCollapsed} 
                        />
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-4 md:p-6 lg:p-8">
                                <TrialBanner />
                                {children}
                            </div>
                        </div>
                    </SidebarInset>
                </div>
                <StudentBottomNav />
            </SidebarProvider>
        </ProtectedStudentRoute>
    )
}

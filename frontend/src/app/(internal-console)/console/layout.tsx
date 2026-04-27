"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ConsoleSidebar } from "./components/ConsoleSidebar"
import ConsoleTopBar from "./components/ConsoleTopBar"
import { PlatformStaffGuard } from "./components/PlatformStaffGuard"

export default function PlatformConsoleLayout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <PlatformStaffGuard>
            <SidebarProvider open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
                <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 min-w-full relative overflow-x-hidden font-sans">
                    <ConsoleSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                    
                    <SidebarInset className="relative flex-1 bg-transparent">
                        <ConsoleTopBar 
                            isCollapsed={isCollapsed} 
                            onToggleSidebar={() => setIsCollapsed(!isCollapsed)} 
                        />
                        <div className="p-4 md:p-10 max-w-[1600px] mx-auto w-full animate-in fade-in duration-500">
                             {children}
                        </div>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </PlatformStaffGuard>
    )
}

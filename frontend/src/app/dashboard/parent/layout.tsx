// app/dashboard/layout.tsx
"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ParentSidebar } from "./components/app-sidebar"
import TopNavBar from "./components/TopNavBar"
import { useState, useEffect } from "react"
import { ProtectedParentRoute } from "./components/ProtectedParentRoute"

export default function Layout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        // <ProtectedParentRoute>
        <SidebarProvider>
            <ParentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className="flex-1">
                <TopNavBar onToggleSidebar={() => setIsCollapsed(!isCollapsed)} isCollapsed={isCollapsed} />
                {children}
            </main>
        </SidebarProvider>
        // </ProtectedParentRoute>
    )
}
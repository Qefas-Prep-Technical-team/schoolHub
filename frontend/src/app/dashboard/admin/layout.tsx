"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
// import { AppSidebar } from "./components/app-sidebar"
import TopNavBar from "./components/TopNavBar"
import { useState } from "react"
import { AdminSidebar } from "./components/app-sidebar"


export default function Layout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    return (
        <SidebarProvider>
            <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className="flex-1">
                <TopNavBar onToggleSidebar={() => setIsCollapsed(!isCollapsed)} isCollapsed={isCollapsed} />
                {/* <SidebarTrigger /> */}
                {children}
            </main>
        </SidebarProvider>
    )
}

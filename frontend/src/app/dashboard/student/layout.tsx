"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import TopNavBar from "./components/TopNavBar"
import { useState } from "react"
import { ProtectedStudentRoute } from "./components/ProtectedStudentRoute"
import { StudentSidebar } from "./components/app-sidebar"
import StudentBottomNav from "./components/StudentBottomNav"

export default function Layout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    return (
        <ProtectedStudentRoute>
            <SidebarProvider>
                <StudentSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                {/* Added padding bottom on mobile to account for the bottom nav bar */}
                <main className="flex-1 transition-all duration-300 ease-in-out overflow-hidden pb-[4.5rem] md:pb-0 relative min-h-screen">
                    <TopNavBar onToggleSidebar={() => setIsCollapsed(!isCollapsed)} isCollapsed={isCollapsed} />
                    {/* <SidebarTrigger /> */}
                    {children}
                </main>
                <StudentBottomNav />
            </SidebarProvider>
        </ProtectedStudentRoute>
    )
}

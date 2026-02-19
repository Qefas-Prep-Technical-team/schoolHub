"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
// import { AppSidebar } from "./components/app-sidebar"
import TopNavBar from "./components/TopNavBar"
import { useState } from "react"
import { AdminSidebar } from "./components/app-sidebar"
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute"
import { AdminMobileNav } from "./components/AdminMobileNav"


export default function Layout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    return (
        // <ProtectedAdminRoute>

        <SidebarProvider>
            <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <main className="flex-1">
                <TopNavBar />
                {/* <SidebarTrigger /> */}
                {children}
            </main>
        </SidebarProvider>
        //  </ProtectedAdminRoute>
    )
}

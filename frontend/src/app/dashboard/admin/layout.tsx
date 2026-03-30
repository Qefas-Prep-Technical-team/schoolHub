"use client"
import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "./components/app-sidebar"
import TopNavBar from "./components/TopNavBar"
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute"

export default function Layout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    return (
        <ProtectedAdminRoute>


            <SidebarProvider open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
                <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 w-full relative">
                    <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

                    <SidebarInset className="flex-1 overflow-x-hidden">
                        <TopNavBar />
                        <div className="p-4 md:p-8">
                            {children}
                        </div>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </ProtectedAdminRoute>
    )
}

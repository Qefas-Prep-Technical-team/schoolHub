import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import TopNavBar from "./components/TopNavBar"
import { ProtectedTeacherRoute } from "./components/ProtectedTeacherRoute"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        // <ProtectedTeacherRoute>
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col min-h-screen">
                <TopNavBar />
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
        // </ProtectedTeacherRoute>
    )
}

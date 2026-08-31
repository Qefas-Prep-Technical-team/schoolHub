import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import TopNavBar from "./components/TopNavBar"
import { TrialBanner } from "@/components/subscription/TrialBanner"
import FeatureGuard from "@/components/auth/FeatureGuard"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        // <ProtectedTeacherRoute>
        <SidebarProvider
            style={{
                "--sidebar-width": "280px",
                "--sidebar-width-icon": "64px",
            } as React.CSSProperties}
        >
            <AppSidebar />
            <SidebarInset className="flex flex-col min-h-screen bg-[#F8F9FC] dark:bg-[#0B1437] transition-all duration-300 ease-in-out">
                <TopNavBar />
                <div className="flex-1 overflow-auto p-4 md:p-6">
                    <TrialBanner />
                    <FeatureGuard role="teacher">
                        {children}
                    </FeatureGuard>
                </div>
            </SidebarInset>
        </SidebarProvider>
        // </ProtectedTeacherRoute>
    )
}

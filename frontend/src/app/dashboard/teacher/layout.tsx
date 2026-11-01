import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import TopNavBar from "./components/TopNavBar"
import { TrialBanner } from "@/components/subscription/TrialBanner"
import FeatureGuard from "@/components/auth/FeatureGuard"
import TeacherBottomNav from "./components/TeacherBottomNav"

import { ProtectedTeacherRoute } from "./components/ProtectedTeacherRoute"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedTeacherRoute>
        <SidebarProvider
            style={{
                "--sidebar-width": "220px",
                "--sidebar-width-icon": "64px",
            } as React.CSSProperties}
        >
            <AppSidebar />
            <SidebarInset className="flex flex-col min-h-screen min-w-0 max-w-full overflow-x-hidden bg-[#F8F9FC] dark:bg-neutral-950 transition-all duration-300 ease-in-out pb-[4.5rem] md:pb-0">
                <TopNavBar />
                <div className="flex-1 min-w-0 max-w-full overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
                    <TrialBanner />
                    <FeatureGuard role="teacher">
                        {children}
                    </FeatureGuard>
                </div>
            </SidebarInset>
            <TeacherBottomNav />
        </SidebarProvider>
        </ProtectedTeacherRoute>
    )
}

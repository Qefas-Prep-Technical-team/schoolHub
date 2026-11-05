"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_FEATURE_FLAGS, AdminRole } from "./adminFeatureFlags";
import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolProfile } from "@/lib/api/hooks/useSchool";
import { usePublicPlatformSettings } from "@/lib/api/hooks/usePlatformGovernance";
import {
  adminMenuItems,
  AdminMenuItem,
  SECTION_TITLES,
  buildAdminMenuSections,
} from "./adminNavConfig";
import { AdminSidebarFooter } from "./AdminSidebarFooter";

export { adminMenuItems, type AdminMenuItem };

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  primaryColor?: string;
}

export function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
  primaryColor = "#2563eb",
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";
  const { data: schoolProfile } = useSchoolProfile(schoolId);

  const { data: dynamicFeatures, isLoading: isFeaturesLoading } =
    useGlobalFeatures("admin");
  const { data: publicPlatformSettings } = usePublicPlatformSettings();

  const menuSections = useMemo(() => {
    if (isFeaturesLoading) return null;
    const adminRole = (user?.adminRole || user?.role) as AdminRole | undefined;
    return buildAdminMenuSections({
      dynamicFeatures: dynamicFeatures as Record<string, boolean> | undefined,
      publicPlatformSettings: publicPlatformSettings as
        | Record<string, unknown>
        | undefined,
      adminRole,
    });
  }, [
    dynamicFeatures,
    isFeaturesLoading,
    publicPlatformSettings,
    user?.adminRole,
    user?.role,
  ]);

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        "transition-all duration-300 ease-in-out no-print border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-0",
        isCollapsed ? "w-[64px]" : "w-[200px]",
      )}
    >
      {/* Header */}
      <SidebarHeader className="pt-8 flex items-center justify-between px-4 relative">
        <div className="flex items-center gap-3">
          <Link
            href="/?view=landing"
            className="flex items-center gap-3"
            title="Visit Landing Page"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 border border-primary/10 overflow-hidden p-1"
              style={{ boxShadow: `0 4px 6px -1px ${primaryColor}10` }}
            >
              <img
                src="/logo/favicon.svg"
                alt="Qefas Hub"
                className="h-full w-full object-contain"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span
                  className="text-sm font-bold text-slate-900 dark:text-white tracking-tight uppercase truncate max-w-[120px]"
                  title={schoolProfile?.schoolName || "QEFAS HUB"}
                >
                  {schoolProfile?.schoolName || "QEFAS HUB"}
                </span>
                <span className="text-[10px] text-primary font-bold uppercase tracking-widest">
                  Admin Portal
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Floating Toggle Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsCollapsed(!isCollapsed);
          }}
          className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-primary flex items-center justify-center transition-all group"
          style={{ boxShadow: `0 2px 4px ${primaryColor}20` }}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          ) : (
            <ChevronLeft
              size={14}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          )}
        </button>
      </SidebarHeader>

      {/* Main Menu */}
      <SidebarContent className="mt-10 px-2 flex-1 outline-none">
        <SidebarMenu>
          {isFeaturesLoading ? (
            <div className="flex flex-col gap-3 px-1 mt-2">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 h-10 px-3">
                  <div className="h-5 w-5 rounded-md bg-slate-100 dark:bg-white/5 animate-pulse shrink-0" />
                  {!isCollapsed && (
                    <div className="h-4 w-3/4 rounded-md bg-slate-100 dark:bg-white/5 animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            menuSections &&
            Object.entries(menuSections).map(([sectionKey, items]) => {
              if (items.length === 0) return null;

              return (
                <div key={sectionKey} className="mb-6">
                  {!isCollapsed && (
                    <div className="px-4 mb-2">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                        {
                          SECTION_TITLES[
                          sectionKey as keyof typeof SECTION_TITLES
                          ]
                        }
                      </span>
                    </div>
                  )}

                  {items.map(({ icon: Icon, label, href, featureKey }) => {
                    const isActive = pathname === href;
                    const features = {
                      ...ADMIN_FEATURE_FLAGS,
                      ...(dynamicFeatures || {}),
                    } as Record<string, boolean>;
                    const isDisabled = !features[featureKey];

                    return (
                      <SidebarMenuItem key={label} className="my-1">
                        <Link href={isDisabled ? "#" : href}>
                          <SidebarMenuButton
                            className={cn(
                              "flex items-center gap-3 rounded-xl px-3 py-6 transition-all duration-200 group relative cursor-pointer",
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.02] hover:text-slate-900 dark:hover:text-slate-100",
                              isCollapsed && "justify-center mx-auto",
                            )}
                            style={
                              isActive
                                ? {
                                  boxShadow: `0 4px 6px -1px ${primaryColor}20`,
                                }
                                : {}
                            }
                            disabled={isDisabled}
                          >
                            <Icon
                              className={cn(
                                "h-5 w-5 transition-transform group-hover:scale-110",
                                isActive ? "text-primary" : "text-slate-400",
                              )}
                            />
                            {!isCollapsed && (
                              <span
                                className={cn(
                                  "font-semibold tracking-tight flex-1",
                                  isActive ? "text-primary" : "",
                                )}
                              >
                                {label}
                              </span>
                            )}
                            {isDisabled && !isCollapsed && (
                              <span className="text-[9px] bg-slate-100 dark:bg-white/5 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                Soon
                              </span>
                            )}
                            {isActive && (
                              <div
                                className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary shadow-lg"
                                style={{
                                  boxShadow: `0 0 10px ${primaryColor}`,
                                }}
                              />
                            )}
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    );
                  })}
                </div>
              );
            })
          )}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <AdminSidebarFooter isCollapsed={isCollapsed} />
    </Sidebar>
  );
}

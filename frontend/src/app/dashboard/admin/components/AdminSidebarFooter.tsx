"use client";

import { useState, useEffect } from "react";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User2, ChevronUp, ChevronDown, Copy, LogOut } from "lucide-react";
import { useLogoutMutation } from "@/app/(auth)/login/services/use-auth-mutations";
import { linkService } from "@/lib/api/services/linkService";
import { toast } from "react-toastify";

interface SidebarProfileData {
  name?: string;
  profileImage?: string;
  linkingCode?: string;
}

interface AdminSidebarFooterProps {
  isCollapsed: boolean;
}

export function AdminSidebarFooter({ isCollapsed }: AdminSidebarFooterProps) {
  const { mutate: logout } = useLogoutMutation();
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [profile, setProfile] = useState<SidebarProfileData | null>(null);

  useEffect(() => {
    linkService
      .getProfile()
      .then(setProfile)
      .catch(() => { });
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  return (
    <SidebarFooter className="p-4 bg-transparent border-t border-slate-100 dark:border-slate-900">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu onOpenChange={setIsUserOpen}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="flex items-center gap-3 p-3 h-auto rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-all group cursor-pointer">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden shrink-0">
                  {profile?.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User2 className="h-6 w-6 text-primary/60" />
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 flex flex-col items-start min-w-0 overflow-hidden">
                    <span className="font-black text-xs text-slate-900 dark:text-white truncate leading-tight uppercase tracking-tight">
                      {profile?.name || "Admin"}
                    </span>
                    {profile?.linkingCode && (
                      <span className="text-[9px] font-black text-primary uppercase tracking-[0.15em] mt-1">
                        ID: {profile.linkingCode}
                      </span>
                    )}
                  </div>
                )}
                {!isCollapsed && (
                  <div className="text-slate-400 group-hover:text-primary transition-colors">
                    {isUserOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  </div>
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="right"
              align="end"
              className="w-[220px] rounded-2xl shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 ml-2"
            >
              {profile?.linkingCode && (
                <DropdownMenuItem
                  onClick={() => copyCode(profile.linkingCode!)}
                  className="cursor-pointer hover:bg-primary/10 rounded-xl font-bold text-xs p-4 flex flex-col items-start gap-1 group"
                >
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                    Quick Link Code
                  </span>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-primary tracking-[0.2em] font-black text-base">
                      {profile.linkingCode}
                    </span>
                    <Copy
                      size={16}
                      className="text-slate-400 group-hover:text-primary transition-colors"
                    />
                  </div>
                </DropdownMenuItem>
              )}
              <div className="h-[1px] bg-slate-200 dark:bg-slate-800 my-2 mx-2" />
              <DropdownMenuItem
                onClick={() => logout()}
                className="rounded-xl py-3 cursor-pointer hover:bg-red-500/10 font-bold text-red-500"
              >
                <LogOut size={16} className="mr-3" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Search } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { ThemeToggle } from "@/app/theme-toggle";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { AdminMobileDrawer } from "./AdminMobileDrawer";

export default function TopNavBar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="flex items-center justify-between px-3 py-2 md:px-6 md:py-3 gap-3">
        {/* Left */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mobile hamburger */}
          <AdminMobileDrawer />

          {/* Search - hide on very small screens */}
          <div className="relative w-full max-w-sm hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input placeholder="Search students, teachers..." className="pl-10 h-10 text-sm" />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <ThemeToggle />

          <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent">
            <Bell className="h-5 w-5" />
          </Button>

          {/* Profile */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <div className="relative w-9 h-9 md:w-10 md:h-10">
              <Image src="/avatars/admin-profile.png" alt="Admin Profile" fill className="rounded-full object-cover" />
            </div>
            <div className="hidden md:flex flex-col text-right">
              <p className="text-sm font-medium leading-tight">{user?.name || "Admin User"}</p>
              <p className="text-xs text-muted-foreground leading-tight">System Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Optional: mobile search row */}
      <div className="px-3 pb-2 sm:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input placeholder="Search..." className="pl-10 h-10 text-sm" />
        </div>
      </div>
    </header>
  );
}

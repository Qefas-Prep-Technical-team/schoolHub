"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { ThemeToggle } from "@/app/theme-toggle";
import { ParentMobileDrawer } from "./ParentMobileDrawer";

export default function TopNavBar({
  onToggleSidebar,
  isCollapsed,
}: {
  onToggleSidebar?: () => void;
  isCollapsed?: boolean;
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="flex items-center justify-between px-3 py-2 md:px-6 md:py-3 gap-3">
        {/* Left */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Desktop collapse button */}
          <div className="hidden md:block">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="rounded-full hover:bg-accent"
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile hamburger */}
          <ParentMobileDrawer />

          {/* Search (hide on xs) */}
          <div className="relative w-full max-w-sm hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input placeholder="Search..." className="pl-10 h-10 text-sm" />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {/* Child selector (hide on xs to reduce squish) */}
          <select className="hidden sm:block w-[200px] pl-3 pr-10 py-2.5 bg-background border border-border rounded-xl text-sm font-medium focus:ring-primary focus:border-primary cursor-pointer appearance-none">
            <option>Emily Johnson</option>
            <option>Michael Johnson</option>
          </select>

          <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent">
            <Bell className="h-5 w-5" />
          </Button>

          <ThemeToggle />

          {/* Profile */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <div className="relative w-9 h-9 md:w-10 md:h-10">
              <Image src="/avatars/admin-profile.png" alt="Profile" fill className="rounded-full object-cover" />
            </div>

            <ChevronDown
              className={clsx("h-4 w-4 transition-transform", {
                "rotate-180": isProfileOpen,
              })}
            />
          </div>
        </div>
      </div>

      {/* Mobile row: search + child selector */}
      <div className="px-3 pb-2 sm:hidden space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input placeholder="Search..." className="pl-10 h-10 text-sm" />
        </div>

        <select className="w-full pl-3 pr-10 py-2.5 bg-background border border-border rounded-xl text-sm font-medium focus:ring-primary focus:border-primary cursor-pointer appearance-none">
          <option>Emily Johnson</option>
          <option>Michael Johnson</option>
        </select>
      </div>
    </header>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, ChevronDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { ThemeToggle } from "@/app/theme-toggle";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";

export default function TopNavBar({ onToggleSidebar, isCollapsed }: { onToggleSidebar?: () => void, isCollapsed?: boolean }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const user = useAuthStore((state) => state.user);

    return (
        <header className="flex items-center justify-between border-b border-border bg-background px-6 py-3 sticky top-0 z-50">
            {/* Left Section */}
            <div className="flex items-center gap-4 flex-1">
                {/* Retract/Expand Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleSidebar}
                    className="rounded-full hover:bg-accent"
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-5 w-5" />
                    ) : (
                        <ChevronLeft className="h-5 w-5" />
                    )}
                </Button>

                {/* Search Bar */}
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                        placeholder="Search students, teachers..."
                        className="pl-10 h-10 text-sm"
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
                <ThemeToggle />
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-accent"
                >
                    <Bell className="h-5 w-5" />
                </Button>

                {/* Profile Section */}
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                    <div className="relative w-10 h-10">
                        <Image
                            src="/avatars/admin-profile.png"
                            alt="Admin Profile"
                            fill
                            className="rounded-full object-cover"
                        />
                    </div>
                    <div className="hidden sm:flex flex-col text-right">
                        <p className="text-sm font-medium">{user?.name || "Admin User"}</p>
                        <p className="text-xs text-muted-foreground">System Administrator</p>
                    </div>
                </div>
            </div>
        </header>
    );
}

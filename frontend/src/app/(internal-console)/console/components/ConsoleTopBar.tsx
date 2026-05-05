"use client"

import React from "react"
import { Search, Bell, Shield, ChevronLeft, ChevronRight, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/app/theme-toggle"
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore"
import { usePlatformSupportNotifications } from "@/lib/hooks/usePlatformSupportNotifications"
import { useRouter } from "next/navigation"

interface ConsoleTopBarProps {
    onToggleSidebar: () => void;
    isCollapsed: boolean;
}

export default function ConsoleTopBar({ onToggleSidebar, isCollapsed }: ConsoleTopBarProps) {
    const { staff } = usePlatformStaffStore()
    const { unreadCount, clearUnread } = usePlatformSupportNotifications()
    const router = useRouter()

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 px-4 backdrop-blur-xl md:px-8">
            <div className="flex items-center gap-6 flex-1">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleSidebar}
                    className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-all border border-slate-200 dark:border-white/5"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </Button>

                {/* Dashboard Badge */}
                <div className="hidden lg:flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full">
                    <Shield size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Platform Core</span>
                </div>
            </div>

            {/* Platform Global Search */}
            <div className="hidden md:flex flex-1 justify-center max-w-2xl">
                <div className="relative w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input
                        type="search"
                        placeholder="Global lookup: schools, transactions, staff..."
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-200 dark:focus:bg-white/10 transition-all text-sm font-medium"
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 flex-1">
                <ThemeToggle />
                
                <button 
                    onClick={() => { clearUnread(); router.push('/console/support') }}
                    className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                >
                    <Bell size={20} />
                    {unreadCount > 0 ? (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full px-1 border-2 border-white dark:border-slate-950 animate-bounce">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    ) : (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-950"></span>
                    )}
                </button>

                <div className="h-6 w-[1px] bg-slate-200 dark:bg-white/10 mx-2" />

                {/* Staff User Hub */}
                <div className="flex items-center gap-3 p-1 pl-1 pr-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all cursor-pointer group">
                   <div className="h-8 w-8 rounded-lg bg-indigo-600/10 dark:bg-indigo-600/20 flex items-center justify-center border border-indigo-500/20 dark:border-indigo-500/30">
                        <User size={16} className="text-indigo-600 dark:text-indigo-400" />
                   </div>
                   <div className="hidden lg:flex flex-col text-left">
                       <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">{staff?.fullName}</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Platform {staff?.role?.split('_')[0]}</p>
                   </div>
                </div>
            </div>
        </header>
    )
}

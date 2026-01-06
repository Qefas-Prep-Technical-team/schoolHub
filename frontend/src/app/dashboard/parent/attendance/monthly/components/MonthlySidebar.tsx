'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    LayoutDashboard,
    Calendar,
    School,
    Clock,
    MessageCircle,
    LogOut,
    ChevronDown
} from 'lucide-react';
import { usePathname } from 'next/navigation';

interface MonthlySidebarProps {
    isMobileOpen?: boolean;
    onClose?: () => void;
}

export default function MonthlySidebar({ isMobileOpen, onClose }: MonthlySidebarProps) {
    const pathname = usePathname();
    const [showChildren, setShowChildren] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/parent', isActive: false },
        { id: 'attendance', label: 'Attendance', icon: Calendar, href: '/parent/attendance', isActive: true },
        { id: 'grades', label: 'Grades', icon: School, href: '/parent/grades', isActive: false },
        { id: 'schedule', label: 'Schedule', icon: Clock, href: '/parent/schedule', isActive: false },
        { id: 'messages', label: 'Messages', icon: MessageCircle, href: '/parent/messages', isActive: false, badge: 1 },
    ];

    const children = [
        { id: '1', name: 'Alex Johnson', grade: 'Grade 5B', isActive: true },
        { id: '2', name: 'Emily Johnson', grade: 'Grade 3A' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:relative z-50
        w-72 h-full flex-shrink-0
        bg-surface-light dark:bg-surface-dark
        border-r border-slate-200 dark:border-slate-800
        transition-transform duration-300
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="p-6 pb-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <School className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-slate-900 dark:text-white">
                                    EduConnect
                                </h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Parent Portal
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide flex flex-col gap-6">
                        {/* User Profile */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-background-light dark:bg-background-dark">
                            <div className="relative h-10 w-10">
                                <Image
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZGHSIH4X-UOGsyfu91_9ZNoyzqTrFdgXIJFthCW5gAx52-CegXQQM6rLP_AIVFeW1E5TCDO-e_TGrwwWPwVEpYnZvSZtrsO43sukRGe3QXxNHgiyY4EjCdmm4M-2iyt1o6e4NdKxrDHqtqAkvkUMikk7QjsJX34uQ4qeT_yvd8_lQF_QqtW8dOmHdvSwfsVtwZJJ1UvcuzjxJofb5YqopSNpI7b7B2bQxTUTKa3qVK_sHg1kyyXh9nGkBZXdfP9UHSALOvgYz9GU"
                                    alt="Portrait of Sarah the parent"
                                    fill
                                    className="rounded-full object-cover"
                                />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                    Sarah Johnson
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    Parent of Alex
                                </p>
                            </div>
                        </div>

                        {/* Child Selector */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Select Child
                                </span>
                                <button
                                    onClick={() => setShowChildren(!showChildren)}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                                >
                                    <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${showChildren ? 'rotate-180' : ''}`} />
                                </button>
                            </div>

                            {showChildren && (
                                <div className="space-y-1">
                                    {children.map((child) => (
                                        <Link
                                            key={child.id}
                                            href={`/parent/attendance/monthly?child=${child.id}`}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${child.isActive
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            <div className={`h-2 w-2 rounded-full ${child.isActive ? 'bg-primary' : 'bg-slate-300'}`} />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{child.name}</p>
                                                <p className="text-xs text-slate-500">{child.grade}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Navigation */}
                        <nav className="flex flex-col gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        onClick={onClose}
                                        className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                      ${isActive
                                                ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }
                    `}
                                    >
                                        <Icon className={`h-[22px] w-[22px] ${isActive ? 'fill-current' : ''}`} />
                                        <span className="text-sm font-medium">{item.label}</span>
                                        {item.badge && (
                                            <span className="ml-auto flex items-center justify-center">
                                                <span className="h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-surface-dark" />
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Logout Button */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <LogOut className="h-5 w-5" />
                            Log Out
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Home,
    Users,
    GraduationCap,
    Calendar,
    CheckSquare,
    CreditCard,
    BarChart3,
    MessageSquare,
    User2,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    School,
    Award,
    LibraryBig,
    BrainCircuit,
    Cog,
    BookOpenIcon,
    Landmark
} from "lucide-react"
import { Box, Typography } from "@mui/material"
import Image from "next/image"
import { cn } from "@/lib/utils"

const menuItems = [
    { icon: Home, label: "Overview", href: "/dashboard/school" },
    { icon: Users, label: "Teachers", href: "/teachers" },
    { icon: GraduationCap, label: "Students", href: "/students" },
    { icon: Award, label: "Grades", href: "/grades" },
    { icon: Calendar, label: "Classes & Timetable", href: "/classes" },
    { icon: CheckSquare, label: "Attendance", href: "/attendance" },
    { icon: CreditCard, label: "Finance", href: "/finance" },
    { icon: BarChart3, label: "Reports", href: "/reports" },
    { icon: MessageSquare, label: "Communication", href: "/chat" },
    { icon: LibraryBig, label: "Library", href: "/library" },
    { icon: BrainCircuit, label: "Artificial Intelligence", href: "/Ai" },
    { icon: Cog, label: "Settings", href: "/settings" },
    { icon: BookOpenIcon, label: "Exams/Quizzes", href: "/resources" },
    { icon: Landmark, label: "Gallery", href: "/gallery " },
]

export function AppSidebar({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean, setIsCollapsed: (collapsed: boolean) => void }) {

    const [isUserOpen, setIsUserOpen] = useState(false)
    const pathname = usePathname()

    return (
        <Sidebar
            collapsible="icon"
            className={cn(
                "transition-all duration-300 ease-in-out bg-red-600",
                isCollapsed ? "w-[80px]" : "w-[260px]"
            )}
        >
            {/* Header */}
            <SidebarHeader className="pt-8 flex items-center justify-between px-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="flex items-center justify-between hover:bg-transparent cursor-default"
                            asChild
                        >
                            <Box className="flex items-center justify-start">
                                <Box className="flex items-center justify-center mr-3">
                                    {/* <Image
                                        src="/schoolhub.png"
                                        alt="school hub logo"
                                        width={35}
                                        height={35}
                                        className="rounded-md"
                                    /> */}
                                    <School className="h-5 w-5 shrink-0 text-blue-500" />

                                </Box>
                                {!isCollapsed && (
                                    <Link href="/" passHref>
                                        <Typography
                                            variant="h6"
                                            noWrap
                                            component="h2"
                                            sx={{
                                                fontFamily: "monospace",
                                                fontWeight: 700,
                                                letterSpacing: ".2rem",
                                                color: "inherit",
                                                textDecoration: "none",
                                            }}
                                        >
                                            SCHOOLHUB
                                        </Typography>
                                    </Link>
                                )}
                            </Box>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                {/* Retract Button */}
                {/* <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="ml-auto flex items-center justify-center p-2 rounded-md hover:bg-accent/60 transition-colors"
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-5 w-5" />
                    ) : (
                        <ChevronLeft className="h-5 w-5" />
                    )}
                </button> */}
            </SidebarHeader>

            {/* Main Menu */}
            <SidebarContent className="mt-10">
                <SidebarMenu>
                    {menuItems.map(({ icon: Icon, label, href }) => {
                        const isActive = pathname === href
                        return (
                            <SidebarMenuItem key={label} className="my-2">
                                <Link href={href}>
                                    <SidebarMenuButton
                                        className={cn(
                                            "relative flex items-center gap-3 text-[1rem] font-medium rounded-lg px-4 py-3 transition-all cursor-pointer",
                                            isActive
                                                ? "bg-accent text-accent-foreground shadow-sm"
                                                : "hover:bg-accent/40"
                                        )}
                                    >
                                        {isActive && (
                                            <span className="absolute left-0 top-0 h-full w-[4px] bg-primary rounded-r-md" />
                                        )}
                                        <Icon className="h-5 w-5 shrink-0" />
                                        {!isCollapsed && <span>{label}</span>}
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu onOpenChange={setIsUserOpen}>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="flex items-center justify-between hover:bg-accent/60 transition-colors py-3 px-4 rounded-lg">
                                    <div className="flex items-center">
                                        <User2 className="mr-2 h-5 w-5" />
                                        {!isCollapsed && (
                                            <span className="font-medium text-[1rem]">Username</span>
                                        )}
                                    </div>
                                    {!isCollapsed &&
                                        (isUserOpen ? (
                                            <ChevronDown className="ml-auto h-4 w-4 opacity-70" />
                                        ) : (
                                            <ChevronUp className="ml-auto h-4 w-4 opacity-70" />
                                        ))}
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                side="top"
                                align="end"
                                className="w-[220px] rounded-lg shadow-lg border border-border bg-background p-1"
                            >
                                <DropdownMenuItem className="cursor-pointer hover:bg-accent/60 rounded-md">
                                    Account
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer hover:bg-accent/60 rounded-md">
                                    Billing
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer hover:bg-accent/60 rounded-md text-destructive">
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}

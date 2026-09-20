"use client"

import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { AdminRole } from "@/app/dashboard/admin/components/adminFeatureFlags"
import { ShieldOff, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ReactNode } from "react"

interface AdminRoleGuardProps {
    /** Roles allowed to access this route. SCHOOL_OWNER is always allowed. */
    allowedRoles: AdminRole[]
    children: ReactNode
    /** Optional custom message shown on the access denied screen */
    message?: string
}

/**
 * AdminRoleGuard — wraps a page and blocks access if the current admin's role
 * is not in the `allowedRoles` list.
 *
 * SCHOOL_OWNER always bypasses this guard.
 *
 * Usage:
 * ```tsx
 * <AdminRoleGuard allowedRoles={["SCHOOL_OWNER"]}>
 *   <SettingsPage />
 * </AdminRoleGuard>
 * ```
 */
export default function AdminRoleGuard({ allowedRoles, children, message }: AdminRoleGuardProps) {
    const { user } = useAuthStore()
    const adminRole = (user?.adminRole || user?.role) as AdminRole | undefined

    // SCHOOL_OWNER always has full access
    if (adminRole === "SCHOOL_OWNER") return <>{children}</>

    // If role matches the allowed list, render children
    if (adminRole && allowedRoles.includes(adminRole)) return <>{children}</>

    // Otherwise, show Access Denied
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
            <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6">
                <ShieldOff className="text-red-500 dark:text-red-400" size={36} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                Access Restricted
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm leading-relaxed mb-6">
                {message || "You don't have permission to view this page. Contact your School Owner to request access."}
            </p>
            <p className="text-xs text-slate-400 mb-8">
                Your current role: <span className="font-semibold text-slate-600 dark:text-slate-300">{adminRole || "Unknown"}</span>
            </p>
            <Link
                href="/dashboard/admin"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
            >
                <ArrowLeft size={16} />
                Back to Dashboard
            </Link>
        </div>
    )
}

import { Shield, Crown, UserCheck, Calculator, HeadphonesIcon } from "lucide-react"

export type AdminRole = "SCHOOL_OWNER" | "PRINCIPAL" | "REGISTRAR" | "ACCOUNTANT" | "SUPPORT"

export type ApprovableRole = "PRINCIPAL" | "REGISTRAR" | "ACCOUNTANT" | "SUPPORT"

export interface AdminMember {
    id: string
    name: string
    email: string
    role: AdminRole
    adminRole?: AdminRole
    joinedAt: string
    profileImage?: string
}

export interface PendingAdmin {
    id: string
    name: string
    email: string
    requestedAt: string
    status?: string
}

export const ROLE_CONFIG: Record<
    AdminRole,
    { label: string; icon: React.ElementType; color: string; bg: string; border: string }
> = {
    SCHOOL_OWNER: {
        label: "School Owner",
        icon: Crown,
        color: "text-amber-700 dark:text-amber-300",
        bg: "bg-amber-50 dark:bg-amber-950/40",
        border: "border-amber-200 dark:border-amber-900/50",
    },
    PRINCIPAL: {
        label: "Principal",
        icon: Shield,
        color: "text-violet-700 dark:text-violet-300",
        bg: "bg-violet-50 dark:bg-violet-950/40",
        border: "border-violet-200 dark:border-violet-900/50",
    },
    REGISTRAR: {
        label: "Registrar",
        icon: UserCheck,
        color: "text-blue-700 dark:text-blue-300",
        bg: "bg-blue-50 dark:bg-blue-950/40",
        border: "border-blue-200 dark:border-blue-900/50",
    },
    ACCOUNTANT: {
        label: "Accountant",
        icon: Calculator,
        color: "text-emerald-700 dark:text-emerald-300",
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        border: "border-emerald-200 dark:border-emerald-900/50",
    },
    SUPPORT: {
        label: "Support",
        icon: HeadphonesIcon,
        color: "text-slate-700 dark:text-slate-300",
        bg: "bg-slate-100 dark:bg-slate-800",
        border: "border-slate-200 dark:border-slate-700",
    },
}

export const ASSIGNABLE_ROLES: AdminRole[] = ["PRINCIPAL", "REGISTRAR", "ACCOUNTANT", "SUPPORT"]

export const ROLE_OPTIONS: {
    value: ApprovableRole
    label: string
    description: string
    badgeColor: string
}[] = [
    {
        value: "PRINCIPAL",
        label: "Principal",
        description: "Full management authority — approves team requests & manages all operational branches",
        badgeColor: "text-violet-700 bg-violet-50 dark:text-violet-300 dark:bg-violet-950/40",
    },
    {
        value: "REGISTRAR",
        label: "Registrar",
        description: "Academic controller — manages student rosters, teacher profiles, classes, and exams",
        badgeColor: "text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/40",
    },
    {
        value: "ACCOUNTANT",
        label: "Accountant",
        description: "Financial administrator — manages school billing, invoices, fee collection, and records",
        badgeColor: "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40",
    },
    {
        value: "SUPPORT",
        label: "Support Staff",
        description: "View-only administrative access — inspects statistics and provides helpdesk services",
        badgeColor: "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800",
    },
]


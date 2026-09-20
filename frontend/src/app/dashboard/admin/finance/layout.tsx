import AdminRoleGuard from "@/components/auth/AdminRoleGuard"

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminRoleGuard
            allowedRoles={["SCHOOL_OWNER", "ACCOUNTANT"]}
            message="Finance is restricted to the School Owner and Accountant roles."
        >
            {children}
        </AdminRoleGuard>
    )
}

import AdminRoleGuard from "@/components/auth/AdminRoleGuard"

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminRoleGuard
            allowedRoles={["SCHOOL_OWNER", "ACCOUNTANT", "ADMIN", "SUPER_ADMIN"]}
            message="Finance and fee management is restricted to authorized school administrative roles."
        >
            {children}
        </AdminRoleGuard>
    )
}

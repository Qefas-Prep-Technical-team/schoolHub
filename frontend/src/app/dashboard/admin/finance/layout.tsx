import AdminRoleGuard from "@/components/auth/AdminRoleGuard"

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminRoleGuard
            allowedRoles={["SCHOOL_OWNER", "ACCOUNTANT"]}
            message="Finance and fee management is restricted to the School Owner and Accountant only."
        >
            {children}
        </AdminRoleGuard>
    )
}

import AdminRoleGuard from "@/components/auth/AdminRoleGuard"

export default function BillingLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminRoleGuard
            allowedRoles={["SCHOOL_OWNER", "ACCOUNTANT"]}
            message="Billing and subscription management is restricted to the School Owner and Accountant only."
        >
            {children}
        </AdminRoleGuard>
    )
}

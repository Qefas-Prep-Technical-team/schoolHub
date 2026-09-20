import AdminRoleGuard from "@/components/auth/AdminRoleGuard"

export default function TeamLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminRoleGuard
            allowedRoles={["SCHOOL_OWNER", "PRINCIPAL"]}
            message="Team management is restricted to the School Owner and Principal."
        >
            {children}
        </AdminRoleGuard>
    )
}

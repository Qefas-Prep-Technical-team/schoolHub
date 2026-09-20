import AdminRoleGuard from "@/components/auth/AdminRoleGuard"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminRoleGuard
            allowedRoles={["SCHOOL_OWNER"]}
            message="Settings are restricted to the School Owner only. Contact your School Owner to make changes."
        >
            {children}
        </AdminRoleGuard>
    )
}

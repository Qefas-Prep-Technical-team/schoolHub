import AdminRoleGuard from "@/components/auth/AdminRoleGuard"

export default function GradesLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminRoleGuard
            allowedRoles={["SCHOOL_OWNER", "PRINCIPAL", "REGISTRAR"]}
            message="Grades and academic records are restricted to School Owners, Principals, and Registrars."
        >
            {children}
        </AdminRoleGuard>
    )
}

import AdminRoleGuard from "@/components/auth/AdminRoleGuard";

export default function PaymentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoleGuard
      allowedRoles={["SCHOOL_OWNER", "ACCOUNTANT"]}
      message="Payments and fee collections management is restricted to the School Owner and Accountant only."
    >
      {children}
    </AdminRoleGuard>
  );
}

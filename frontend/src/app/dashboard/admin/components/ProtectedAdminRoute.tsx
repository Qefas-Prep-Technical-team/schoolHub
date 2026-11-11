// components/auth/ProtectedAdminRoute.tsx

import ProtectedRoute from "@/components/reuseables/ProtectedRoute";

export function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute userTypes={['ADMIN', 'SCHOOL_OWNER', 'SUPER_ADMIN']}>
      {children}
    </ProtectedRoute>
  );
}


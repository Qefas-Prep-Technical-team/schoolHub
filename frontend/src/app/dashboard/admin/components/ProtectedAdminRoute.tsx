// components/auth/ProtectedAdminRoute.tsx
import ProtectedRoute from "@components/reuseables/ProtectedRoute"
export function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute userTypes={['ADMIN']}>
      {children}
    </ProtectedRoute>
  );
}
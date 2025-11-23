// components/auth/ProtectedTeacherRoute.tsx

import ProtectedRoute from "@/components/reuseables/ProtectedRoute";


export function ProtectedTeacherRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute userTypes={['TEACHER']}>
      {children}
    </ProtectedRoute>
  );
}
// components/auth/ProtectedStudentRoute.tsx

import ProtectedRoute from "@/components/reuseables/ProtectedRoute";



export function ProtectedStudentRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute userTypes={['STUDENT']}>
      {children}
    </ProtectedRoute>
  );
}

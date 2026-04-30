import ProtectedRoute from "@/components/reuseables/ProtectedRoute";

export function ProtectedParentRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute userTypes={['PARENT']}>
      {children}
    </ProtectedRoute>
  );
}

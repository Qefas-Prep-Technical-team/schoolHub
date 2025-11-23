// components/auth/ProtectedParentRoute.tsx


export function ProtectedParentRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedParentRoute >
      {children}
    </ProtectedParentRoute>
  );
}
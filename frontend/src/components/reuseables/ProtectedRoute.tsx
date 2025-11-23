// components/ProtectedRoute.tsx
"use client"
import { ReactNode } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import LoadingDashboard from './LoadingDashboard';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  userTypes?: string[];
  fallback?: ReactNode;
}

export default function ProtectedRoute({
  children,
  redirectTo = '/login',
  requireAuth = true,
  userTypes = [],
  fallback
}: ProtectedRouteProps) {
  const { isChecking, user } = useProtectedRoute({
    redirectTo,
    requireAuth,
    userTypes
  });

  if (isChecking) {
    return fallback || <LoadingDashboard message="Checking access..." />;
  }

  return <>{children}</>;
}
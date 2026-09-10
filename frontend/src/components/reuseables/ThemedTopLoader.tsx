'use client';

import { useTheme } from 'next-themes';
import NextTopLoader from 'nextjs-toploader';

import { useAuthStore } from '@/app/(auth)/login/services/auth-store';

export function ThemedTopLoader() {
  const { userType } = useAuthStore();

  const getLoaderColor = () => {
    switch (userType?.toUpperCase()) {
      case 'TEACHER':
        return '#10b981'; // Emerald 500
      case 'STUDENT':
        return '#8b5cf6'; // Violet 500
      case 'PARENT':
        return '#f59e0b'; // Amber 500
      case 'ADMIN':
      case 'SCHOOL_ADMIN':
        return '#3b82f6'; // Blue 500
      default:
        return '#2563eb'; // Default Blue 600
    }
  };

  return (
    <NextTopLoader
      color={getLoaderColor()}
      height={4}
      showSpinner={false}
      shadow={`0 0 10px ${getLoaderColor()}, 0 0 5px ${getLoaderColor()}`}
    />
  );
}

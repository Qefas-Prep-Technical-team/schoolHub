// components/AppInitializer.tsx
"use client"
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useEffect } from 'react';


export default function AppInitializer({
    children
}: {
    children: React.ReactNode
}) {
    const initialize = useAuthStore((state) => state.initialize);

    useEffect(() => {
        initialize();
    }, [initialize]);

    return <>{children}</>;
}
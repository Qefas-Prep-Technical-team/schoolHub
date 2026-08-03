// components/AppInitializer.tsx
"use client"
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useEffect } from 'react';

// Suppress harmless React 19 warnings caused by browser extensions injecting script tags
if (typeof window !== 'undefined') {
    const originalError = console.error;
    console.error = (...args: any[]) => {
        if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag while rendering React component')) {
            return;
        }
        originalError.apply(console, args);
    };
}

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

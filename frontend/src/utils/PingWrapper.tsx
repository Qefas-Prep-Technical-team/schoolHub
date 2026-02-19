// components/AuthWrapper.tsx
import StatusBar from '@/components/reuseables/StatusBar';
import { useEffect, useState } from 'react';

export const PingWrapper = ({ children }: { children: React.ReactNode }) => {
    const [isWaking, setIsWaking] = useState(true);

    useEffect(() => {
        // Ping your backend health-check or a simple GET route
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
            .then(() => setIsWaking(false))
            .catch(() => console.log("Backend is cold, starting up..."));
    }, []);

    return (
        <div>
            {isWaking && (
                <StatusBar />
            )}
            {children}
        </div>
    );
};
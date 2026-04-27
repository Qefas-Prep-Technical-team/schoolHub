// components/AuthWrapper.tsx
import PingOverlay from '@/components/reuseables/PingOverlay';
import { useEffect, useState } from 'react';

export const PingWrapper = ({ children }: { children: React.ReactNode }) => {
    const [isWaking, setIsWaking] = useState(true);

    useEffect(() => {
        // Ping your backend health-check or a simple GET route
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        // If the URL ends with /api, the health check at root might be better reachable via base domain, 
        // but adding it to /api is safer for this wrapper.
        fetch(`${apiUrl}/health`)
            .then(() => setIsWaking(false))
            .catch(() => console.log("Backend is cold, starting up..."));
    }, []);

    return (
        <div>
            {isWaking && (
                <PingOverlay />
            )}
            {children}
        </div>
    );
};

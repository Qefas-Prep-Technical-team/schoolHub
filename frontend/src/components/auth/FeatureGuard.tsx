import React, { ReactNode } from 'react';

interface FeatureGuardProps {
    role?: string;
    children: ReactNode;
}

export default function FeatureGuard({ role, children }: FeatureGuardProps) {
    return <>{children}</>;
}

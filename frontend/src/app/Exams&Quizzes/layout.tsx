import { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="relative flex min-h-screen w-full flex-col bg-page-background dark:bg-background-dark group/design-root overflow-x-hidden">
            {children}
        </div>
    );
}
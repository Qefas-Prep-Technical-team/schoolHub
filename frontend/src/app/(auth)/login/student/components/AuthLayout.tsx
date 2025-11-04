"use client";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
            <div className="flex flex-1 items-stretch">
                <div className="flex w-full max-w-full flex-col items-center justify-center lg:flex-row">
                    {children}
                </div>
            </div>
        </div>
    );
}

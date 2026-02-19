// app/dashboard/layout.tsx
"use client"

import { PingWrapper } from "@/utils/PingWrapper"




export default function Layout({ children }: { children: React.ReactNode }) {


    return (

        <main className="flex-1">
            <PingWrapper>
                {children}
            </PingWrapper>
        </main>

    )
}
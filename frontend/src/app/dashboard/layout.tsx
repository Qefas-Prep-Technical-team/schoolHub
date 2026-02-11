// app/dashboard/layout.tsx
"use client"




export default function Layout({ children }: { children: React.ReactNode }) {
 

    return (

        <main className="flex-1">
            {children}
        </main>

    )
}
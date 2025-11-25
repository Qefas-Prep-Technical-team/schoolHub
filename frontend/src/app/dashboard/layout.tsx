// app/dashboard/layout.tsx
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "../(auth)/login/services/auth-store"
import LoadingDashboard from "@/components/reuseables/LoadingDashboard";




export default function Layout({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const { user } = useAuthStore()
    const router = useRouter()

    // useEffect(() => {
    //     // Check if user is authenticated
    //     const token = document.cookie
    //         .split('; ')
    //         .find(row => row.startsWith('token='))
    //         ?.split('=')[1]

    //     if (!token) {
    //         router.push('/login')
    //     } else {
    //         const dash = user?.role?.toLowerCase()
    //         router.push((`/dashboard/${dash}`))
    //         setIsAuthenticated(true)
    //     }
    // }, [router])

    // // Show loading or nothing while checking auth
    // if (!isAuthenticated) {
    //     return <LoadingDashboard message="Checking authentication..." />;
    // }

    return (

        <main className="flex-1">
            {children}
        </main>

    )
}
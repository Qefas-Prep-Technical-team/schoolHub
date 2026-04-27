"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore"

export function PlatformStaffGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, staff } = usePlatformStaffStore()
    const router = useRouter()
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/auth/login?type=platform")
        } else {
            setIsChecking(false)
        }
    }, [isAuthenticated, router])

    if (isChecking) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                    <p className="text-sm font-medium text-slate-400">Verifying Platform Credentials...</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}

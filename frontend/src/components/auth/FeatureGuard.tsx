"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures"

interface FeatureGuardProps {
    role: 'student' | 'teacher' | 'parent' | 'admin'
    children: React.ReactNode
    // Optional mapping of path prefixes to feature keys
    // If not provided, we'll try to guess or use a default map
    routeMap?: Record<string, string>
}

// Default route to feature mapping for the whole platform
const DEFAULT_ROUTE_MAP: Record<string, string> = {
    // Parent
    "/dashboard/parent/billing": "billing",
    "/dashboard/parent/exams&results": "grades",
    "/dashboard/parent/assignments": "assignments",
    "/dashboard/parent/performance": "performance",
    "/dashboard/parent/attendance": "attendance",
    "/dashboard/parent/behavior": "behavior",
    "/dashboard/parent/messages": "messages",
    "/dashboard/parent/ai-insights": "aiInsights",
    "/dashboard/parent/resources": "resources",
    "/dashboard/parent/events": "events",
    
    // Teacher
    "/dashboard/teacher/billing": "billing",
    "/dashboard/teacher/exams&quizzes": "exams",
    "/dashboard/teacher/assignments": "assignments",
    "/dashboard/teacher/grades": "grades",
    "/dashboard/teacher/documents": "resources",
    
    // Student
    "/dashboard/student/billing": "billing",
    "/dashboard/student/exams&quizzes": "exams",
    "/dashboard/student/assignments": "assignments",
    "/dashboard/student/grades": "grades",
    "/dashboard/student/documents": "resources",
    "/dashboard/student/attendance": "attendance",

    // Admin
    "/dashboard/admin/billing": "billing",
    "/dashboard/admin/finance": "billing",
    "/dashboard/admin/exams": "exams",
    "/dashboard/admin/grades": "grades",
    "/dashboard/admin/students": "students",
    "/dashboard/admin/teachers": "teachers",
}

export default function FeatureGuard({ role, children, routeMap = DEFAULT_ROUTE_MAP }: FeatureGuardProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { data: features, isLoading } = useGlobalFeatures(role)

    useEffect(() => {
        if (isLoading || !features) return

        // Find if current path starts with any guarded route
        const activeGuard = Object.entries(routeMap).find(([path]) => 
            pathname === path || pathname.startsWith(`${path}/`)
        )

        if (activeGuard) {
            const [_, featureKey] = activeGuard
            if (features[featureKey] === false) {
                console.warn(`[FeatureGuard] Access denied to ${pathname}. Feature ${featureKey} is disabled.`)
                router.replace(`/dashboard/${role}`)
            }
        }
    }, [pathname, features, isLoading, router, role, routeMap])

    if (isLoading) return null // Or a loader

    return <>{children}</>
}

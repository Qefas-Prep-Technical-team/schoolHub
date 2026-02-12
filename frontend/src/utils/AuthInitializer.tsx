"use client"
import { useAuthStore } from '@/app/(auth)/login/services/auth-store'
import { useEffect } from 'react'
// import { useAuthStore } from '../store/auth-store'

export default function AuthInitializer() {
    const initializeAuth = useAuthStore((state) => state.initialize)

    useEffect(() => {
        initializeAuth()
    }, [initializeAuth])

    return null
}
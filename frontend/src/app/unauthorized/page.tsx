// app/unauthorized/page.tsx
"use client"
import Link from 'next/link';
import { useAuthStore } from '../(auth)/login/services/auth-store';


export default function UnauthorizedPage() {
    const { user } = useAuthStore();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-red-600 text-2xl">
                        block
                    </span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Access Denied
                </h1>

                <p className="text-gray-600 mb-4">
                    You don&apos;t have permission to access this page.
                </p>

                {user && (
                    <p className="text-sm text-gray-500 mb-6">
                        Logged in as: <strong>{user.email}</strong> ({user.role})
                    </p>
                )}

                <div className="space-y-3">
                    <Link
                        href="/dashboard"
                        className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors block"
                    >
                        Go to Dashboard
                    </Link>

                    <Link
                        href="/login"
                        className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors block"
                        onClick={() => useAuthStore.getState().clearAuth()}
                    >
                        Sign in with different account
                    </Link>
                </div>
            </div>
        </div>
    );
}
// app/unauthorized/page.tsx
"use client"
import Link from 'next/link';
import { useAuthStore } from '../(auth)/login/services/auth-store';


export default function UnauthorizedPage() {
    const { user } = useAuthStore();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 p-8 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl">
                        block
                    </span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Access Denied
                </h1>

                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You don&apos;t have permission to access this page.
                </p>

                {user && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                        Logged in as: <strong className="text-gray-900 dark:text-gray-300">{user.email}</strong> ({user.role})
                    </p>
                )}

                <div className="space-y-3">
                    <Link
                        href="/dashboard"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors block font-medium"
                    >
                        Go to Dashboard
                    </Link>

                    <Link
                        href="/login"
                        className="w-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors block font-medium"
                        onClick={() => useAuthStore.getState().clearAuth()}
                    >
                        Sign in with different account
                    </Link>
                </div>
            </div>
        </div>
    );
}

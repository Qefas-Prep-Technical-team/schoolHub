'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white p-8 dark:bg-slate-900">
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-red-900/20">
        <h2 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">Something went wrong!</h2>
        <p className="mb-6 text-slate-700 dark:text-slate-300 max-w-md break-words">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={() => reset()}
          className="rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

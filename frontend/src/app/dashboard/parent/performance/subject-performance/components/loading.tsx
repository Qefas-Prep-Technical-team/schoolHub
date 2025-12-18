export default function Loading() {
    return (
        <div className="flex h-screen w-full overflow-hidden">
            <main className="flex-1 flex flex-col h-full overflow-y-auto">
                <div className="animate-pulse">
                    {/* Header Skeleton */}
                    <div className="h-16 bg-gray-200 dark:bg-gray-800" />

                    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
                        {/* Page Heading Skeleton */}
                        <div className="space-y-4">
                            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                        </div>

                        {/* Stats Grid Skeleton */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl"
                                />
                            ))}
                        </div>

                        {/* Subject Cards Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
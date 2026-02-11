// app/student/classes/[id]/materials/components/LoadingState.tsx
export default function LoadingState() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      {/* Breadcrumbs Skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </div>

      {/* Header Skeleton */}
      <div className="mb-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Skeleton */}
        <div className="w-full lg:w-56">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3"></div>
          <div className="space-y-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1">
          {/* Search and View Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="w-full sm:w-64">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>

          {/* Materials List Skeleton */}
          <div className="mt-6 space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="grid grid-cols-12 items-center gap-4 p-4 rounded-lg bg-white dark:bg-gray-800">
                <div className="col-span-1">
                  <div className="size-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
                <div className="col-span-11 sm:col-span-5">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
                <div className="hidden sm:block sm:col-span-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </div>
                <div className="hidden sm:block sm:col-span-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
                <div className="col-span-11 sm:col-span-1">
                  <div className="size-9 bg-gray-200 dark:bg-gray-700 rounded-md ml-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
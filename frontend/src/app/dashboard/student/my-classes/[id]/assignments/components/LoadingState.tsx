// app/student/classes/[id]/assignments/components/LoadingState.tsx
export default function LoadingState() {
  return (
    <div className="flex gap-8 animate-pulse">
      {/* Sidebar Skeleton */}
      <div className="hidden lg:block w-80">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          
          <div className="rounded-xl border bg-white dark:bg-gray-800 p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-6"></div>
            <div className="space-y-8">
              {[1, 2].map(i => (
                <div key={i}>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3"></div>
                  <div className="space-y-2">
                    {[1, 2, 3].map(j => (
                      <div key={j} className="flex items-center gap-3">
                        <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1">
        <div className="space-y-6">
          {/* Search and Sort Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
            </div>
          </div>

          {/* Assignment Cards Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-xl border bg-white dark:bg-gray-800 p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="flex items-center gap-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
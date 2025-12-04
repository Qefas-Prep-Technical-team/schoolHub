// app/student/classes/[id]/components/LoadingState.tsx
export default function LoadingState() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="rounded-2xl bg-gray-200 dark:bg-gray-700 h-64 mb-4"></div>
      
      {/* Breadcrumbs Skeleton */}
      <div className="flex items-center space-x-2 mb-8">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Teacher Card Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
          
          {/* Table Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border">
            <div className="p-4 border-b">
              <div className="flex space-x-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                ))}
              </div>
            </div>
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Column Stats */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-1 mx-auto"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
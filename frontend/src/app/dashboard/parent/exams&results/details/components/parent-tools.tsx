"use client"

export default function ParentTools() {
  const handleMessageTeacher = () => {
    // Implement message teacher functionality
    console.log('Message teacher clicked')
  }

  const handleDownloadReport = () => {
    // Implement download report functionality
    console.log('Download report clicked')
  }

  const handleViewSubjectHistory = () => {
    // Implement view subject history functionality
    console.log('View subject history clicked')
  }

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
      <h3 className="text-sm uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-4">
        Actions
      </h3>
      <div className="flex flex-col gap-3">
        <button
          onClick={handleMessageTeacher}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">chat</span>
          Message Teacher
        </button>
        
        <button
          onClick={handleDownloadReport}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">download</span>
          Download Report
        </button>
        
        <button
          onClick={handleViewSubjectHistory}
          className="flex items-center justify-center gap-2 w-full py-2.5 text-primary dark:text-blue-400 hover:underline text-sm font-medium"
        >
          View Subject History
        </button>
      </div>
    </div>
  )
}
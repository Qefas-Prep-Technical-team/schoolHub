// app/components/ClassInformation.jsx
export default function ClassInformation() {
  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'English Literature',
    'History',
    'Computer Science'
  ]

  return (
    <div className="bg-white dark:bg-[#1C252E] rounded-xl shadow-sm p-6">
      <h2 className="text-[#0e141b] dark:text-slate-200 text-lg font-bold leading-tight tracking-[-0.015em] mb-4">
        Class Information
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 mb-4">
        <div className="flex flex-col gap-1 border-t border-solid border-slate-200 dark:border-slate-700 py-4">
          <p className="text-[#4e7397] dark:text-slate-400 text-sm font-normal leading-normal">
            Current Class/Section
          </p>
          <p className="text-[#0e141b] dark:text-slate-300 text-sm font-normal leading-normal">
            Grade 10 - Section B
          </p>
        </div>
        
        <div className="flex flex-col gap-1 border-t border-solid border-slate-200 dark:border-slate-700 py-4">
          <p className="text-[#4e7397] dark:text-slate-400 text-sm font-normal leading-normal">
            Class Teacher
          </p>
          <p className="text-primary text-sm font-medium leading-normal cursor-pointer hover:underline">
            Mr. Alan Turing
          </p>
        </div>
      </div>
      
      <div className="border-t border-solid border-slate-200 dark:border-slate-700 pt-4">
        <p className="text-[#4e7397] dark:text-slate-400 text-sm font-normal leading-normal mb-2">
          Subjects Enrolled
        </p>
        <ul className="text-[#0e141b] dark:text-slate-300 text-sm font-normal leading-normal list-disc list-inside space-y-1">
          {subjects.map((subject, index) => (
            <li key={index}>{subject}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
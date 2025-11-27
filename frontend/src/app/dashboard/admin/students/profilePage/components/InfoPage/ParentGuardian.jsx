// app/components/ParentGuardian.jsx
export default function ParentGuardian() {
  return (
    <div className="bg-white dark:bg-[#1C252E] rounded-xl shadow-sm p-6">
      <h2 className="text-[#0e141b] dark:text-slate-200 text-lg font-bold leading-tight tracking-[-0.015em] mb-4">
        Parent/Guardian
      </h2>
      
      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <p className="text-[#4e7397] dark:text-slate-400 text-sm font-normal leading-normal">
            Primary Parent
          </p>
          <p className="text-[#0e141b] dark:text-slate-300 text-sm font-normal leading-normal">
            Maria Vance
          </p>
        </div>
        
        <div className="flex flex-col gap-1">
          <p className="text-[#4e7397] dark:text-slate-400 text-sm font-normal leading-normal">
            Phone
          </p>
          <p className="text-[#0e141b] dark:text-slate-300 text-sm font-normal leading-normal">
            +1 (555) 987-6543
          </p>
        </div>
        
        <div className="flex flex-col gap-1">
          <p className="text-[#4e7397] dark:text-slate-400 text-sm font-normal leading-normal">
            Email
          </p>
          <p className="text-[#0e141b] dark:text-slate-300 text-sm font-normal leading-normal">
            maria.v@example.com
          </p>
        </div>
      </div>
      
      <button className="w-full mt-6 flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/10 dark:bg-primary/20 text-primary text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/20 dark:hover:bg-primary/30">
        <span className="truncate">View Full Parent Profile</span>
      </button>
    </div>
  )
}
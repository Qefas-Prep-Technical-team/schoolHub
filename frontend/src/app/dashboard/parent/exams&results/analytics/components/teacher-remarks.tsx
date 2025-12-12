"use client"

export default function TeacherRemarks() {
  const handleMessageTeacher = () => {
    console.log('Message teacher clicked')
  }

  return (
    <div className="bg-gradient-to-br from-primary/5 to-blue-50 dark:from-card-dark dark:to-slate-800/50 p-6 rounded-xl border border-blue-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-2 -mr-2 text-primary/10 dark:text-slate-700/50">
        <span className="material-symbols-outlined text-[100px]">format_quote</span>
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 relative z-10">
        Teacher&apos;s Note
      </h3>
      
      <p className="text-sm italic text-slate-600 dark:text-slate-300 mb-6 relative z-10 leading-relaxed">
        &apos;Sarah has shown remarkable curiosity this term. She often helps her peers during group exercises and is mastering complex shapes quickly. I&apos;d recommend spending a bit more time on fraction word problems at home.&apos;
      </p>

      <div className="flex items-center gap-3 relative z-10">
        <div 
          className="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-600 shadow-sm"
          style={{
            backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB_WT3fF8UWStLWbUy1No61rvlyClGEl2i_Q4lBLrUX6SDqv7ndtJE0HVfRuAlDZl8-Fu0cIrSLgsDq1IyoPCRnwVnATHH7pUVaII7COpT6M2UfDcxZrME6OSso_0eeFgrJAyO6GQFqLJWSPhKNcnVBgAbf0aHsGkfE_ITJS_EUGqI0eBMtXC4grK1cWvb2Tpo2jB4vV8SCMs0BH9BGV9KuN9KSRTfCUNec5pl7Ro8j1gHc4QJfjkSQf9QPCANnbv3gc8rhBVLCQ1w")'
          }}
        />
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            Mr. Anderson
          </p>
          <p className="text-xs text-slate-500">Mathematics Dept.</p>
        </div>
        <button
          onClick={handleMessageTeacher}
          className="ml-auto p-2 bg-white dark:bg-slate-700 rounded-lg text-primary hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">chat</span>
        </button>
      </div>
    </div>
  )
}
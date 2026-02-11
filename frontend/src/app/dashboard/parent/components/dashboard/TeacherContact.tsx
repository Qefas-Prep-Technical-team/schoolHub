import React from 'react'
import Image from 'next/image'

export default function TeacherContact() {
  return (
    <div className="bg-card-light dark:bg-card-dark p-5 rounded-xl shadow-sm border border-border-light dark:border-border-dark flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="relative size-14 rounded-full overflow-hidden border border-border-light dark:border-border-dark">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAEZt1J68L1Mur75tolZulyrpZjPeyQYTSyXRxUHNCNFgpfNhzp59YMJva4Px4gxZtMbJ0JSUsMaLdjGB73bH1-oOqE-BuGFSP4oP0PeFiiELMUqNFutQR0WwMaUnOtEdw_-S895LRaCN_5ni4Kpr83UF9749YtvuC_XZfKid8WrTxtwidFU7gTseX24GlBUZYYRj9S42RrJ3qY4O6z8g55Nnrmbfw9JiyKmN5EaLG6NnvdlY8SX5aKUNnIoHBohyeT_rGQ9OsLxc"
            alt="Portrait of Class Teacher Mrs. Sarah Connor"
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">Mrs. Sarah Connor</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">Class Teacher (5-B)</p>
        </div>
      </div>
      
      <div className="flex gap-3 w-full sm:w-auto">
        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
          Schedule
        </button>
        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <span className="material-symbols-outlined text-[18px]">chat</span>
          Message
        </button>
      </div>
    </div>
  )
}
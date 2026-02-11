'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Search, Bell } from 'lucide-react'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border-light dark:border-border-dark bg-surface-light/80 dark:bg-surface-dark/80 px-6 py-3 backdrop-blur-md">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-text-sec-light dark:text-text-sec-dark">
        <a href="#" className="hover:text-primary transition-colors">Home</a>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <a href="#" className="hover:text-primary transition-colors">Child Dashboard</a>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-text-main-light dark:text-text-main-dark font-medium">
          Exams & Quizzes
        </span>
      </nav>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-sec-light size-5" />
          <input
            type="text"
            placeholder="Search assessments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-64 rounded-xl border-none bg-background-light dark:bg-background-dark pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary dark:text-white placeholder:text-text-sec-light/50"
          />
        </div>

        {/* Notifications */}
        <button className="relative rounded-full p-2 hover:bg-background-light dark:hover:bg-background-dark text-text-sec-light transition-colors">
          <Bell className="size-5" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-red-500 border-2 border-surface-light dark:border-surface-dark"></span>
        </button>

        {/* Parent Profile */}
        <div className="relative size-8">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRlyUPPGi2qTQzQ1Ypy--lA5TLCpeDy5Bs8WwcOGQtqSnBXDVxu76y-hXLfRREdLN9l2oEdw81gdG5YHmohhv7NzeEwfW44-pX45TBZHuugInh2eD3AqEsqn8pkTUClm62taw0U-xtOCpNCVDIIWegzjy5lpziE0J0SUSTnQ1CBO1VY-TlXGVW87YEvh9YBYKBA165gJeanmreYkbhjtEyeuNT1ku1gUilvUCeJAwJIT2AkEBgqHm9mr4zEMNewSnokAXv4-uuBqw"
            alt="Parent profile picture"
            fill
            className="rounded-full object-cover"
          />
        </div>
      </div>
    </header>
  )
}
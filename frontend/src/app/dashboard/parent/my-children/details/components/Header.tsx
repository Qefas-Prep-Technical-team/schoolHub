'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Search, Bell, School } from 'lucide-react'
import { Input } from './ui/Input'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#1a2230]/80 backdrop-blur-md px-4 sm:px-10 py-3">
      <div className="flex items-center gap-4 text-slate-900 dark:text-white">
        <div className="size-8 text-primary">
          <School className="w-full h-full" />
        </div>
        <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">
          EduPortal
        </h2>
      </div>

      <div className="flex items-center justify-end gap-4 sm:gap-8">
        <div className="hidden sm:flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 text-sm w-64 placeholder:text-slate-400 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        <button className="relative p-2 text-slate-500 hover:text-primary dark:text-slate-400 transition-colors">
          <Bell className="size-5" />
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full" />
        </button>

        <div className="relative">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFi-umGK4KS1cmcQB47yB1PAISxtke0iEnPUpTl0yBfN536KKyXWR9eKMWQi0YH3rKORsPl0iaWaYL2x3fPoffDqdrl8SKf5X97m6MLmR87wmeZGCOyYFZMSOJF2oWNtTQG-Jz1l4NFoqPN6hAt-EwZ-GO-AF0B8mrqP6LVNGL89fdcI-mYHvVjNmZq-G0v4F_lafhlbefjuSobmxtpeWlzrslZmb-4q7SqlTE0vLl6vqLrGlA2B8B5ybNe5c4paSraOSu9lXm2sc"
            alt="Parent profile picture showing a smiling man"
            width={40}
            height={40}
            className="rounded-full border-2 border-white dark:border-slate-700 shadow-sm cursor-pointer object-cover"
          />
        </div>
      </div>
    </header>
  )
}
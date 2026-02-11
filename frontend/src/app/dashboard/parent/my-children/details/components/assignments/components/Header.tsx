'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Search, Bell, Menu, ChevronDown } from 'lucide-react'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="h-16 flex items-center justify-between px-6 lg:px-10 border-b border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark shrink-0">
      {/* Mobile Menu */}
      <div className="flex items-center gap-2 md:hidden text-text-main dark:text-white">
        <Menu className="size-6" />
      </div>

      {/* Search Bar */}
      <div className="hidden md:flex flex-1 max-w-lg">
        <label className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
            <Search className="size-5" />
          </div>
          <input
            type="text"
            placeholder="Search across assignments, grades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full p-2.5 pl-10 text-sm text-text-main dark:text-white bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-text-muted"
          />
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-text-muted hover:text-primary transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell className="size-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-muted hidden sm:block">
            Viewing:
          </span>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors">
            <div className="relative size-6">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWBSHyNS4KmjX4D328QymrqBVgPD8yd2dXyx-y_mm3hsZOYnBskj4-9dA1iTBpxeJWDIfUnSfl619l8Umw0rdr-RY2XPBUBwlm80KGWHBXNkDEVjd7JKRbEmPCEMN1fEy5LtflA8fMWUYxcbK1De2GaR69wy2lCQMi30nLlM7UDDm4Hr_hF8BzcK8HuW9QKLO4p9VRVtQpn7vbsFEG3-CIlnLMUx_LpmlzhokOBFtuz2er7vtp0L9DA4uxIM3xVJThYAF0M4DNZZ0"
                alt="Child profile image Alex"
                fill
                className="rounded-full object-cover"
              />
            </div>
            Alex Doe
            <ChevronDown className="size-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Search, Bell, Menu, ChevronDown } from 'lucide-react'


export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="h-16 flex items-center justify-between border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-6 lg:px-8 py-3 shrink-0">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger */}
        <button className="lg:hidden text-text-main-light dark:text-text-main-dark">
          <Menu className="size-6" />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight">Academics</h2>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-background-light dark:bg-background-dark rounded-lg px-3 py-2 w-64 border border-transparent focus-within:border-primary transition-all">
          <Search className="text-text-secondary-light dark:text-text-secondary-dark size-5" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm ml-2 w-full text-text-main-light dark:text-text-main-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:ring-0"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-background-light dark:hover:bg-background-dark text-text-secondary-light dark:text-text-secondary-dark transition-colors">
          <Bell className="size-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-surface-dark"></span>
        </button>

        {/* Child Switcher */}
        <div className="flex items-center gap-3 pl-4 border-l border-border-light dark:border-border-dark">
          <div className="relative size-9">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7DuBxkwfuCiFhQPKt4T6QgtI846D9B_PtKG5ZcLr0ZEa_3Z-nnsgfJLF28AQcWweoW3qycOZIjrLVFjD-7qYZLSjIb5CcXZBKkQ-N40UoAhr8VqovyjyQtU5KzcX4OJ5RlISCYTDFISmsVwjyhp_gAQIzx2eslqR06HyqGdZdLqtoNdlIYZ4dR0FzExJ5ik-Jwv-c3xUUhYTWw2Ws8WFGXd4B2RlEeapVdCMImyu4WOhymLBM74JQrReEj6MrpMADEGA70wWaGto"
              alt="Child profile picture"
              fill
              className="rounded-full ring-2 ring-primary/20 object-cover"
            />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-bold leading-none">Alex Richardson</p>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
              Grade 5 - Class 5B
            </p>
          </div>
          <ChevronDown className="text-text-secondary-light dark:text-text-secondary-dark size-5" />
        </div>
      </div>
    </header>
  )
}
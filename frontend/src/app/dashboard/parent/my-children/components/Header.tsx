'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface NavItem {
  label: string
  href: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '#' },
  { label: 'Messages', href: '#' },
  { label: 'School Calendar', href: '#' },
  { label: 'Settings', href: '#' },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-10 py-3">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">
            SchoolMate
          </h2>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        
        {/* User Actions */}
        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          
          <div className="flex items-center gap-3 pl-2 sm:border-l border-slate-200 dark:border-slate-700">
            <button className="hidden sm:flex h-9 px-4 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Log Out
            </button>
            
            <div className="relative size-9 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-700 shadow-sm">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkvnWR1txjHi1BZyAeZDY69162uo0_WNViWKzJPrV1umy2mnDrhhifY7ke9vwnS316PP3JY8ueR-6VToFRwwzUiCC9VwWXrJzTg5qfklq1_oTbuUEXccMMc3PxJj2zhcq6I-Xw4bArWuqMkAM1YqAe97ELlF-kgeuiXCvy99U01eUIaR_m8TD2m91pT7mSbUMvfIbaoMc5zIb409aL-sd3p6um5yzjfzsrOTq0tluQU1-2xMwsTwwI9-ZPlJKuzlFdO-9emF7R0dU"
                alt="Profile photo of a parent smiling"
                fill
                className="object-cover"
                sizes="36px"
              />
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <button className="md:hidden flex items-center justify-center text-slate-700 dark:text-slate-200">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </header>
  )
}
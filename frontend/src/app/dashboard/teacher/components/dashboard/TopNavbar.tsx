'use client';

import { Search, Bell, PlusCircle } from 'lucide-react';
import { useState } from 'react';

interface TopNavbarProps {
  onCreateNew: () => void;
}

export default function TopNavbar({ onCreateNew }: TopNavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 md:px-6 lg:px-8 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      {/* Search Bar */}
      <div className="flex items-center gap-4 lg:gap-8">
        <div className="relative hidden md:flex">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for students, classes..."
            className="w-64 lg:w-80 pl-10 pr-4 py-2 rounded-lg bg-gray-200/50 dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        {/* Create New Button */}
        <button
          onClick={onCreateNew}
          className="flex items-center justify-center gap-2 px-3 lg:px-4 h-9 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Create New</span>
        </button>

        {/* Notifications */}
        <button className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Bell className="w-5 h-5" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </span>
          )}
        </button>

        {/* User Avatar */}
        <div className="relative">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 border-2 border-white dark:border-gray-800"
            style={{
              backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDDtIZ14OKpbOc_Aca80HwJl4_vb5kEU2a9rZDCqckzXmEjOBFnrnNmGVV4y20ode1TuHn1RlJArENKftGKclLM44wu55AYSDceuy87G-Mgvy8utYAEv8V7NcxLerh9M02aWvbYduO9h3Z6GXnOs91h7ovpeI3JDCbDmW0kNaeU0VJJ3a4ykGw6uEONtg9xohXEnWDKtzMnEnEzh5L4DxKCPgxb8UQXtadkhDxLq6FkPqX_yOuTNQiwQkMOR6Hve1bATQYtNEaXgV8")',
            }}
          />
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white dark:border-gray-800"></div>
        </div>
      </div>
    </header>
  );
}
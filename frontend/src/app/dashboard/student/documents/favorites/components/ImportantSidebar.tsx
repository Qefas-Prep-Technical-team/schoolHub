'use client';

import { User, NavItem } from './types';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  LayoutDashboard,
  Folder,
  Book,
  BarChart3,
  User as UserIcon,
  Settings,
  LogOut,
} from 'lucide-react';

interface ImportantSidebarProps {
  user: User;
  navItems: NavItem[];
  bottomNavItems: NavItem[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  folder: Folder,
  book: Book,
  bar_chart: BarChart3,
  person: UserIcon,
  settings: Settings,
  logout: LogOut,
};

export default function ImportantSidebar({ 
  user, 
  navItems, 
  bottomNavItems 
}: ImportantSidebarProps) {
  const [activeItem, setActiveItem] = useState('Documents');

  return (
    <aside className="flex h-screen min-h-full w-64 flex-col bg-white dark:bg-gray-900 p-4 sticky top-0 border-r border-gray-200 dark:border-gray-800">
      <div className="flex h-full flex-col justify-between">
        {/* Top Section */}
        <div className="flex flex-col gap-4">
          {/* User Profile */}
          <div className="flex items-center gap-3 p-2">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={user.avatarUrl}
                alt={user.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-medium text-gray-900 dark:text-white">
                {user.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Student ID: {user.studentId}
              </p>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = activeItem === item.label;
              
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setActiveItem(item.label)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {Icon && (
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Navigation */}
        <div className="flex flex-col gap-1">
          {bottomNavItems.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {Icon && <Icon className="w-5 h-5 text-gray-500" />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
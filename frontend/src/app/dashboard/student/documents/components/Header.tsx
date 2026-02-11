'use client';

import { Button } from './ui/Button';
import { Bell, Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showNotifications?: boolean;
  onMenuClick?: () => void;
}

export default function Header({ 
  title = "Documents",
  subtitle = "Manage all your school-related files in one place.",
  showNotifications = true,
  onMenuClick
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="mb-8">
      {/* Top bar with notifications and theme toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          {onMenuClick && (
            <Button
            link="" 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}
          
          {/* Breadcrumb/Title for mobile */}
          <div className="md:hidden">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button
          link=''
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9"
          >
            {mounted ? (
              theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          {/* Notifications */}
          {showNotifications && (
            <Button link="" variant="ghost" size="icon" className="h-9 w-9 relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="sr-only">Notifications</span>
            </Button>
          )}
          
          {/* User profile */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Alex Morgan
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Student ID: 12345
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
          </div>
        </div>
      </div>

      {/* Main page heading */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
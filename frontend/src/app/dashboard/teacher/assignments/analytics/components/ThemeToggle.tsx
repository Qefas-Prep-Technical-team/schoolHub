'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    const currentActive = resolvedTheme || (theme === 'dark' ? 'dark' : 'light');
    const nextTheme = currentActive === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const isDarkActive = mounted
    ? (resolvedTheme ? resolvedTheme === 'dark' : theme === 'dark')
    : false;

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
      aria-label="Toggle theme"
      title={isDarkActive ? "Switch to Light Theme" : "Switch to Dark Theme"}
    >
      {isDarkActive ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700" />
      )}
    </button>
  );
}

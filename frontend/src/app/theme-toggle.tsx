"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    // Determine the active applied theme (resolves 'system' -> 'dark' or 'light')
    const currentActive = resolvedTheme || (theme === "dark" ? "dark" : "light");
    const nextTheme = currentActive === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  const isDarkActive = mounted
    ? (resolvedTheme ? resolvedTheme === "dark" : theme === "dark")
    : false;

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full cursor-pointer relative border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
      onClick={handleToggle}
      title={isDarkActive ? "Switch to Light Theme" : "Switch to Dark Theme"}
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 text-amber-500 transition-all duration-300 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 text-indigo-400 transition-all duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle Theme</span>
    </Button>
  );
}

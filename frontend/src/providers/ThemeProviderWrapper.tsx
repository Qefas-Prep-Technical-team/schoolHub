'use client';

import { useSessionStore } from '@/store/useSessionStore';
import { ThemeProvider } from 'next-themes';
import { ReactNode, useEffect } from 'react';


export function ThemeProviderWrapper({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useSessionStore();

  // Keep zustand and next-themes in sync
  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}

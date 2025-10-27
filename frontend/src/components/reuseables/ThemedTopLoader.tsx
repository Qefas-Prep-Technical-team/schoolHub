'use client';

import { useTheme } from 'next-themes';
import NextTopLoader from 'nextjs-toploader';

export function ThemedTopLoader() {
  const { theme } = useTheme();

  return (
    <NextTopLoader
      color={theme === 'dark' ? '#60a5fa' : '#fff'} // blue for both, lighter in dark
      height={3}
      showSpinner={false}
    />
  );
}

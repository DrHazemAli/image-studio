'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return {
      theme: 'system' as Theme,
      resolvedTheme: 'light' as 'light' | 'dark',
      setTheme: () => {},
    };
  }

  return {
    theme: theme as Theme,
    resolvedTheme: resolvedTheme as 'light' | 'dark',
    setTheme: (newTheme: Theme) => setTheme(newTheme),
  };
}
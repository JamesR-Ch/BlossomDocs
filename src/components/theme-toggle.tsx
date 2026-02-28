'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/theme-store';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme, setTheme } = useThemeStore();

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('blossom-theme');
      if (stored === 'dark' || stored === 'light') {
        setTheme(stored);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      }
    } catch {}
  }, [setTheme]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-full"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 transition-transform duration-300 rotate-0" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-300 rotate-0" />
      )}
    </Button>
  );
}

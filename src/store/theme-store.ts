'use client';

import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'light',
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === 'light' ? 'dark' : 'light';
      applyThemeToDOM(next);
      return { theme: next };
    }),
  setTheme: (t) => {
    applyThemeToDOM(t);
    set({ theme: t });
  },
}));

function applyThemeToDOM(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  // Persist preference
  try {
    localStorage.setItem('blossom-theme', theme);
  } catch {}
}

// Theme store for dark/light mode toggle
// Manages theme state and persistence

import { create } from 'zustand';

interface ThemeStore {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  isDark: true, // Default to dark mode
  
  toggleTheme: () => set((state) => {
    const newTheme = !state.isDark;
    localStorage.setItem('mano-pro-theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
    return { isDark: newTheme };
  }),
  
  setTheme: (isDark) => {
    localStorage.setItem('mano-pro-theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
    set({ isDark });
  }
}));

// Initialize theme from localStorage or default to dark
const savedTheme = localStorage.getItem('mano-pro-theme');
const isDark = savedTheme ? savedTheme === 'dark' : true;
useThemeStore.getState().setTheme(isDark);
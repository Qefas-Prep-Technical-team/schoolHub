import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionState {
  user: { name: string; email: string } | null;
  theme: 'light' | 'dark';
  setUser: (user: SessionState['user']) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      theme: 'light',
      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
      clearSession: () => set({ user: null, theme: 'light' }),
    }),
    {
      name: 'session-storage', // key in localStorage
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

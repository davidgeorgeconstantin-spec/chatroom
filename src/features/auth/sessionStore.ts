import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { createId } from '@/lib/id';

export const AVATAR_COLORS = ['#10b981', '#0ea5e9', '#8b5cf6', '#f43f5e', '#f59e0b', '#14b8a6', '#ec4899'];

interface SessionState {
  user: User | null;
  join: (name: string, color: string) => void;
  leave: () => void;
}

// sessionStorage: each TAB can be a different person (useful to test the chat with 2 tabs)
export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      join: (name, color) => set({ user: { id: createId(), name: name.trim(), color } }),
      leave: () => set({ user: null }),
    }),
    { name: 'chatroom:session', storage: { getItem: (k) => JSON.parse(sessionStorage.getItem(k) ?? 'null'), setItem: (k, v) => sessionStorage.setItem(k, JSON.stringify(v)), removeItem: (k) => sessionStorage.removeItem(k) } },
  ),
);

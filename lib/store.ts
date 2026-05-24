import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "firebase/auth";

interface SidebarState {
  openStatus: boolean;
  expanedGroup: string;
  toggleStatus: () => void;
  setExpanedGroup: (group: string) => void;
}

interface AuthState {
  user: User | null;
  role: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      openStatus: true,
      expanedGroup: "General",
      toggleStatus: () => {
        set((state) => ({ openStatus: !state.openStatus }));
      },
      setExpanedGroup: (group: string) => set({ expanedGroup: group }),
    }),
    {
      name: "sidebar-storage",
    }
  )
);

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  role: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setLoading: (loading) => set({ isLoading: loading }),
}));

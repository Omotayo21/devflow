import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  activeWorkspaceId: string | null;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  setActiveWorkspace: (id: string | null) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      sidebarCollapsed: false,
      theme: 'dark',

      setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'devflow-ui',
      partialize: (state) => ({ 
        activeWorkspaceId: state.activeWorkspaceId, 
        theme: state.theme 
      }),
    }
  )
);

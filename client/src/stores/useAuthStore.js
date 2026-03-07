import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken) => set({ 
        user, 
        accessToken, 
        isAuthenticated: !!user 
      }),

      logout: () => set({ 
        user: null, 
        accessToken: null, 
        isAuthenticated: false 
      }),

      updateUser: (user) => set((state) => ({ 
        user: { ...state.user, ...user } 
      })),
    }),
    {
      name: 'devflow-auth',
      // only persist user info, not the access token (best practice for security)
      // however, we'll persist for now and handle refresh on boot
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

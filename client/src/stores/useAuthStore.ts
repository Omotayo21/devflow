import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAccessToken: (token: string | null) => void;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAccessToken: (token) => set({ accessToken: token }),

      login: (user, accessToken) => set({ 
        user, 
        accessToken, 
        isAuthenticated: true 
      }),

      logout: () => set({ 
        user: null, 
        accessToken: null, 
        isAuthenticated: false 
      }),

      updateUser: (user) => set((state) => ({ 
        user: state.user ? { ...state.user, ...user } : null
      })),
    }),
    {
      name: 'devflow-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

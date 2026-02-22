import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  plan?: 'free' | 'pro' | 'team';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  // Función simulada para desarrollo sin backend
  loginDemo: (plan?: 'free' | 'pro' | 'team') => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      
      setToken: (token) => set({ token }),
      
      login: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false 
      }),

      // Login simulado para desarrollo
      loginDemo: (plan = 'free') => set({
        user: {
          id: 'demo-user-123',
          email: 'demo@orion-ai.com',
          name: 'Usuario Demo',
          plan: plan
        },
        token: 'demo-token-' + Date.now(),
        isAuthenticated: true
      }),
    }),
    {
      name: 'orion-auth-storage',
    }
  )
);
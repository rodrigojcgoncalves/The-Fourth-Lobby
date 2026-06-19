import { create } from 'zustand';
import { UserRole } from '../types';


export interface CustomUser {
  id: string;
  email: string;
  role: UserRole | null;
  fullName?: string;
}

interface AuthState {
  user: CustomUser | null;
  role: UserRole | null;
  loading: boolean;
  initialize: () => Promise<void>;
  signOut: () => void;
  setUser: (user: CustomUser | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  loading: true,

  setUser: (user) => set({ user, role: user?.role || null }),

  initialize: async () => {
    set({ loading: true });
    
    const token = localStorage.getItem('jwt_token');
    
    if (token) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          set({ 
            user: data.user, 
            role: data.user.role as UserRole, 
            loading: false 
          });
        } else {
          localStorage.removeItem('jwt_token');
          set({ user: null, role: null, loading: false });
        }
      } catch (err) {
        set({ user: null, role: null, loading: false });
      }
    } else {
      set({ user: null, role: null, loading: false });
    }
  },

  signOut: () => {
    localStorage.removeItem('jwt_token');
    set({ user: null, role: null, loading: false });
  }
}));
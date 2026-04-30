import { create } from 'zustand';

export type UserRole = 'customer' | 'promoter' | 'organizer' | null;

export interface CustomUser {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
}

interface AuthState {
  user: CustomUser | null;
  role: UserRole;
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
        const response = await fetch('http://localhost:5000/api/auth/me', {
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
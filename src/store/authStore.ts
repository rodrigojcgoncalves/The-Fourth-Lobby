import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

// Definimos os papéis possíveis para maior segurança
export type UserRole = 'customer' | 'promoter' | 'organizer' | null;

interface AuthState {
  user: User | null;
  session: Session | null;
  role: UserRole;
  loading: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  role: null,
  loading: true,

  initialize: async () => {
    set({ loading: true });
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      set({ 
        session, 
        user: session.user, 
        role: profile?.role as UserRole, 
        loading: false 
      });
    } else {
      set({ session: null, user: null, role: null, loading: false });
    }

    // Escuta mudanças (login/logout)
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        set({ 
          session, 
          user: session.user, 
          role: profile?.role as UserRole, 
          loading: false 
        });
      } else {
        set({ session: null, user: null, role: null, loading: false });
      }
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, role: null, loading: false });
  }
}));
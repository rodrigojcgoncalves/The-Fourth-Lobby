import { supabase } from '../lib/supabase'
import { UserRole } from '../store/authStore'

export const authService = {
  // Login via Supabase Auth e recuperação do "role" do utilizador na tabela pública
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single()

    return { ...data.user, role: profile?.role as UserRole }
  },

  // Registo de novo utilizador no Auth e propagação para a tabela users
  register: async (email: string, password: string, fullName: string, role: UserRole = 'customer') => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { role, full_name: fullName } } 
    })
    if (error) throw error
    
    // Cria user profile na tabela public.users
    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        role,
      })
    }
    
    return data
  }
}
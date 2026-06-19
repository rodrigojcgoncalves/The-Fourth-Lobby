import { UserRole } from '../types'

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

export const authService = {
  // Login via custom backend (Hash & JWT)
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao efetuar login');
    }

    // Guarda o token no localStorage para ser usado em rotas protegidas
    localStorage.setItem('jwt_token', data.token);

    return data.user;
  },

  // Registo via custom backend
  register: async (email: string, password: string, fullName: string, role: UserRole = 'customer') => {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, fullName, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao efetuar registo');
    }

    localStorage.setItem('jwt_token', data.token);

    return data;
  }
}
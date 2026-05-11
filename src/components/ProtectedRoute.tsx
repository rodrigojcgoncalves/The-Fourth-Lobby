import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: ('customer' | 'promoter' | 'organizer')[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const user = useAuthStore((state) => state.user);
    const role = useAuthStore((state) => state.role);
    const loading = useAuthStore((state) => state.loading);

    // 1. Aguardar inicialização da store (evita redirecionamento prematuro)
    if (loading) {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
                <p style={{ color: '#00d4ff', opacity: 0.7 }}>A validar sessão...</p>
            </div>
        );
    }

    // 2. Não autenticado → /login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Autenticado mas sem permissão para esta rota → homepage
    if (allowedRoles && !allowedRoles.includes(role as any)) {
        console.warn(`[RBAC] Utilizador '${user.email}' (${role}) sem permissão para rota restrita a [${allowedRoles.join(', ')}].`);
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
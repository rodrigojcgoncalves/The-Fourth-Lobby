import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Definimos o que o componente espera receber
interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: ('customer' | 'promoter' | 'organizer')[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const user = useAuthStore((state) => state.user);
    const role = useAuthStore((state) => state.role);
    const loading = useAuthStore((state) => state.loading);

    if (loading) {
    return (
        <div className="flex h-screen items-center justify-center">
        <p>A carregar permissões...</p>
        </div>
    );
    }

  // Se não está logado, vai para o login
    if (!user) {
    return <Navigate to="/login" replace />;
    }

  // Se o role do utilizador não estiver na lista permitida
    if (allowedRoles && !allowedRoles.includes(role as any)) {
    return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
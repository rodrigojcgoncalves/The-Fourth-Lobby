import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User } from '../../types';
import './Header.css';

// Importar o logo (via alias @img configurado no vite.config.ts)
import logoIcon from '@img/fourthdimension_logo.png';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
}

export default function Header({ currentUser, onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isOrganizerView = location.pathname.startsWith('/organizer') || location.pathname.startsWith('/create-event');

  let formattedName = '';
  if (currentUser) {
    const displayName = currentUser.fullName || currentUser.email?.split('@')[0] || '';
    formattedName = displayName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  return (
    <header className={`header ${isOrganizerView ? 'header--organizer' : ''}`}>
      <div className="header-content">

        {/* ── Logo (Esquerda) ── */}
        <Link to="/" className="logo">
          <img src={logoIcon} alt="The Fourth Lobby" className="logo-img" />
          <span className="logo-text">The Fourth Lobby</span>
        </Link>

        {/* ── Barra de Pesquisa (Centro-esquerda) ── */}
        <form className="search-container" onSubmit={e => e.preventDefault()}>
          <div className="search-bar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input type="text" placeholder="Search events, artists..." />
          </div>
        </form>

        {/* ── Navegação (Direita) — varia conforme a role ── */}
        <nav className="nav-links">

          {/* Sempre visível: Tickets */}
          <button className="nav-link" onClick={() => navigate('/tickets')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
            </svg>
            Tickets
          </button>

          {/* Visível apenas para Promotores */}
          {currentUser?.role === 'promoter' && (
            <button className="nav-link" onClick={() => navigate('/portal-promotor')}>
              Portal de Promotor
            </button>
          )}

          {/* Visível apenas para Organizadores */}
          {currentUser?.role === 'organizer' && (
            <button className="nav-link nav-link--organizer" onClick={() => navigate('/organizer')}>
              Organizer
            </button>
          )}

          {/* Autenticado: Perfil + Logout | Não autenticado: Login */}
          {currentUser ? (
            <>
              <button className="nav-link" onClick={() => navigate('/profile')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {formattedName}
              </button>
              <button className="btn-login" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <button className="btn-login" onClick={() => navigate('/login')}>
              Login
            </button>
          )}
        </nav>

      </div>
    </header>
  );
}

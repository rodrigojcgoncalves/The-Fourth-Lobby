import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Event } from '../../types';
import { residents } from '../../data/residents';
import './Header.css';
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
  const { t, i18n } = useTranslation();
  const isOrganizerView = location.pathname.startsWith('/organizer') || location.pathname.startsWith('/create-event');

  // Estado da Pesquisa
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [eventResults, setEventResults] = useState<Event[]>([]);
  const [residentResults, setResidentResults] = useState(residents);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('en') ? 'pt' : 'en';
    i18n.changeLanguage(nextLang);
  };

  // Buscar eventos na montagem para pesquisa rápida
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/events`)
      .then(res => res.json())
      .then(data => setAllEvents(data || []))
      .catch(err => console.error('Error fetching events for search:', err));
  }, []);

  // Helper: normalizar texto (remove acentos e caracteres especiais)
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[øö]/g, 'o')
      .replace(/[ë]/g, 'e')
      .replace(/[æ]/g, 'ae');

  // Filtragem
  useEffect(() => {
    if (!searchTerm.trim()) {
      setEventResults([]);
      setResidentResults([]);
      return;
    }
    const term = normalize(searchTerm);
    
    setEventResults(
      allEvents.filter(e => 
        (e.name && normalize(e.name).includes(term)) || 
        (e.location && normalize(e.location).includes(term))
      ).slice(0, 4)
    );

    setResidentResults(
      residents.filter(r => 
        normalize(r.name).includes(term) || 
        r.genres.some(g => normalize(g).includes(term)) ||
        (r.hiddenSearchTerms && r.hiddenSearchTerms.some(ht => normalize(ht) === term))
      )
    );
  }, [searchTerm, allEvents]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (path: string) => {
    navigate(path);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

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

        {/* ── Esquerda (Toggle + Logo) ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Toggle Idioma */}
          <button className="nav-link lang-toggle" onClick={toggleLanguage} style={{ padding: '0.3rem 0.6rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span className={i18n.language.startsWith('pt') ? 'active' : ''}>PT</span>
            <span className="separator">|</span>
            <span className={i18n.language.startsWith('en') ? 'active' : ''}>EN</span>
          </button>

          <Link to="/" className="logo">
            <img src={logoIcon} alt="The Fourth Lobby" className="logo-img" />
            <span className="logo-text">The Fourth Lobby</span>
          </Link>
        </div>

        {/* ── Barra de Pesquisa (Centro-esquerda) ── */}
        <div className="search-container" ref={searchRef}>
          <form className="search-bar" onSubmit={e => e.preventDefault()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input 
              type="text" 
              placeholder="Search events, artists..." 
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => {
                if (searchTerm.trim()) setIsDropdownOpen(true);
              }}
            />
          </form>

          {isDropdownOpen && searchTerm.trim() && (eventResults.length > 0 || residentResults.length > 0) && (
            <div className="search-dropdown">
              {eventResults.length > 0 && (
                <div className="search-section">
                  <div className="search-section-title">Events</div>
                  {eventResults.map(ev => (
                    <div key={ev.id} className="search-item" onClick={() => handleResultClick(`/events/${ev.slug}`)}>
                      {ev.image_url && <img src={ev.image_url} alt={ev.name} className="search-item-img" />}
                      <div className="search-item-info">
                        <h4>{ev.name}</h4>
                        <span>{new Date(ev.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {residentResults.length > 0 && (
                <div className="search-section">
                  <div className="search-section-title">Residents</div>
                  {residentResults.map(res => (
                    <div key={res.slug} className="search-item" onClick={() => handleResultClick(`/residents/${res.slug}`)}>
                      <img src={res.image} alt={res.name} className="search-item-img" />
                      <div className="search-item-info">
                        <h4>{res.name}</h4>
                        <span>{res.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Navegação (Direita) — varia conforme a role ── */}
        <nav className="nav-links">

          {/* Sempre visível: Tickets */}

          <button className="nav-link" onClick={() => navigate('/tickets')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
            </svg>
            {t('nav.tickets')}
          </button>

          {/* Visível apenas para Promotores */}
          {currentUser?.role === 'promoter' && (
            <button className="nav-link" onClick={() => navigate('/portal-promotor')}>
              {t('nav.promoter')}
            </button>
          )}

          {/* Visível apenas para Organizadores */}
          {currentUser?.role === 'organizer' && (
            <button className="nav-link nav-link--organizer" onClick={() => navigate('/organizer')}>
              {t('nav.organizer')}
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
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <button className="btn-login" onClick={() => navigate('/login')}>
              {t('nav.login')}
            </button>
          )}
        </nav>

      </div>
    </header>
  );
}

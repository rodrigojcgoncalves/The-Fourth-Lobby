import { Link, useNavigate } from 'react-router-dom';
import { User } from '../../types';
import './Header.css';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
}

export default function Header({ currentUser, onLogout }: HeaderProps) {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    onLogout();
  };

  const handleNavigation = (page: string) => {
    navigate(page);
  };

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo */}
        <Link to="/" className="logo">
          <div className="logo-icon">4L</div>
          <span className="logo-text">The Fourth Lobby</span>
        </Link>

        {/* Search Bar */}
        <form className="search-container">
          <div className="search-bar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input type="text" placeholder="Search events, artists..." />
          </div>
        </form>

        {/* Navigation & User */}
        <div className="nav-links">
          <button 
            className="nav-link" 
            onClick={() => handleNavigation('/tickets')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 7.5l9-4.5 9 4.5M2 7.5l9 4.5 9-4.5M2 7.5v9l9 4.5 9-4.5v-9"></path>
            </svg>
            Tickets
          </button>

          {currentUser?.role === 'promoter' && (
            <button 
              className="nav-link" 
              onClick={() => handleNavigation('/promoter')}
            >
              Promoter
            </button>
          )}

          {currentUser?.role === 'organizer' && (
            <button 
              className="nav-link" 
              onClick={() => handleNavigation('/organizer')}
            >
              Organizer
            </button>
          )}

          {currentUser ? (
            <>
              <button 
                className="nav-link" 
                onClick={() => handleNavigation('/profile')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {currentUser.fullName}
              </button>
              <button className="btn-login" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <button className="btn-login" onClick={handleLoginClick}>
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

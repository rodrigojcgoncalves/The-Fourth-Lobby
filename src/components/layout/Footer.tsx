import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logoIcon from '@img/fourthdimension_logo.png';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="footer">
      {/* Linha decorativa animada no topo */}
      <div className="footer-glow-line"></div>

      <div className="footer-main">
        {/* Coluna 1 — Branding */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo-link">
            <img src={logoIcon} alt="Fourth Dimension" className="footer-logo-img" />
            <div className="footer-logo-text">
              <span className="footer-logo-name">The Fourth Lobby</span>
              <span className="footer-logo-tagline">{t('footer.tagline')}</span>
            </div>
          </Link>
          <p className="footer-description">{t('footer.description')}</p>
        </div>

        {/* Coluna 2 — Navegação */}
        <div className="footer-col">
          <h4 className="footer-heading">{t('footer.navigate')}</h4>
          <ul className="footer-nav-list">
            <li><Link to="/">{t('footer.home')}</Link></li>
            <li><Link to="/about">{t('nav.about')}</Link></li>
            <li><Link to="/tickets">{t('nav.tickets')}</Link></li>
          </ul>
        </div>

        {/* Coluna 3 — Contacto */}
        <div className="footer-col">
          <h4 className="footer-heading">{t('footer.contact')}</h4>
          <ul className="footer-contact-list">
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <a href="mailto:fourth@dimensionevents.pt">fourth@dimensionevents.pt</a>
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>Covilhã, Portugal</span>
            </li>
          </ul>
        </div>

        {/* Coluna 4 — Redes Sociais */}
        <div className="footer-col">
          <h4 className="footer-heading">{t('footer.follow')}</h4>
          <div className="footer-socials">
            <a href="https://www.instagram.com/4thdimension.evt/" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              <span>Instagram</span>
            </a>
            <a href="https://soundcloud.com/4thdimension-evt" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="SoundCloud">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.56 8.87V17h8.76c1.85 0 3.35-1.51 3.35-3.38 0-1.86-1.5-3.37-3.35-3.37-.37 0-.73.06-1.06.17C18.87 7.73 16.66 5.72 14 5.72c-.91 0-1.76.25-2.5.68v2.47zM10 9.24c-.26-.15-.54-.26-.84-.32V17h.84V9.24zM7.87 9.04c-.18-.02-.36-.04-.54-.04-.19 0-.37.01-.55.04V17h1.09V9.04zM5.5 9.54c-.63.41-1.1 1.03-1.33 1.77V17h1.33V9.54zM2.84 12.38c-.09.32-.15.65-.17 1V17h1.17v-3.62c-.07-.35-.17-.68-.33-.98-.18.03-.38.1-.54.2-.04.25-.09.5-.13.78z"/></svg>
              <span>SoundCloud</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p>&copy; {currentYear} The Fourth Lobby — Fourth Dimension. {t('footer.rights')}</p>
      </div>
    </footer>
  );
}

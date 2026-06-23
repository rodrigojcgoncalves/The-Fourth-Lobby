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
              <a href="mailto:fourth@dimensionevents.pt">fourthdimensionevents.pt@gmail.com</a>
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
            <a href="https://www.instagram.com/4thdimension.pt/" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              <span>Instagram</span>
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

import React, { useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { residents } from '../data/residents';
import './ResidentPage.css';

export default function ResidentPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const resident = residents.find(r => r.slug === slug);

  // Fazer scroll para o topo ao entrar na página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!resident) {
    return <Navigate to="/about" replace />;
  }

  // Get localized bio from i18n
  const bioParagraphs = t(`residents_bio.${resident.slug}`, { returnObjects: true }) as string[];

  return (
    <div className="resident-page">
      <div className="back-btn-container">
        <button className="btn-back" onClick={() => navigate('/about')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          {t('resident_page.back')}
        </button>
      </div>

      {/* ── HERO SECTION ── */}
      <section className={`resident-hero ${!resident.bannerImage ? 'no-banner' : ''}`}>
        {resident.bannerImage && (
          <div 
            className="resident-hero-banner" 
            style={{ backgroundImage: `url(${resident.bannerImage})` }}
          ></div>
        )}
        
        <div className={`resident-hero-content ${!resident.bannerImage ? 'centered' : ''}`}>
          <img src={resident.image} alt={resident.name} className="resident-profile-photo" />
          <div className="resident-header-info">
            <h1 className="resident-name-large">{resident.name}</h1>
            <span className="resident-role-badge">{resident.role}</span>
          </div>
        </div>
      </section>

      {/* ── CONTENT SECTION ── */}
      <section className="resident-content">
        <div className="resident-genres">
          {resident.genres.map((genre, index) => (
            <span key={index} className="genre-chip">{genre}</span>
          ))}
        </div>

        <div className="resident-bio">
          {Array.isArray(bioParagraphs) && bioParagraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <h3 className="resident-section-title">{t('resident_page.follow')} {resident.name}</h3>
        <div className="resident-socials">
          {resident.socials.instagram && (
            <a href={resident.socials.instagram} target="_blank" rel="noopener noreferrer" className="social-btn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              Instagram
            </a>
          )}
          {resident.socials.soundcloud && (
            <a href={resident.socials.soundcloud} target="_blank" rel="noopener noreferrer" className="social-btn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 12a9.5 9.5 0 0 1 19 0"></path>
                <path d="M12 21V12"></path>
              </svg>
              SoundCloud
            </a>
          )}
        </div>
      </section>
    </div>
  );
}

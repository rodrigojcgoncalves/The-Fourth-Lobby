import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { residents } from '../data/residents';
import './AboutPage.css';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="about-page">
      {/* ── HERO SECTION ── */}
      <section className="about-hero">
        <div className="hero-content">
          <h1>{t('about.hero_title')}</h1>
          <p>{t('about.hero_subtitle')}</p>
        </div>
      </section>

      {/* ── MANIFESTO ── */}
      <section className="manifesto-section">
        <div className="glass-panel">
          <h2 className="manifesto-title">{t('about.story_title')}</h2>
          <div className="manifesto-text">
            <p>{t('about.story_p1')}</p>
            <br />
            <p>{t('about.story_p2')}</p>
          </div>
        </div>
      </section>

      {/* ── RESIDENTS ── */}
      <section className="residents-section">
        <h2 className="section-title">{t('about.residents_title')}</h2>
        <div className="residents-grid">
          {residents.map((resident, index) => (
            <Link to={`/residents/${resident.slug}`} className="resident-card" key={index} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="resident-image-container">
                <img src={resident.image} alt={resident.name} className="resident-image" />
              </div>
              <h3 className="resident-name">{resident.name}</h3>
              <span className="resident-role">{resident.role === 'Resident DJ' ? t('about.resident_role') : resident.role}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

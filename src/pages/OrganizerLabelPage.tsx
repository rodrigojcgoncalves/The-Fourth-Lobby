import React, { useState, useEffect, useRef } from 'react';
import { Camera, Image as ImageIcon, Save, Ticket, Euro, Loader2, AlertCircle, CheckCircle2, AtSign, Hash, Globe, Settings } from 'lucide-react';
import './OrganizerLabelPage.css';

interface LabelProfile {
  name: string;
  slug: string;
  bio: string;
  logo_url: string;
  banner_url: string;
  support_email: string;
  payment_info: string;
  social_links: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  metrics: {
    totalTicketsSold: number;
    globalRevenue: number;
  };
}

export default function OrganizerLabelPage() {
  const [profile, setProfile] = useState<LabelProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/organizer/label-profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Erro ao carregar perfil da label');
      
      // Defaults if social_links is null from DB
      if (!data.social_links) data.social_links = { instagram: '', twitter: '', website: '' };
      
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/organizer/label-profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: profile.name,
          bio: profile.bio,
          support_email: profile.support_email,
          payment_info: profile.payment_info,
          social_links: profile.social_links
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao guardar definições');
      
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'logo') setUploadingLogo(true);
    else setUploadingBanner(true);
    
    setError(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/organizer/label-profile/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao fazer upload da imagem');

      // Update local state immediately
      setProfile(prev => prev ? {
        ...prev,
        [type === 'logo' ? 'logo_url' : 'banner_url']: data.imageUrl
      } : null);
      
      setSuccess(`${type === 'logo' ? 'Logótipo' : 'Capa'} atualizada!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else setUploadingBanner(false);
    }
  };

  const updateSocialLink = (network: 'instagram'|'twitter'|'website', value: string) => {
    setProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        social_links: {
          ...prev.social_links,
          [network]: value
        }
      };
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: 'var(--org-accent)' }} />
      </div>
    );
  }

  if (!profile) {
    return <div className="label-alert error"><AlertCircle size={18} /> Erro ao carregar dados. {error}</div>;
  }

  return (
    <div className="label-page">
      
      <div className="label-page-header">
        <div>
          <h1>
            <Settings size={22} />
            Perfil da Label
          </h1>
          <p>Gerência a identidade pública e financeira da {profile.name}</p>
        </div>
      </div>

      {error && (
        <div className="label-alert error">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="label-alert success">
          <CheckCircle2 size={18} /> {success}
        </div>
      )}

      {/* METRICS DASHBOARD */}
      <div className="label-metrics">
        <div className="label-metric-card violet">
          <div className="label-metric-header">
            <h3>Bilhetes Vendidos (Global)</h3>
            <Ticket size={22} style={{ color: 'var(--org-accent)' }} />
          </div>
          <span className="label-metric-value">{profile.metrics.totalTicketsSold}</span>
        </div>
        <div className="label-metric-card emerald">
          <div className="label-metric-header">
            <h3>Receita Total Gerada</h3>
            <Euro size={22} style={{ color: 'var(--org-success)' }} />
          </div>
          <span className="label-metric-value">€{profile.metrics.globalRevenue.toFixed(2)}</span>
        </div>
      </div>

      {/* MEDIA UPLOAD SECTION */}
      <div className="label-visual-section">
        <h2>Identidade Visual</h2>
        
        <div className="label-media-container">
          {/* BANNER */}
          <div 
            className={`label-banner ${!profile.banner_url ? 'empty' : ''}`}
            style={profile.banner_url ? { backgroundImage: `url(${profile.banner_url})` } : undefined}
          >
            <div 
              className="label-banner-overlay"
              style={{ opacity: profile.banner_url ? 0 : 1 }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = profile.banner_url ? '0' : '1'}
              onClick={() => bannerInputRef.current?.click()}
            >
              <div className="upload-prompt">
                {uploadingBanner ? <Loader2 className="animate-spin" /> : <ImageIcon size={28} />}
                <span>Alterar Capa</span>
              </div>
            </div>
          </div>

          {/* LOGO */}
          <div 
            className={`label-logo ${!profile.logo_url ? 'empty' : ''}`}
            style={profile.logo_url ? { backgroundImage: `url(${profile.logo_url})` } : undefined}
            onClick={() => logoInputRef.current?.click()}
          >
            <div 
              className="label-logo-overlay"
              style={{ opacity: profile.logo_url ? 0 : 1 }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = profile.logo_url ? '0' : '1'}
            >
              {uploadingLogo ? <Loader2 className="animate-spin" /> : <Camera size={22} />}
            </div>
          </div>
          
          {/* Hidden Inputs */}
          <input type="file" ref={bannerInputRef} style={{ display: 'none' }} accept="image/*" onChange={e => handleFileUpload(e, 'banner')} />
          <input type="file" ref={logoInputRef} style={{ display: 'none' }} accept="image/*" onChange={e => handleFileUpload(e, 'logo')} />
        </div>
      </div>

      {/* SETTINGS FORM */}
      <form onSubmit={handleSave} className="label-form">
        <h2>Informações e Definições</h2>
        
        <div className="label-form-grid">
          <div className="label-form-group">
            <label>Nome da Label</label>
            <input 
              type="text" 
              className="label-form-input"
              value={profile.name || ''} 
              onChange={e => setProfile({...profile, name: e.target.value})}
              required
            />
          </div>
          <div className="label-form-group">
            <label>Slug (URL Amigável)</label>
            <input 
              type="text" 
              className="label-form-input"
              value={profile.slug || ''} 
              disabled
              title="O slug não pode ser alterado diretamente"
            />
          </div>
        </div>

        <div className="label-form-group full-width" style={{ marginBottom: '1.5rem' }}>
          <label>Biografia / Descrição</label>
          <textarea 
            className="label-form-input"
            value={profile.bio || ''} 
            onChange={e => setProfile({...profile, bio: e.target.value})}
            rows={4}
            placeholder="Descreve a identidade e missão da tua label..."
          />
        </div>

        <div className="label-form-columns">
          {/* REDES SOCIAIS */}
          <div className="label-form-section">
            <h3>Redes Sociais</h3>
            
            <div className="social-input-row">
              <AtSign size={18} />
              <input 
                type="text"
                className="label-form-input"
                placeholder="URL do Instagram" 
                value={profile.social_links?.instagram || ''} 
                onChange={e => updateSocialLink('instagram', e.target.value)}
              />
            </div>
            
            <div className="social-input-row">
              <Hash size={18} />
              <input 
                type="text"
                className="label-form-input"
                placeholder="URL do Twitter/X" 
                value={profile.social_links?.twitter || ''} 
                onChange={e => updateSocialLink('twitter', e.target.value)}
              />
            </div>

            <div className="social-input-row">
              <Globe size={18} />
              <input 
                type="text"
                className="label-form-input"
                placeholder="Website" 
                value={profile.social_links?.website || ''} 
                onChange={e => updateSocialLink('website', e.target.value)}
              />
            </div>
          </div>

          {/* DADOS INTERNOS (NÃO PÚBLICOS) */}
          <div className="label-form-section internal">
            <h3>Configurações Internas</h3>
            
            <div className="label-form-group" style={{ marginBottom: '1rem' }}>
              <label>Email de Suporte (Para Clientes)</label>
              <input 
                type="email"
                className="label-form-input" 
                value={profile.support_email || ''} 
                onChange={e => setProfile({...profile, support_email: e.target.value})}
              />
            </div>

            <div className="label-form-group">
              <label>Dados de Pagamento Bancário (IBAN/SWIFT)</label>
              <textarea 
                className="label-form-input"
                value={profile.payment_info || ''} 
                onChange={e => setProfile({...profile, payment_info: e.target.value})}
                rows={3}
                placeholder="IBAN: PT50 0000..."
              />
              <span className="form-hint">Estes dados estão protegidos via RLS e são apenas para faturação interna.</span>
            </div>
          </div>
        </div>

        <div className="label-form-footer">
          <button 
            type="submit" 
            className="btn-primary label-save-btn" 
            disabled={saving}
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'A Guardar...' : 'Guardar Definições'}
          </button>
        </div>
      </form>
    </div>
  );
}

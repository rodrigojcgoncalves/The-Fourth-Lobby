import React, { useState, useEffect, useRef } from 'react';
import { Camera, Image as ImageIcon, Save, Ticket, Euro, Loader2, AlertCircle, CheckCircle2, AtSign, Hash, Globe, Settings } from 'lucide-react';

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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'white' }}>
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (!profile) {
    return <div style={{ color: 'red', padding: '2rem' }}>Erro ao carregar dados. {error}</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', color: 'white' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Settings style={{ color: 'var(--accent-primary)' }} />
            Perfil da Label
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.6 }}>
            Gerência a identidade pública e financeira da {profile.name}
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={20} /> {success}
        </div>
      )}

      {/* METRICS DASHBOARD */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, opacity: 0.8, fontSize: '1rem' }}>Bilhetes Vendidos (Global)</h3>
            <Ticket size={24} style={{ color: '#8b5cf6', opacity: 0.5 }} />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{profile.metrics.totalTicketsSold}</span>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, opacity: 0.8, fontSize: '1rem' }}>Receita Total Gerada</h3>
            <Euro size={24} style={{ color: '#10b981', opacity: 0.5 }} />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>€{profile.metrics.globalRevenue.toFixed(2)}</span>
        </div>
      </div>

      {/* MEDIA UPLOAD SECTION */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.3rem' }}>Identidade Visual</h2>
        
        <div style={{ position: 'relative', marginBottom: '3rem' }}>
          {/* BANNER */}
          <div 
            style={{ 
              height: '200px', 
              borderRadius: '12px', 
              background: profile.banner_url ? `url(${profile.banner_url}) center/cover` : 'linear-gradient(45deg, #1f1f2e, #2a2a3c)',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: profile.banner_url ? 0 : 1, transition: 'opacity 0.2s', cursor: 'pointer' }}
                 onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                 onMouseLeave={e => e.currentTarget.style.opacity = profile.banner_url ? '0' : '1'}
                 onClick={() => bannerInputRef.current?.click()}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                {uploadingBanner ? <Loader2 className="animate-spin" /> : <ImageIcon size={32} />}
                <span>Alterar Capa</span>
              </div>
            </div>
          </div>

          {/* LOGO */}
          <div 
            style={{ 
              width: '120px', height: '120px', 
              borderRadius: '50%', 
              background: profile.logo_url ? `url(${profile.logo_url}) center/cover` : '#2a2a3c',
              position: 'absolute',
              bottom: '-40px',
              left: '40px',
              border: '4px solid #13131f', // Match background
              overflow: 'hidden',
              cursor: 'pointer'
            }}
            onClick={() => logoInputRef.current?.click()}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: profile.logo_url ? 0 : 1, transition: 'opacity 0.2s' }}
                 onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                 onMouseLeave={e => e.currentTarget.style.opacity = profile.logo_url ? '0' : '1'}
            >
              {uploadingLogo ? <Loader2 className="animate-spin" /> : <Camera size={24} />}
            </div>
          </div>
          
          {/* Hidden Inputs */}
          <input type="file" ref={bannerInputRef} style={{ display: 'none' }} accept="image/*" onChange={e => handleFileUpload(e, 'banner')} />
          <input type="file" ref={logoInputRef} style={{ display: 'none' }} accept="image/*" onChange={e => handleFileUpload(e, 'logo')} />
        </div>
      </div>

      {/* SETTINGS FORM */}
      <form onSubmit={handleSave} className="glass-card" style={{ padding: '2rem' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.3rem' }}>Informações e Definições</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8, fontSize: '0.9rem' }}>Nome da Label</label>
            <input 
              type="text" 
              value={profile.name || ''} 
              onChange={e => setProfile({...profile, name: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8, fontSize: '0.9rem' }}>Slug (URL Amigável)</label>
            <input 
              type="text" 
              value={profile.slug || ''} 
              disabled
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', cursor: 'not-allowed' }}
              title="O slug não pode ser alterado diretamente"
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8, fontSize: '0.9rem' }}>Biografia / Descrição</label>
          <textarea 
            value={profile.bio || ''} 
            onChange={e => setProfile({...profile, bio: e.target.value})}
            rows={4}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'vertical' }}
            placeholder="Descreve a identidade e missão da tua label..."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* REDES SOCIAIS */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Redes Sociais</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <AtSign size={20} style={{ opacity: 0.7 }} />
              <input 
                type="text" placeholder="URL do Instagram" 
                value={profile.social_links?.instagram || ''} 
                onChange={e => updateSocialLink('instagram', e.target.value)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Hash size={20} style={{ opacity: 0.7 }} />
              <input 
                type="text" placeholder="URL do Twitter/X" 
                value={profile.social_links?.twitter || ''} 
                onChange={e => updateSocialLink('twitter', e.target.value)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Globe size={20} style={{ opacity: 0.7 }} />
              <input 
                type="text" placeholder="Website" 
                value={profile.social_links?.website || ''} 
                onChange={e => updateSocialLink('website', e.target.value)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>
          </div>

          {/* DADOS INTERNOS (NÃO PÚBLICOS) */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', color: 'var(--accent-secondary)' }}>Configurações Internas</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', opacity: 0.8, fontSize: '0.85rem' }}>Email de Suporte (Para Clientes)</label>
              <input 
                type="email" 
                value={profile.support_email || ''} 
                onChange={e => setProfile({...profile, support_email: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', opacity: 0.8, fontSize: '0.85rem' }}>Dados de Pagamento Bancário (IBAN/SWIFT)</label>
              <textarea 
                value={profile.payment_info || ''} 
                onChange={e => setProfile({...profile, payment_info: e.target.value})}
                rows={3}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'vertical' }}
                placeholder="IBAN: PT50 0000..."
              />
              <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>Estes dados estão protegidos via RLS e são apenas para faturação interna.</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? 'A Guardar...' : 'Guardar Definições'}
          </button>
        </div>
      </form>
    </div>
  );
}

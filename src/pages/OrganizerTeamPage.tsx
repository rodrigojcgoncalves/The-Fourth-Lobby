import { useState, useEffect } from 'react';
import './OrganizerTeamPage.css'; // Vamos criar os estilos se necessário ou reutilizar

interface Promoter {
  id: string;
  user_id: string;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  email: string;
  full_name: string;
  referral_code: string;
  tickets_sold: number;
}

export default function OrganizerTeamPage() {
  const [team, setTeam] = useState<Promoter[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/organizer/team`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao carregar equipa.');
      setTeam(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(null);

    if (!inviteEmail) return;

    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/organizer/team/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: inviteEmail })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Erro ao adicionar promotor.');
      }

      setInviteSuccess(data.message);
      setInviteEmail('');
      fetchTeam(); // Recarregar a equipa

    } catch (err: any) {
      setInviteError(err.message);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/organizer/team/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Erro ao atualizar estado.');
      
      fetchTeam();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Promocode copiado: ' + text);
  };

  if (loading) return <div className="loading-spinner" style={{ margin: 'auto' }}></div>;

  return (
    <div className="organizer-team-page">
      <div className="page-header">
        <h1>Gestão da Equipa de RPs</h1>
        <p className="subtitle">Adiciona novos promotores e acompanha o desempenho deles.</p>
      </div>

      <div className="invite-section glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3>Adicionar Promotor (RP)</h3>
        <p style={{ opacity: 0.8, marginBottom: '1rem', fontSize: '0.9rem' }}>
          O promotor já deve ter conta criada na plataforma. Insere o e-mail de registo dele para o adicionar à tua Label.
        </p>
        <form onSubmit={handleInvite} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="email"
            placeholder="email@do-promotor.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
            required
          />
          <button type="submit" className="btn-primary">Adicionar RP</button>
        </form>
        {inviteError && <div style={{ color: 'var(--accent-red)', marginTop: '1rem' }}>{inviteError}</div>}
        {inviteSuccess && <div style={{ color: 'var(--neon-cyan)', marginTop: '1rem' }}>{inviteSuccess}</div>}
      </div>

      <div className="team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {team.length === 0 ? (
          <p>Ainda não tens promotores na tua equipa.</p>
        ) : (
          team.map(member => (
            <div key={member.id} className={`glass-card team-card ${member.status}`} style={{ padding: '1.5rem', opacity: member.status === 'inactive' ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>{member.full_name || 'Sem Nome'}</h3>
                <span style={{ 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '10px', 
                  fontSize: '0.8rem',
                  background: member.status === 'active' ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)',
                  color: member.status === 'active' ? '#4ade80' : '#f87171'
                }}>
                  {member.status.toUpperCase()}
                </span>
              </div>
              
              <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                📧 {member.email}
              </div>

              <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Promocode:</span>
                  <strong style={{ color: 'var(--neon-cyan)', cursor: 'pointer' }} onClick={() => copyToClipboard(member.referral_code)}>
                    {member.referral_code} 📋
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Bilhetes Vendidos:</span>
                  <strong>{member.tickets_sold}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn-secondary" 
                  style={{ flex: 1, padding: '0.5rem' }}
                  onClick={() => handleToggleStatus(member.user_id, member.status)}
                >
                  {member.status === 'active' ? 'Suspender (Inativo)' : 'Reativar'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

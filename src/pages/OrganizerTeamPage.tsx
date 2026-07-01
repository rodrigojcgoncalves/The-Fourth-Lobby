import { useState, useEffect } from 'react';
import { Mail, Copy, Ticket } from 'lucide-react';
import './OrganizerTeamPage.css';

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
      fetchTeam();

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

      <div className="invite-section">
        <h3>Adicionar Promotor (RP)</h3>
        <p className="invite-description">
          O promotor já deve ter conta criada na plataforma. Insere o e-mail de registo dele para o adicionar à tua Label.
        </p>
        <form onSubmit={handleInvite} className="invite-form">
          <input
            type="email"
            placeholder="email@do-promotor.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="invite-input"
            required
          />
          <button type="submit" className="btn-primary">Adicionar RP</button>
        </form>
        {inviteError && <div className="invite-feedback error">{inviteError}</div>}
        {inviteSuccess && <div className="invite-feedback success">{inviteSuccess}</div>}
      </div>

      <div className="team-grid">
        {team.length === 0 ? (
          <p className="team-empty">Ainda não tens promotores na tua equipa.</p>
        ) : (
          team.map(member => (
            <div key={member.id} className={`team-card ${member.status}`}>
              <div className="team-card-header">
                <h3>{member.full_name || 'Sem Nome'}</h3>
                <span className={`team-status-badge ${member.status}`}>
                  {member.status.toUpperCase()}
                </span>
              </div>
              
              <div className="team-card-email">
                <Mail size={15} />
                {member.email}
              </div>

              <div className="team-card-stats">
                <div className="team-stat-row">
                  <span>Promocode</span>
                  <span className="promo-code" onClick={() => copyToClipboard(member.referral_code)}>
                    {member.referral_code}
                    <Copy size={14} />
                  </span>
                </div>
                <div className="team-stat-row">
                  <span>Bilhetes Vendidos</span>
                  <strong>{member.tickets_sold}</strong>
                </div>
              </div>

              <button 
                className="team-toggle-btn"
                onClick={() => handleToggleStatus(member.user_id, member.status)}
              >
                {member.status === 'active' ? 'Suspender (Inativo)' : 'Reativar'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

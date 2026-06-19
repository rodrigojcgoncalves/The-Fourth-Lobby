import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PromoterDashboard.css';

interface DashboardData {
  hasLabel: boolean;
  referralCode?: string;
  ticketsSold?: number;
  totalEarned?: number;
  events?: Array<{
    id: string;
    name: string;
    date: string;
    location: string;
    image_url: string;
  }>;
}

export default function PromoterDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/promoters/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Erro ao carregar dashboard');
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Link de Afiliado copiado!\nPodes partilhar isto: ${window.location.origin}/?ref=${text}`);
  };

  if (loading) return <div className="container" style={{ paddingTop: '5rem' }}><div className="loading-spinner"></div></div>;

  return (
    <div className="container promoter-dashboard" style={{ paddingTop: '5rem' }}>
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <h1>Portal de Promotor</h1>
        <p className="subtitle">Bem-vindo à tua área exclusiva de gestão de vendas.</p>
      </div>

      {error && <div className="error-message" style={{ color: 'var(--accent-red)', marginBottom: '1rem' }}>{error}</div>}

      {data && !data.hasLabel ? (
        <div className="empty-state glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2>Ainda não fazes parte da Equipa</h2>
          <p style={{ opacity: 0.8, marginTop: '1rem' }}>
            A administração da Fourth Dimension tem de adicionar o teu e-mail à equipa para poderes aceder aos códigos de desconto e eventos.
          </p>
        </div>
      ) : data ? (
        <>
          {/* Métricas Principais */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--neon-cyan)' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', opacity: 0.8, fontSize: '1rem' }}>O Teu Código (Promocode)</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--neon-cyan)', letterSpacing: '2px' }}>
                  {data.referralCode}
                </span>
                <button className="btn-secondary" onClick={() => copyToClipboard(data.referralCode!)}>📋 Copiar Link</button>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #4ade80' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', opacity: 0.8, fontSize: '1rem' }}>Bilhetes Vendidos</h3>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4ade80' }}>
                {data.ticketsSold}
              </span>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #facc15' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', opacity: 0.8, fontSize: '1rem' }}>Comissões Ganhas</h3>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#facc15' }}>
                €{Number(data.totalEarned || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Eventos Disponíveis */}
          <h2 style={{ marginBottom: '1.5rem' }}>Próximos Eventos</h2>
          {data.events?.length === 0 ? (
            <p>Não há eventos agendados de momento.</p>
          ) : (
            <div className="events-grid">
              {data.events?.map(event => (
                <div 
                  key={event.id} 
                  className="event-card glass-card"
                  style={{ display: 'flex', gap: '1rem', padding: '1rem', alignItems: 'center' }}
                >
                  <img 
                    src={event.image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200'} 
                    alt={event.name} 
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{event.name}</h3>
                    <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>📅 {new Date(event.date).toLocaleDateString()}</p>
                    <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>📍 {event.location}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

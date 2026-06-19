import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  image_url: string;
  capacity: number;
}

export default function PromoterEventsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchEvents = async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token || !id) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/promoters/labels/${id}/events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao carregar eventos');
      setEvents(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container" style={{ paddingTop: '5rem' }}><div className="loading-spinner"></div></div>;

  return (
    <div className="container promoter-events-page" style={{ paddingTop: '4rem' }}>
      <button 
        className="btn-secondary" 
        onClick={() => navigate('/portal-promotor')}
        style={{ marginBottom: '2rem' }}
      >
        ← Voltar às Labels
      </button>

      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <h1>Eventos da Label</h1>
        <p className="subtitle">Próximas festas nas quais podes promover bilhetes.</p>
      </div>

      {error && <div className="error-message" style={{ color: 'var(--accent-red)', marginBottom: '1rem' }}>{error}</div>}

      {events.length === 0 && !error ? (
        <div className="empty-state">
          <h2>Sem eventos futuros</h2>
          <p>Esta label não tem eventos publicados de momento.</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-image-container">
                <img 
                  src={event.image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800'} 
                  alt={event.name} 
                  className="event-image" 
                />
              </div>
              <div className="event-details">
                <h3 className="event-title">{event.name}</h3>
                <div className="event-info">
                  <span className="icon">📅</span>
                  <span>{new Date(event.date).toLocaleDateString('pt-PT')}</span>
                </div>
                <div className="event-info">
                  <span className="icon">📍</span>
                  <span>{event.location}</span>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  {/* Futuramente abrirá um modal ou página com o link/promocode */}
                  <button className="btn-primary" style={{ width: '100%', padding: '0.5rem' }}>Ver Ferramentas de RP</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../types';
import './OrganizerDashboard.css';

export default function OrganizerDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMyEvents() {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setError('Não autenticado.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/events/my/events', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Erro ao carregar eventos');
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    fetchMyEvents();
  }, []);

  const handleDelete = async (eventId: string, eventName: string) => {
    if (!confirm(`Tens a certeza que queres apagar "${eventName}"? Esta ação é irreversível.`)) return;

    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`http://localhost:5000/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erro ao apagar evento');
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao apagar');
    }
  };

  const publishedCount = events.filter(e => e.status === 'published').length;
  const draftCount = events.filter(e => e.status === 'draft').length;

  return (
    <div className="container dashboard">
      <div className="dashboard-header">
        <h1>Organizer Dashboard</h1>
        <button
          className="btn-primary"
          onClick={() => navigate('/create-event')}
        >
          + Criar Evento
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎪</div>
          <div className="stat-content">
            <p className="stat-label">Total de Eventos</p>
            <p className="stat-value">{events.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <p className="stat-label">Publicados</p>
            <p className="stat-value">{publishedCount}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <p className="stat-label">Rascunhos</p>
            <p className="stat-value">{draftCount}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎫</div>
          <div className="stat-content">
            <p className="stat-label">Bilhetes Vendidos</p>
            <p className="stat-value">—</p>
          </div>
        </div>
      </div>

      <section className="dashboard-section">
        <h2>Os Meus Eventos</h2>
        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>A carregar os teus eventos...</p>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <p>Ainda não criaste nenhum evento.</p>
            <button className="btn-primary btn-sm" onClick={() => navigate('/create-event')}>
              Criar o Primeiro Evento
            </button>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Local</th>
                <th>Data</th>
                <th>Capacidade</th>
                <th>Estado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>
                    <div className="event-name-cell">
                      {event.image_url && (
                        <img src={event.image_url} alt={event.name} className="event-thumb" />
                      )}
                      <span>{event.name}</span>
                    </div>
                  </td>
                  <td>{event.location}</td>
                  <td>{new Date(event.date).toLocaleDateString('pt-PT')}</td>
                  <td>{event.capacity}</td>
                  <td>
                    <span className={`badge ${event.status}`}>
                      {event.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action btn-edit"
                        onClick={() => navigate(`/organizer/edit-event/${event.id}`)}
                        title="Editar evento"
                      >
                        ✏️ Editar
                      </button>
                      {event.slug && (
                        <button
                          className="btn-action btn-view"
                          onClick={() => navigate(`/events/${event.slug}`)}
                          title="Ver página pública"
                        >
                          👁 Ver
                        </button>
                      )}
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(event.id, event.name)}
                        title="Apagar evento"
                      >
                        🗑 Apagar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../types';
import '../components/DeleteEventModal.css';
import './OrganizerDashboard.css';

export default function OrganizerDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{id: string, name: string} | null>(null);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);

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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/my/events`, {
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

  const openDeleteModal = (eventId: string, eventName: string) => {
    setEventToDelete({ id: eventId, name: eventName });
    setDeleteStep(1);
    setDeleteInput('');
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  const executeDelete = async () => {
    if (!eventToDelete) return;
    
    if (deleteStep === 1) {
      setDeleteStep(2);
      return;
    }

    if (deleteStep === 2) {
      if (deleteInput !== eventToDelete.name) {
        alert('Nome incorreto. Operação abortada.');
        return;
      }

      const token = localStorage.getItem('jwt_token');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${eventToDelete.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.message || 'Erro ao apagar evento');
        }
        
        setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
        closeDeleteModal();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao apagar');
        closeDeleteModal();
      }
    }
  };

  const publishedCount = events.filter(e => e.status === 'published').length;
  const draftCount = events.filter(e => e.status === 'draft').length;

  return (
    <div className="dashboard-view">
      <div className="dashboard-header-simple">
        <h2>Visão Geral dos Eventos</h2>
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
      </div>

      <section className="dashboard-section">
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
                        className="btn-action btn-view"
                        onClick={() => navigate(`/organizer/events/${event.id}`)}
                        title="Gerir Evento (Dashboard Interno)"
                      >
                        ⚙️ Gerir
                      </button>
                      {event.slug && (
                        <button
                          className="btn-action btn-secondary"
                          onClick={() => navigate(`/events/${event.slug}`)}
                          title="Ver página pública"
                        >
                          👁 Público
                        </button>
                      )}
                      <button
                        className="btn-action btn-delete"
                        onClick={() => openDeleteModal(event.id, event.name)}
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

      {deleteModalOpen && eventToDelete && (
        <div className="delete-modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-modal-box" onClick={e => e.stopPropagation()}>
            <button className="delete-modal-close" onClick={closeDeleteModal}>×</button>
            
            <div className="delete-modal-icon">🗑️</div>
            <h2 className="delete-modal-title">Apagar Evento</h2>

            <div className="delete-modal-step" key={deleteStep}>
              <div className="delete-modal-body">
                {deleteStep === 1 ? (
                  <p>Tem a certeza que deseja <span className="danger-word">APAGAR</span> este evento? Esta ação é irreversível.</p>
                ) : (
                  <>
                    <p>Para apagar este evento <span className="danger-word">DEFINITIVAMENTE</span>, escreva aqui o nome do evento:</p>
                    <p style={{ marginTop: '0.5rem' }}><span className="event-name-highlight">{eventToDelete.name}</span></p>
                    <input
                      type="text"
                      className="delete-modal-input"
                      value={deleteInput}
                      onChange={e => setDeleteInput(e.target.value)}
                      placeholder="Nome do evento..."
                      autoFocus
                    />
                  </>
                )}
              </div>
            </div>

            <hr className="delete-modal-divider" />

            <div className="delete-modal-actions">
              <button className="delete-modal-btn cancel" onClick={closeDeleteModal}>
                {deleteStep === 1 ? 'Cancelar' : 'ABORTAR'}
              </button>
              <button
                className="delete-modal-btn danger"
                onClick={executeDelete}
                disabled={deleteStep === 2 && deleteInput !== eventToDelete.name}
              >
                {deleteStep === 1 ? 'Continuar' : 'APAGAR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

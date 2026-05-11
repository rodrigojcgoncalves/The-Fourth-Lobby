import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import './TicketsPage.css';

interface TicketEvent {
  name: string;
  date: string;
  location: string;
  image_url?: string;
  slug?: string;
}

interface TicketType {
  name: string;
  price: number;
  description?: string;
}

interface MyTicket {
  id: string;
  qr_code: string;
  status: 'valid' | 'used' | 'refunded';
  price_paid: number;
  purchased_at: string;
  events: TicketEvent;
  ticket_types: TicketType;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<MyTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQR, setExpandedQR] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTickets() {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setError('Sessão expirada. Faz login novamente.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/tickets/my', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Erro ao carregar bilhetes.');
        const data = await res.json();
        setTickets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido.');
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, []);

  const statusLabel: Record<string, string> = {
    valid: 'Válido',
    used: 'Utilizado',
    refunded: 'Reembolsado'
  };

  if (loading) {
    return (
      <div className="container tickets-page">
        <p style={{ color: 'rgba(255,255,255,0.5)', paddingTop: '4rem' }}>A carregar os teus bilhetes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container tickets-page">
        <div className="form-error" style={{ marginTop: '2rem' }}>{error}</div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="container tickets-page">
        <h1>Os Meus Bilhetes</h1>
        <div className="empty-state">
          <p>Ainda não compraste nenhum bilhete.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Ver Eventos</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container tickets-page">
      <h1>Os Meus Bilhetes</h1>
      <div className="tickets-list">
        {tickets.map(ticket => {
          const eventDate = ticket.events?.date
            ? new Date(ticket.events.date).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
            : '—';
          const eventTime = ticket.events?.date
            ? new Date(ticket.events.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
            : '';

          return (
            <div key={ticket.id} className={`ticket-card ${ticket.status}`}>
              <div className="ticket-main">
                {/* Imagem do Evento (16:9) */}
                {ticket.events?.image_url && (
                  <div className="ticket-image" onClick={() => ticket.events.slug && navigate(`/events/${ticket.events.slug}`)}>
                    <img
                      src={ticket.events.image_url}
                      alt={ticket.events.name}
                    />
                  </div>
                )}

                <div className="ticket-info">
                  <h3 className="ticket-title">{ticket.events?.name || 'Evento'}</h3>
                  
                  <div className="ticket-meta-list">
                    <p className="ticket-meta">
                      <span className="meta-icon">📅</span> {eventDate} · {eventTime}
                    </p>
                    <p className="ticket-meta">
                      <span className="meta-icon">📍</span> {ticket.events?.location || '—'}
                    </p>
                  </div>

                  <div className="ticket-badges">
                    <span className={`badge status-${ticket.status}`}>
                      {statusLabel[ticket.status] || ticket.status}
                    </span>
                    <span className="badge phase-badge">
                      {ticket.ticket_types?.name || 'Fase'} — €{Number(ticket.price_paid).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Linha de Ações */}
              <div className="ticket-actions">
                {ticket.status === 'valid' ? (
                  <button
                    className="btn-action"
                    onClick={() => setExpandedQR(expandedQR === ticket.id ? null : ticket.id)}
                  >
                    {expandedQR === ticket.id ? 'Ocultar Bilhete' : 'Mostrar QR Code'}
                  </button>
                ) : (
                  <button className="btn-action disabled" disabled>
                    Bilhete {statusLabel[ticket.status] || ticket.status}
                  </button>
                )}
                <button className="btn-action secondary" onClick={() => ticket.events.slug && navigate(`/events/${ticket.events.slug}`)}>
                  Ver Evento
                </button>
              </div>

              {/* QR Code Expansível */}
              {expandedQR === ticket.id && ticket.status === 'valid' && (
                <div className="ticket-qr-expanded">
                  <div className="qr-container">
                    <QRCodeSVG value={ticket.qr_code} size={160} />
                  </div>
                  <p className="qr-text">{ticket.qr_code}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

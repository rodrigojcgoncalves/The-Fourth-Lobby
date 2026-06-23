import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Event } from '../types';
import './EventDetailsPage.css';

export default function EventDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEventDetails() {
      if (!slug) return;
      try {
        // Tenta pelo slug primeiro; se falhar, tenta pelo UUID (compatibilidade)
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events/slug/${slug}`);

        if (!res.ok) {
          // Fallback: tenta pelo UUID caso o slug ainda não exista
          const fallback = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${slug}`);
          if (!fallback.ok) throw new Error('Evento não encontrado.');
          const data = await fallback.json();
          setEvent(data as Event);
          return;
        }

        const data = await res.json();
        setEvent(data as Event);
      } catch (err) {
        console.error('Error fetching event details:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEventDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <p>A carregar o evento...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <h2>Evento não encontrado</h2>
        <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
          Voltar à Homepage
        </button>
      </div>
    );
  }

  const isPastEvent = new Date(event.date) < new Date();

  const handleBuyTickets = (phase: any) => {
    navigate('/checkout', {
      state: {
        ticketTypeId: phase.id,
        ticketTypeName: phase.name,
        ticketTypeDescription: phase.description,
        price: phase.price,
        eventName: event!.name,
        eventDate: event!.date,
        eventLocation: event!.location
      }
    });
  };

  return (
    <div className="event-details-page">
      {/* Event Hero */}
      <section 
        className="event-hero"
        style={{ backgroundImage: `url('${event.image_url || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&q=80'}')` }}
      >
        <div className="event-hero-content">
          <h1>{event.name}</h1>
          <p className="event-subtitle">{event.location}</p>
        </div>
      </section>

      <div className="container">
        {/* Event Info */}
        <section className="event-info">
          <div className="info-grid">
            <div className="info-block">
              <h3>Data</h3>
              <p>{new Date(event.date).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="info-block">
              <h3>Hora</h3>
              <p>{new Date(event.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="info-block">
              <h3>Local</h3>
              <p>{event.location}</p>
            </div>
            <div className="info-block">
              <h3>Capacidade</h3>
              <p>{event.capacity} pessoas</p>
            </div>
          </div>
        </section>

        {/* Description */}
        {event.description && (
          <section className="description-section">
            <h2>Sobre Este Evento</h2>
            <p>{event.description}</p>
          </section>
        )}

        {/* Lineup */}
        {event.artists && event.artists.length > 0 && (
          <section className="lineup-section">
            <h2>Line-up</h2>
            <div className="lineup-grid">
              {event.artists.map(artist => (
                <div key={artist.id} className="artist-card">
                  <div className="artist-image">
                    <img src={artist.image_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80'} alt={artist.name} />
                  </div>
                  <div className="artist-info">
                    <h3>{artist.name}</h3>
                    <p className="genre">{artist.genre}</p>
                    {artist.bio && <p className="bio">{artist.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ticket Phases */}
        <section className="tickets-section">
          {isPastEvent ? (
            <>
              <h2>Bilhetes</h2>
              <div className="past-event-notice">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <div>
                  <h3>Este evento já decorreu</h3>
                  <p>A compra de bilhetes já não está disponível para eventos passados.</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2>Comprar Bilhetes</h2>
              {event.ticket_types && event.ticket_types.length > 0 ? (
                <div className="ticket-phases">
                  {event.ticket_types.map((phase: any) => {
                    // A API pública retorna 'availability' (string) em vez de quantidades
                    const isAvailable = phase.availability
                      ? phase.availability === 'Disponível'
                      : (phase.total_quantity - phase.sold_quantity) > 0;

                    return (
                      <div key={phase.id} className="ticket-phase-card">
                        <div className="phase-header">
                          <h3>{phase.name}</h3>
                          {isAvailable ? (
                            <span className="badge-active">DISPONÍVEL</span>
                          ) : (
                            <span className="badge-inactive">ESGOTADO</span>
                          )}
                        </div>
                        {phase.description && (
                          <p className="phase-description">{phase.description}</p>
                        )}
                        <div className="phase-details">
                          <p className="price">€{Number(phase.price).toFixed(2)}</p>
                        </div>
                        <button
                          className="btn-primary"
                          onClick={() => handleBuyTickets(phase)}
                          disabled={!isAvailable}
                        >
                          {isAvailable ? 'Comprar Bilhete' : 'Esgotado'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>Bilhetes ainda não disponíveis.</p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Event } from '../types';
import './EventDetailsPage.css';

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEventDetails() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*, artists(*), ticket_types(*)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setEvent(data as Event);
      } catch (err) {
        console.error("Error fetching event details:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEventDetails();
  }, [id]);

  if (loading) {
    return <div className="container"><p>Loading event details...</p></div>;
  }

  if (!event) {
    return (
      <div className="container">
        <h2>Event not found</h2>
        <button onClick={() => navigate('/')}>Go back to home</button>
      </div>
    );
  }

  const handleBuyTickets = () => {
    navigate('/checkout');
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
          <p className="event-subtitle">Featuring the hardest techno beats</p>
        </div>
      </section>

      <div className="container">
        {/* Event Info */}
        <section className="event-info">
          <div className="info-grid">
            <div className="info-block">
              <h3>Date</h3>
              <p>{new Date(event.date).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="info-block">
              <h3>Location</h3>
              <p>{event.location}</p>
            </div>
            <div className="info-block">
              <h3>Status</h3>
              <p className="status-badge">{event.status.toUpperCase()}</p>
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="description-section">
          <h2>About This Event</h2>
          <p>{event.description}</p>
        </section>

        {/* Lineup */}
        {event.artists && event.artists.length > 0 && (
          <section className="lineup-section">
            <h2>Lineup</h2>
            <div className="lineup-grid">
              {event.artists.map(artist => (
                <div key={artist.id} className="artist-card">
                  <div className="artist-image">
                    <img src={artist.image_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80'} alt={artist.name} />
                  </div>
                  <div className="artist-info">
                    <h3>{artist.name}</h3>
                    <p className="genre">{artist.genre}</p>
                    <p className="bio">{artist.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ticket Phases */}
        <section className="tickets-section">
          <h2>Get Your Tickets</h2>
          <div className="ticket-phases">
            {event.ticket_types && event.ticket_types.map(phase => {
              const available = phase.total_quantity - phase.sold_quantity;
              const isActive = available > 0 && new Date(phase.start_date) <= new Date() && new Date(phase.end_date) >= new Date();
              
              return (
                <div key={phase.id} className="ticket-phase-card">
                  <div className="phase-header">
                    <h3>{phase.name}</h3>
                    {isActive ? (
                      <span className="badge-active">ACTIVE</span>
                    ) : (
                      <span className="badge-inactive">INACTIVE</span>
                    )}
                  </div>
                  <div className="phase-details">
                    <p className="price">€{phase.price}</p>
                    <p className="availability">
                      {available} of {phase.total_quantity} available
                    </p>
                  </div>
                  <button 
                    className="btn-primary"
                    onClick={handleBuyTickets}
                    disabled={!isActive || available === 0}
                  >
                    {available === 0 ? 'Sold Out' : 'Buy Tickets'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { Event } from '../types';
import './EventCard.css';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate();

  const handleViewEvent = () => {
    navigate(`/events/${event.slug || event.id}`);
  };

  const eventDate = new Date(event.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="event-card">
      {/* Poster / Imagem */}
      <div className="event-card-image">
        <img
          src={event.image_url || '/img/fourthdimension_logo.png'}
          alt={event.name}
        />
      </div>

      {/* Conteúdo */}
      <div className="event-card-body">
        <h3 className="event-card-title">{event.name}</h3>

        <div className="event-card-meta">
          {/* Ícone Calendário */}
          <span className="event-card-meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {eventDate}
          </span>

          {/* Ícone Localização */}
          <span className="event-card-meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {event.location}
          </span>
        </div>

        <button className="btn-view-event" onClick={handleViewEvent}>
          View Event
        </button>
      </div>
    </div>
  );
}

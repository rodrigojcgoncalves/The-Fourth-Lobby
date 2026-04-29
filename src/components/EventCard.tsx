import { useNavigate } from 'react-router-dom';
import { Event } from '../types';
import './EventCard.css';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate();

  const handleViewEvent = () => {
    navigate(`/events/${event.id}`);
  };

  const eventDate = new Date(event.date).toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="card">
      <div className="card-image">
        <img src={event.image_url || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80'} alt={event.name} />
      </div>
      <div className="card-content">
        <h3>{event.name}</h3>
        <div className="card-meta">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>{eventDate}</span>
        </div>
        <div className="card-meta">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>{event.location}</span>
        </div>
        <button className="btn-primary" onClick={handleViewEvent}>
          View Event
        </button>
      </div>
    </div>
  );
}

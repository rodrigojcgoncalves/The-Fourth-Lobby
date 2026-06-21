import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../types';
import EventCard from '../components/EventCard';
import './HomePage.css';

// Imagens locais (via alias @img configurado no vite.config.ts)
import heroBg from '@img/backgrounds/fourthdimension_neket_hoff.jpg';
import logoFourthDimension from '@img/fourthdimension_logo.png';
import albumPhoto from '@img/mediacenter/album_photo_cape.jpg';
import pharahThumb from '@img/mediacenter/pharah_thumbnail.jpg';
import rebbelleThumb from '@img/mediacenter/rebbelle_thumbnail.png';

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events`);
        if (!res.ok) throw new Error('Failed to fetch events');
        const data = await res.json();
        setEvents(data as Event[]);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const handleGetTickets = () => {
    navigate('/events');
  };

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) >= now);
  const pastEvents = events.filter(e => new Date(e.date) < now);

  return (
    <div className="home-page">
      {/* ── Hero Section ── */}
      <section className="hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="hero-content">
          <img src={logoFourthDimension} alt="Fourth Dimension" className="hero-logo" />
          <p>Where the Fourth Dimension begins...</p>
          <button className="btn-hero" onClick={handleGetTickets}>
            Get Tickets Now
          </button>
        </div>
      </section>

      {/* ── Upcoming Events ── */}
      <section className="home-section container">
        <h2 className="section-title">Upcoming Events</h2>
        {loading ? (
          <p className="loading-text">Loading events...</p>
        ) : upcomingEvents.length === 0 ? (
          <p className="loading-text">No upcoming events at the moment.</p>
        ) : (
          <div className="events-grid">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* ── Media Center ── */}
      <section className="home-section container">
        <h2 className="section-title">Media Center</h2>
        <div className="media-grid">
          <a href="#" className="media-item">
            <div className="media-image">
              <img src={albumPhoto} alt="4TH x DW Album Photos" />
              <div className="media-badge">PHOTO</div>
            </div>
            <div className="media-content">
              <h3>4TH x DW Album Photos</h3>
              <p>Check out the photos from the last party album</p>
            </div>
          </a>

          <a href="#" className="media-item">
            <div className="media-image">
              <img src={rebbelleThumb} alt="Rebbelle Opening Set" />
              <div className="media-badge">SET</div>
            </div>
            <div className="media-content">
              <h3>REBBELLE OPENING SET</h3>
              <p>REBBELLE's opening set from 4th Dimension w/ Pharah</p>
            </div>
          </a>

          <a href="#" className="media-item">
            <div className="media-image">
              <img src={pharahThumb} alt="Pharah Closing Set" />
              <div className="media-badge">SET</div>
            </div>
            <div className="media-content">
              <h3>PHARAH CLOSING SET</h3>
              <p>PHARAH's closing set from 4th Dimension w/ Pharah</p>
            </div>
          </a>
        </div>
      </section>

      {/* ── Past Events ── */}
      {pastEvents.length > 0 && (
        <section className="home-section past-events-section container">
          <h2 className="section-title">Past Events</h2>
          <div className="events-grid">
            {pastEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

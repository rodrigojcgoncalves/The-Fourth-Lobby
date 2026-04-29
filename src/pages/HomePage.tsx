import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Event } from '../types';
import EventCard from '../components/EventCard';
import './HomePage.css';

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'live')
          .order('date', { ascending: true });
          
        if (error) throw error;
        setEvents(data as Event[]);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvents();
  }, []);

  const handleGetTickets = () => {
    navigate('/checkout');
  };

  const upcomingEvents = events;

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&q=80')" }}>
        <div className="hero-content">
          <h1>Enter The Fourth Dimension</h1>
          <p>Porto's premier HardTechno label bringing you the hardest beats and darkest nights</p>
          <button className="btn-primary" onClick={handleGetTickets}>
            Get Tickets Now
          </button>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="container section">
        <h2>Upcoming Events</h2>
        {loading ? (
          <p>Loading events...</p>
        ) : (
          <div className="grid grid-cols-3">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Media Center */}
      <section className="container section">
        <h2>Media Center</h2>
        <div className="media-grid">
          <a href="#" className="media-item">
            <div className="media-image">
              <img src="https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&q=80" alt="Event Photo" />
              <div className="media-badge">Photo</div>
            </div>
            <div className="media-content">
              <h3>DIMENSION IV Pre-Event</h3>
              <p>Check out the behind-the-scenes photos</p>
            </div>
          </a>

          <a href="#" className="media-item">
            <div className="media-image">
              <img src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=80" alt="Event Video" />
              <div className="media-badge">Video</div>
            </div>
            <div className="media-content">
              <h3>Aftermovie DIMENSION III</h3>
              <p>Relive the magic from our last edition</p>
            </div>
          </a>

          <a href="#" className="media-item">
            <div className="media-image">
              <img src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80" alt="Live Set" />
              <div className="media-badge">Set</div>
            </div>
            <div className="media-content">
              <h3>KOBOSIL Live Set</h3>
              <p>Experience the full techno journey</p>
            </div>
          </a>
        </div>
      </section>

      {/* Testimonials/Info */}
      <section className="container section info-section">
        <h2>Why Choose Us</h2>
        <div className="info-grid">
          <div className="info-card">
            <div className="icon">🎵</div>
            <h3>World-Class Lineup</h3>
            <p>International headliners and local talents performing cutting-edge techno</p>
          </div>
          <div className="info-card">
            <div className="icon">🎫</div>
            <h3>Easy Ticketing</h3>
            <p>Simple and secure ticket purchasing with multiple payment options</p>
          </div>
          <div className="info-card">
            <div className="icon">📍</div>
            <h3>Premium Venues</h3>
            <p>Carefully selected locations designed for optimal acoustics and atmosphere</p>
          </div>
          <div className="info-card">
            <div className="icon">🌙</div>
            <h3>Unforgettable Nights</h3>
            <p>Experience the darkest and hardest techno music in Europe</p>
          </div>
        </div>
      </section>
    </div>
  );
}

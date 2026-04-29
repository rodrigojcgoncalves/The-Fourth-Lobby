import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Ticket } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import './TicketsPage.css';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchTickets() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select('*, events(*), ticket_types(*)')
          .eq('user_id', user.id)
          .order('purchased_at', { ascending: false });

        if (error) throw error;
        setTickets(data as Ticket[]);
      } catch (err) {
        console.error("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, [user]);

  if (loading) {
    return <div className="container"><p>Loading your tickets...</p></div>;
  }

  if (tickets.length === 0) {
    return (
      <div className="container tickets-page">
        <h1>My Tickets</h1>
        <div className="empty-state">
          <p>You haven't purchased any tickets yet.</p>
          <a href="/" className="btn-primary">Browse Events</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container tickets-page">
      <h1>My Tickets</h1>
      <div className="tickets-list">
        {tickets.map(ticket => {
          const eventDate = ticket.events?.date ? new Date(ticket.events.date).toLocaleDateString('pt-PT') : '';
          
          return (
            <div key={ticket.id} className="ticket-item">
              <div className="ticket-header">
                <h3>{ticket.events?.name}</h3>
                <span className={`status ${ticket.status}`}>{ticket.status.toUpperCase()}</span>
              </div>
              <div className="ticket-info">
                <div className="info-row">
                  <span className="label">Date:</span>
                  <span className="value">{eventDate}</span>
                </div>
                <div className="info-row">
                  <span className="label">Ticket Phase:</span>
                  <span className="value">{ticket.ticket_types?.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Price:</span>
                  <span className="value">€{ticket.price_paid}</span>
                </div>
              </div>
              <div className="ticket-qr" style={{ padding: '10px', background: 'white', display: 'inline-block', borderRadius: '8px' }}>
                <QRCodeSVG value={ticket.id} size={120} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

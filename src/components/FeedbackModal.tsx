import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import './FeedbackModal.css';

interface PendingEvent {
  id: string;
  name: string;
  date: string;
  image_url: string;
}

export default function FeedbackModal() {
  const { user, role } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<PendingEvent | null>(null);
  
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Só mostramos o modal se houver utilizador logado e se a flag de ignorar não estiver ativa
    if (!user) return;
    // Organizadores não precisam de avaliar eventos
    if (role === 'organizer') return;
    
    const isDismissed = sessionStorage.getItem('feedback_modal_dismissed');
    if (isDismissed === 'true') {
      setLoading(false);
      return;
    }

    async function checkPendingFeedback() {
      try {
        const token = localStorage.getItem('jwt_token');
        if (!token) return;

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/feedbacks/pending`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Erro ao verificar feedbacks pendentes.');

        const data = await res.json();
        
        if (data.pendingEvent) {
          setPendingEvent(data.pendingEvent);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Erro no FeedbackModal:', err);
      } finally {
        setLoading(false);
      }
    }

    checkPendingFeedback();
  }, [user]);

  const handleDismiss = () => {
    sessionStorage.setItem('feedback_modal_dismissed', 'true');
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Por favor, escolhe uma classificação de 1 a 5 estrelas.');
      return;
    }
    
    if (!pendingEvent) return;

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/feedbacks`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event_id: pendingEvent.id,
          rating,
          comment
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Erro ao submeter feedback.');
      }

      setSuccess(true);
      setTimeout(() => {
        handleDismiss(); // Fecha o modal e não volta a chatear o utilizador
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !pendingEvent) return null;

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal-content">
        
        {success ? (
          <div className="feedback-success">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h3>Obrigado pelo teu feedback!</h3>
            <p>A tua opinião é essencial para melhorarmos as nossas festas.</p>
          </div>
        ) : (
          <>
            <button className="feedback-close-btn" onClick={handleDismiss}>&times;</button>
            <div className="feedback-header">
              <h2>O que achaste do evento?</h2>
              <h3 className="feedback-event-name">{pendingEvent.name}</h3>
            </div>

            <form onSubmit={handleSubmit} className="feedback-form">
              <div className="feedback-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${(hoverRating || rating) >= star ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    ★
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label htmlFor="comment">Deixa um comentário (Opcional)</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="A fila estava muito grande, mas o som estava incrível..."
                  rows={4}
                />
              </div>

              {error && <div className="form-error">{error}</div>}

              <div className="feedback-actions">
                <button type="button" className="btn-secondary" onClick={handleDismiss} disabled={submitting}>
                  Agora não
                </button>
                <button type="submit" className="btn-primary" disabled={submitting || rating === 0}>
                  {submitting ? 'A submeter...' : 'Submeter Avaliação'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

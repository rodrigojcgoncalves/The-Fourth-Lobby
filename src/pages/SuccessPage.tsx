import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SuccessPage.css';

export default function SuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="success-page">
      <div className="success-container">
        <div className="success-icon">✓</div>
        <h1>Payment Successful!</h1>
        <p>Your tickets have been confirmed and sent to your email.</p>

        <div className="order-details">
          <div className="detail-item">
            <span className="label">Order ID:</span>
            <span className="value">#ORD-2024-098743</span>
          </div>
          <div className="detail-item">
            <span className="label">Amount Paid:</span>
            <span className="value">€47.50</span>
          </div>
          <div className="detail-item">
            <span className="label">Event:</span>
            <span className="value">DIMENSION IV: The Awakening</span>
          </div>
          <div className="detail-item">
            <span className="label">Date:</span>
            <span className="value">April 15, 2026</span>
          </div>
        </div>

        <div className="actions">
          <button onClick={() => navigate('/tickets')} className="btn-primary">
            View My Tickets
          </button>
          <button onClick={() => navigate('/')} className="btn-secondary">
            Continue Shopping
          </button>
        </div>

        <p className="redirect-info">
          Redirecting to home page in 5 seconds...
        </p>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './SuccessPage.css';

export default function SuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  const state = location.state as {
    orderId?: string;
    total?: number;
    eventName?: string;
    eventDate?: string;
  } | null;

  useEffect(() => {
    // Se não houver estado de encomenda, redirecionar logo
    if (!state) {
      navigate('/');
      return;
    }

    const timer = setTimeout(() => {
      navigate('/');
    }, 10000); // 10 segundos para dar tempo de ler os detalhes
    return () => clearTimeout(timer);
  }, [navigate, state]);

  if (!state) return null;

  const orderIdShort = state.orderId ? state.orderId.substring(0, 8).toUpperCase() : 'N/A';
  const eventDateFormatted = state.eventDate 
    ? new Date(state.eventDate).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  return (
    <div className="success-page">
      <div className="success-container">
        <div className="success-icon">✓</div>
        <h1>{t('success_page.title')}</h1>
        <p>{t('success_page.subtitle')}</p>

        <div className="order-details">
          <div className="detail-item">
            <span className="label">{t('success_page.order_id')}</span>
            <span className="value">#{orderIdShort}</span>
          </div>
          <div className="detail-item">
            <span className="label">{t('success_page.amount')}</span>
            <span className="value">€{Number(state.total || 0).toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="label">{t('success_page.event')}</span>
            <span className="value">{state.eventName || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="label">{t('success_page.date')}</span>
            <span className="value">{eventDateFormatted}</span>
          </div>
        </div>

        <div className="actions">
          <button onClick={() => navigate('/tickets')} className="btn-primary">
            {t('success_page.btn_view')}
          </button>
          <button onClick={() => navigate('/')} className="btn-primary">
            {t('success_page.btn_home')}
          </button>
        </div>

        <p className="redirect-info">
          {t('success_page.redirecting')}
        </p>
      </div>
    </div>
  );
}

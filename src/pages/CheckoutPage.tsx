import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CheckoutPage.css';

interface CheckoutState {
  ticketTypeId: string;
  ticketTypeName: string;
  ticketTypeDescription?: string;
  price: number;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  quantity?: number;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CheckoutState | null;

  const [quantity, setQuantity] = useState(state?.quantity || 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados do Promocode
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  // Se não veio estado de navegação, é acesso direto (URL bar)
  if (!state) {
    return (
      <div className="container checkout-page">
        <div style={{ paddingTop: '4rem', textAlign: 'center' }}>
          <h2>Nenhum bilhete selecionado</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '1rem 0' }}>
            Escolhe um evento e seleciona uma fase de bilhetes para prosseguir.
          </p>
          <button className="btn-primary" onClick={() => navigate('/')}>Ver Eventos</button>
        </div>
      </div>
    );
  }

  // Bloquear checkout para eventos passados
  if (new Date(state.eventDate) < new Date()) {
    return (
      <div className="container checkout-page">
        <div style={{ paddingTop: '4rem', textAlign: 'center' }}>
          <h2>Evento já decorreu</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '1rem 0' }}>
            Não é possível comprar bilhetes para eventos que já decorreram.
          </p>
          <button className="btn-primary" onClick={() => navigate('/')}>Ver Eventos</button>
        </div>
      </div>
    );
  }

  const baseTotal = state.price * quantity;
  const discountAmount = appliedPromo ? (baseTotal * (appliedPromo.discountPercent / 100)) : 0;
  const total = (baseTotal - discountAmount).toFixed(2);

  const handleVerifyPromo = async () => {
    setPromoError(null);
    setPromoSuccess(null);
    if (!promoCodeInput.trim()) return;

    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/promoters/verify/${promoCodeInput.trim()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Código inválido');
      
      setAppliedPromo({ code: promoCodeInput.trim(), discountPercent: data.discount_percentage });
      setPromoSuccess(data.message);
    } catch (err: any) {
      setPromoError(err.message);
      setAppliedPromo(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setError('Sessão expirada. Faz login novamente.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ticket_type_id: state.ticketTypeId,
          quantity,
          referral_code: appliedPromo ? appliedPromo.code : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao processar compra.');

      // Sucesso → redirecionar para a página de confirmação
      navigate('/success', {
        state: {
          orderId: data.order.id,
          tickets: data.order.tickets,
          eventName: state.eventName,
          eventDate: state.eventDate,
          total: data.order.total_amount
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container checkout-page">
      <div className="checkout-wrapper">
        {/* Formulário */}
        <div className="checkout-form-section">
          <h1>Confirmar Compra</h1>

          {/* Resumo */}
          <div className="order-summary">
            <h3>Resumo da Encomenda</h3>
            <div className="summary-item">
              <span>{state.ticketTypeName}</span>
              <span>€{Number(state.price).toFixed(2)} / bilhete</span>
            </div>
            {state.ticketTypeDescription && (
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: '0.5rem 0' }}>
                {state.ticketTypeDescription}
              </p>
            )}
            <div className="summary-item">
              <span>Quantidade</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: 4, cursor: 'pointer' }}
                >−</button>
                <span style={{ minWidth: 20, textAlign: 'center' }}>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(10, q + 1))}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: 4, cursor: 'pointer' }}
                >+</button>
              </div>
            </div>
            
            {appliedPromo && (
              <div className="summary-item" style={{ color: '#4ade80' }}>
                <span>Desconto RP ({appliedPromo.discountPercent}%):</span>
                <span>-€{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-total" style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem', marginTop: '1rem' }}>
              <span>Total a Pagar:</span>
              <span style={{ color: appliedPromo ? '#4ade80' : 'white' }}>€{total}</span>
            </div>
          </div>

          {/* Secção de Promocode */}
          <div className="promocode-section glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h4 style={{ margin: '0 0 1rem 0' }}>Tens um código promocional?</h4>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="Ex: RODRIGO20" 
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', textTransform: 'uppercase' }}
                disabled={!!appliedPromo}
              />
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={appliedPromo ? () => { setAppliedPromo(null); setPromoCodeInput(''); setPromoSuccess(null); } : handleVerifyPromo}
              >
                {appliedPromo ? 'Remover' : 'Aplicar'}
              </button>
            </div>
            {promoError && <div style={{ color: 'var(--accent-red)', marginTop: '0.5rem', fontSize: '0.9rem' }}>{promoError}</div>}
            {promoSuccess && <div style={{ color: '#4ade80', marginTop: '0.5rem', fontSize: '0.9rem' }}>{promoSuccess}</div>}
          </div>

          {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

          <form onSubmit={handleSubmit} className="checkout-form">
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              🔒 O teu bilhete será emitido imediatamente após a confirmação.
            </p>
            <button type="submit" className="btn-primary checkout-button" disabled={loading}>
              {loading ? 'A processar...' : `✓ Confirmar Compra — €${total}`}
            </button>
            <button type="button" className="btn-secondary" style={{ marginTop: '0.75rem', width: '100%' }} onClick={() => navigate(-1)}>
              ← Voltar
            </button>
          </form>
        </div>

        {/* Sidebar com detalhes do evento */}
        <aside className="checkout-sidebar">
          <div className="sidebar-card">
            <h3>Detalhes do Evento</h3>
            <div className="event-info-item">
              <span className="label">Evento</span>
              <span className="value">{state.eventName}</span>
            </div>
            <div className="event-info-item">
              <span className="label">Data</span>
              <span className="value">
                {new Date(state.eventDate).toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'long' })}
              </span>
            </div>
            <div className="event-info-item">
              <span className="label">Local</span>
              <span className="value">{state.eventLocation}</span>
            </div>
            <div className="event-info-item">
              <span className="label">Fase</span>
              <span className="value">{state.ticketTypeName}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

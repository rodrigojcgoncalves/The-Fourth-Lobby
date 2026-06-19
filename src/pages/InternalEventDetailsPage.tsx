import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './InternalEventDetailsPage.css';

interface TicketType {
  id: string;
  name: string;
  price: number;
  total_quantity: number;
  sold_quantity: number;
}

interface EventStats {
  id: string;
  name: string;
  date: string;
  location: string;
  capacity: number;
  status: string;
  image_url: string;
  slug: string;
  ticket_types: TicketType[];
}

interface Guest {
  id: string;
  qr_code: string;
  status: string;
  price_paid: number;
  purchased_at: string;
  users: { email: string };
  ticket_types: { name: string };
}

interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  is_paid: boolean;
  paid_by: string | null;
}

type Tab = 'stats' | 'guests' | 'expenses' | 'edit';

const EXPENSE_CATEGORIES = ['Cachet', 'Som', 'Luzes', 'Decoração', 'Segurança', 'Marketing', 'Produção', 'Outro'];

export default function InternalEventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [event, setEvent] = useState<EventStats | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado do formulário de nova despesa
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', category: 'Cachet', amount: '', date: new Date().toISOString().slice(0, 10), is_paid: false, paid_by: '' });
  const [savingExpense, setSavingExpense] = useState(false);

  const token = localStorage.getItem('jwt_token');

  // Fetch event details
  useEffect(() => {
    async function fetchEvent() {
      if (!id || !token) return;
      setLoadingEvent(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Evento não encontrado ou sem permissão.');
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoadingEvent(false);
      }
    }
    fetchEvent();
  }, [id]);

  // Fetch guests
  useEffect(() => {
    if (activeTab !== 'guests' || guests.length > 0) return;
    async function fetchGuests() {
      if (!id || !token) return;
      setLoadingGuests(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/organizer/events/${id}/guests`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Erro ao carregar a lista de convidados.');
        const data = await res.json();
        setGuests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro');
      } finally {
        setLoadingGuests(false);
      }
    }
    fetchGuests();
  }, [activeTab, id]);

  // Fetch expenses
  useEffect(() => {
    if (activeTab !== 'expenses') return;
    fetchExpenses();
  }, [activeTab, id]);

  async function fetchExpenses() {
    if (!id || !token) return;
    setLoadingExpenses(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/expenses/event/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erro ao carregar despesas.');
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExpenses(false);
    }
  }

  // Também carrega as despesas na tab de stats para calcular o lucro
  useEffect(() => {
    if (activeTab !== 'stats' || expenses.length > 0) return;
    fetchExpenses();
  }, [activeTab]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !token) return;
    setSavingExpense(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/expenses/event/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          description: newExpense.description,
          category: newExpense.category,
          amount: Number(newExpense.amount),
          date: newExpense.date,
          is_paid: newExpense.is_paid,
          paid_by: newExpense.paid_by || null
        })
      });
      if (!res.ok) throw new Error('Erro ao adicionar despesa.');
      const data = await res.json();
      setExpenses(prev => [data.expense, ...prev]);
      setNewExpense({ description: '', category: 'Cachet', amount: '', date: new Date().toISOString().slice(0, 10), is_paid: false, paid_by: '' });
      setShowExpenseForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro');
    } finally {
      setSavingExpense(false);
    }
  };

  const handleTogglePaid = async (expenseId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/expenses/${expenseId}/toggle-paid`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({})
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao atualizar estado.');
      }
      const data = await res.json();
      setExpenses(prev => prev.map(e => e.id === expenseId ? data.expense : e));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Tens a certeza que queres apagar esta despesa?')) return;
    if (!token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erro ao apagar despesa.');
      setExpenses(prev => prev.filter(e => e.id !== expenseId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro');
    }
  };

  if (loadingEvent) return <div className="event-hub-loading">A carregar...</div>;
  if (error || !event) return <div className="event-hub-error">{error || 'Evento não encontrado.'}</div>;

  // --- Calculations ---
  const totalSold = event.ticket_types?.reduce((sum, tt) => sum + (tt.sold_quantity || 0), 0) ?? 0;
  const totalRevenue = event.ticket_types?.reduce((sum, tt) => sum + ((tt.sold_quantity || 0) * tt.price), 0) ?? 0;
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const paidExpenses = expenses.filter(e => e.is_paid).reduce((sum, e) => sum + Number(e.amount), 0);
  const pendingExpenses = totalExpenses - paidExpenses;
  const netProfit = totalRevenue - totalExpenses;
  const occupancyPct = event.capacity > 0 ? Math.round((totalSold / event.capacity) * 100) : 0;
  const statusLabel: Record<string, string> = { published: 'Publicado', draft: 'Rascunho', finished: 'Terminado' };
  const statusClass: Record<string, string> = { published: 'published', draft: 'draft', finished: 'finished' };

  return (
    <div className="event-hub">
      {/* Header do Evento */}
      <div className="event-hub-header">
        <button className="btn-back" onClick={() => navigate('/organizer')}>
          ← Voltar aos Eventos
        </button>
        <div className="event-hub-identity">
          {event.image_url && <img src={event.image_url} alt={event.name} className="event-hub-thumb" />}
          <div>
            <h2>{event.name}</h2>
            <p className="event-hub-meta">
              {new Date(event.date).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {event.location && ` · ${event.location}`}
            </p>
          </div>
          <span className={`badge ${statusClass[event.status] || 'draft'}`}>
            {statusLabel[event.status] || event.status}
          </span>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="event-hub-tabs">
        <button className={`hub-tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
          Estatísticas
        </button>
        <button className={`hub-tab ${activeTab === 'guests' ? 'active' : ''}`} onClick={() => setActiveTab('guests')}>
          Bilheteira
        </button>
        <button className={`hub-tab ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>
          Despesas
        </button>
        <button className={`hub-tab ${activeTab === 'edit' ? 'active' : ''}`} onClick={() => setActiveTab('edit')}>
          Editar
        </button>
        <button className="hub-tab" onClick={() => navigate(`/qr-scanner?event=${id}`)}>
          Check-in
        </button>
      </div>

      {/* Conteúdo da Tab Ativa */}
      <div className="event-hub-body">

        {/* TAB: ESTATÍSTICAS */}
        {activeTab === 'stats' && (
          <div className="tab-stats">
            <div className="stats-grid">
              <div className="stat-card accent">
                <div className="stat-content">
                  <p className="stat-label">Receita Total</p>
                  <p className="stat-value">€{totalRevenue.toFixed(2)}</p>
                </div>
              </div>
              <div className={`stat-card ${netProfit >= 0 ? 'accent-green' : 'accent-red'}`}>
                <div className="stat-content">
                  <p className="stat-label">Lucro Líquido</p>
                  <p className="stat-value" style={{ color: netProfit >= 0 ? '#22c55e' : '#ef4444' }}>
                    {netProfit >= 0 ? '+' : ''}€{netProfit.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-content">
                  <p className="stat-label">Bilhetes Vendidos</p>
                  <p className="stat-value">{totalSold}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-content">
                  <p className="stat-label">Ocupação</p>
                  <p className="stat-value">{occupancyPct}%</p>
                </div>
              </div>
            </div>

            {/* Resumo financeiro rápido */}
            {expenses.length > 0 && (
              <div className="finance-summary">
                <div className="finance-row">
                  <span>Receita de Bilhetes</span>
                  <span className="finance-value positive">+€{totalRevenue.toFixed(2)}</span>
                </div>
                <div className="finance-row">
                  <span>Total de Despesas</span>
                  <span className="finance-value negative">-€{totalExpenses.toFixed(2)}</span>
                </div>
                <div className="finance-row finance-divider">
                  <span>Despesas Pagas</span>
                  <span className="finance-value">€{paidExpenses.toFixed(2)}</span>
                </div>
                <div className="finance-row">
                  <span>Despesas Pendentes</span>
                  <span className="finance-value" style={{ color: '#fbbf24' }}>€{pendingExpenses.toFixed(2)}</span>
                </div>
                <div className="finance-row finance-total">
                  <span>Lucro Líquido</span>
                  <span className={`finance-value ${netProfit >= 0 ? 'positive' : 'negative'}`}>
                    {netProfit >= 0 ? '+' : ''}€{netProfit.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Ocupação por fase */}
            <div className="phase-breakdown">
              <h3>Ocupação por Fase</h3>
              <div className="phase-list">
                {event.ticket_types?.length ? event.ticket_types.map(tt => {
                  const pct = tt.total_quantity > 0 ? Math.round((tt.sold_quantity / tt.total_quantity) * 100) : 0;
                  return (
                    <div key={tt.id} className="phase-row">
                      <div className="phase-info">
                        <span className="phase-name">{tt.name}</span>
                        <span className="phase-numbers">{tt.sold_quantity} / {tt.total_quantity} · €{tt.price.toFixed(2)}</span>
                      </div>
                      <div className="phase-bar-track">
                        <div className="phase-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="phase-pct">{pct}%</span>
                    </div>
                  );
                }) : <p className="muted">Sem fases de bilhetes configuradas.</p>}
              </div>
            </div>
          </div>
        )}

        {/* TAB: BILHETEIRA */}
        {activeTab === 'guests' && (
          <div className="tab-guests">
            {loadingGuests ? (
              <p className="muted">A carregar a lista de convidados...</p>
            ) : guests.length === 0 ? (
              <div className="empty-state"><p>Nenhum bilhete vendido ainda.</p></div>
            ) : (
              <>
                <p className="muted" style={{ marginBottom: '1rem' }}>{guests.length} bilhete(s) emitido(s)</p>
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Fase</th>
                      <th>Valor Pago</th>
                      <th>Data Compra</th>
                      <th>Estado</th>
                      <th>QR Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guests.map(g => (
                      <tr key={g.id}>
                        <td>{g.users?.email || '—'}</td>
                        <td>{g.ticket_types?.name || '—'}</td>
                        <td>€{Number(g.price_paid).toFixed(2)}</td>
                        <td>{new Date(g.purchased_at).toLocaleDateString('pt-PT')}</td>
                        <td>
                          <span className={`badge ${g.status}`}>
                            {g.status === 'valid' ? 'Válido' : g.status === 'used' ? 'Usado' : g.status}
                          </span>
                        </td>
                        <td className="qr-cell">{g.qr_code}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {/* TAB: DESPESAS */}
        {activeTab === 'expenses' && (
          <div className="tab-expenses">
            {/* Header da aba com resumo e botão */}
            <div className="expenses-header">
              <div className="expenses-summary">
                <div className="expense-summary-item">
                  <span className="expense-summary-label">Total</span>
                  <span className="expense-summary-value">€{totalExpenses.toFixed(2)}</span>
                </div>
                <div className="expense-summary-item paid">
                  <span className="expense-summary-label">Pagas</span>
                  <span className="expense-summary-value">€{paidExpenses.toFixed(2)}</span>
                </div>
                <div className="expense-summary-item pending">
                  <span className="expense-summary-label">Pendentes</span>
                  <span className="expense-summary-value">€{pendingExpenses.toFixed(2)}</span>
                </div>
              </div>
              <button className="btn-primary btn-sm" onClick={() => setShowExpenseForm(!showExpenseForm)}>
                {showExpenseForm ? '✕ Cancelar' : '+ Adicionar Despesa'}
              </button>
            </div>

            {/* Formulário de nova despesa */}
            {showExpenseForm && (
              <form className="expense-form glass-panel-inner" onSubmit={handleAddExpense}>
                <h4>Nova Despesa</h4>
                <div className="expense-form-grid">
                  <div className="form-group">
                    <label>Descrição *</label>
                    <input
                      type="text"
                      value={newExpense.description}
                      onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                      placeholder="Ex: Cachet DJ Fulano"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Categoria</label>
                    <select
                      value={newExpense.category}
                      onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                      className="glass-select"
                    >
                      {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Valor (€) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newExpense.amount}
                      onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Data</label>
                    <input
                      type="date"
                      value={newExpense.date}
                      onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Pago por</label>
                    <input
                      type="text"
                      value={newExpense.paid_by}
                      onChange={e => setNewExpense({ ...newExpense, paid_by: e.target.value })}
                      placeholder="Nome do responsável"
                    />
                  </div>
                  <div className="form-group form-group-checkbox">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newExpense.is_paid}
                        onChange={e => setNewExpense({ ...newExpense, is_paid: e.target.checked })}
                      />
                      <span>Já foi paga</span>
                    </label>
                  </div>
                </div>
                <div className="expense-form-actions">
                  <button type="submit" className="btn-primary btn-sm" disabled={savingExpense}>
                    {savingExpense ? 'A guardar...' : '✓ Guardar Despesa'}
                  </button>
                </div>
              </form>
            )}

            {/* Lista de despesas */}
            {loadingExpenses ? (
              <p className="muted" style={{ marginTop: '1.5rem' }}>A carregar despesas...</p>
            ) : expenses.length === 0 ? (
              <div className="empty-state" style={{ marginTop: '1.5rem' }}>
                <p>Sem despesas registadas para este evento.</p>
              </div>
            ) : (
              <table className="dashboard-table" style={{ marginTop: '1.5rem' }}>
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Valor</th>
                    <th>Data</th>
                    <th>Responsável</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(exp => (
                    <tr key={exp.id}>
                      <td>{exp.description}</td>
                      <td><span className="category-badge">{exp.category}</span></td>
                      <td>€{Number(exp.amount).toFixed(2)}</td>
                      <td>{new Date(exp.date).toLocaleDateString('pt-PT')}</td>
                      <td>{exp.paid_by || <span className="muted">—</span>}</td>
                      <td>
                        <button
                          className={`paid-toggle ${exp.is_paid ? 'is-paid' : 'not-paid'}`}
                          onClick={() => handleTogglePaid(exp.id)}
                          title={exp.is_paid ? 'Marcar como Pendente' : 'Marcar como Paga'}
                        >
                          {exp.is_paid ? '✓ Paga' : '⏳ Pendente'}
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDeleteExpense(exp.id)}
                          title="Apagar despesa"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB: EDITAR EVENTO */}
        {activeTab === 'edit' && (
          <div className="tab-edit">
            <p className="muted" style={{ marginBottom: '1.5rem' }}>Para editar os detalhes, imagem e fases do evento, vai para o formulário completo.</p>
            <button className="btn-primary" onClick={() => navigate(`/organizer/edit-event/${id}`)}>
              ✏️ Abrir Formulário de Edição
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

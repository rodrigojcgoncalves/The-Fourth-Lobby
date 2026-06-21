import { useState, useEffect } from 'react';
import './OrganizerFeedbackPage.css';

interface Feedback {
  id: string;
  event_id: string;
  rating: number;
  comment: string;
  sentiment: 'positivo' | 'neutro' | 'negativo';
  topic?: string;
  created_at: string;
  users: {
    full_name: string;
    email: string;
  };
  events: {
    name: string;
  };
}

export default function OrganizerFeedbackPage() {
  const [allFeedbacks, setAllFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para o Resumo IA
  const [summary, setSummary] = useState<string | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  // Filtros
  const [filterEvent, setFilterEvent] = useState('todos');
  const [filterSentiment, setFilterSentiment] = useState('todos');

  useEffect(() => {
    fetchFeedbacks();
  }, []); // Faz fetch apenas uma vez ao montar

  // Limpar o resumo sempre que o evento filtrado mudar
  useEffect(() => {
    setSummary(null);
  }, [filterEvent]);

  async function fetchFeedbacks() {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      
      const url = new URL(`${import.meta.env.VITE_API_URL}/api/feedbacks/organizer`);
      const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Falha ao carregar feedbacks');
      
      const data = await res.json();
      setAllFeedbacks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  // 1. Calcular eventos únicos a partir da lista total (assim nunca desaparecem do dropdown)
  const uniqueEvents = Array.from(
    new Map(allFeedbacks.map(f => [f.event_id, { id: f.event_id, name: f.events?.name }])).values()
  );

  // 2. Aplicar filtros localmente
  const filteredFeedbacks = allFeedbacks.filter(f => {
    const matchEvent = filterEvent === 'todos' || f.event_id === filterEvent;
    const matchSentiment = filterSentiment === 'todos' || f.sentiment === filterSentiment;
    return matchEvent && matchSentiment;
  });

  // 3. Cálculos para o Termómetro Social (baseado nos feedbacks filtrados)
  const totalFeedbacks = filteredFeedbacks.length;
  const avgRating = totalFeedbacks > 0 
    ? (filteredFeedbacks.reduce((acc, f) => acc + f.rating, 0) / totalFeedbacks).toFixed(1)
    : 0;

  const positivos = filteredFeedbacks.filter(f => f.sentiment === 'positivo').length;
  const neutros = filteredFeedbacks.filter(f => f.sentiment === 'neutro').length;
  const negativos = filteredFeedbacks.filter(f => f.sentiment === 'negativo').length;

  const pctPositivo = totalFeedbacks > 0 ? (positivos / totalFeedbacks) * 100 : 0;
  const pctNeutro = totalFeedbacks > 0 ? (neutros / totalFeedbacks) * 100 : 0;
  const pctNegativo = totalFeedbacks > 0 ? (negativos / totalFeedbacks) * 100 : 0;

  // 4. Contagem de Tópicos
  const topicCounts = filteredFeedbacks.reduce((acc, f) => {
    const t = f.topic || 'Geral';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);

  // Gerar resumo chamando o backend
  async function handleGenerateSummary() {
    if (filterEvent === 'todos') return;
    try {
      setGeneratingSummary(true);
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/feedbacks/organizer/summary?event_id=${filterEvent}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Falha ao gerar resumo');
      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
      setSummary("Não foi possível gerar o resumo neste momento.");
    } finally {
      setGeneratingSummary(false);
    }
  }

  return (
    <div className="organizer-feedback-page">
      <header className="page-header">
        <h1>Centro de Inteligência Artificial</h1>
        <p>Análise de sentimento e feedback dos teus eventos.</p>
      </header>

      {/* Termómetro Social */}
      <section className="social-thermometer">
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Classificação Média</h3>
            <div className="rating-display">
              <span className="big-number">{avgRating}</span>
              <span className="stars">/ 5.0</span>
            </div>
          </div>
          
          <div className="metric-card flex-2">
            <h3>Termómetro Social (NLP)</h3>
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div className="segment positivo" style={{ width: `${pctPositivo}%` }}></div>
                <div className="segment neutro" style={{ width: `${pctNeutro}%` }}></div>
                <div className="segment negativo" style={{ width: `${pctNegativo}%` }}></div>
              </div>
            </div>
            <div className="progress-legend">
              <span><span className="dot positivo"></span> Positivo ({Math.round(pctPositivo)}%)</span>
              <span><span className="dot neutro"></span> Neutro ({Math.round(pctNeutro)}%)</span>
              <span><span className="dot negativo"></span> Negativo ({Math.round(pctNegativo)}%)</span>
            </div>
          </div>
          
          <div className="metric-card">
            <h3>Assuntos Mais Falados</h3>
            {sortedTopics.length > 0 ? (
              <ul className="topics-list">
                {sortedTopics.map(([topic, count]) => (
                  <li key={topic}>
                    <span className="topic-name">{topic}</span>
                    <span className="topic-count">{count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="loading-text" style={{marginTop: '1rem'}}>Sem tópicos ainda.</p>
            )}
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="feedback-filters">
        <div className="filter-group">
          <label>Evento</label>
          <select value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)}>
            <option value="todos">Todos os Eventos</option>
            {uniqueEvents.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Sentimento (IA)</label>
          <select value={filterSentiment} onChange={(e) => setFilterSentiment(e.target.value)}>
            <option value="todos">Todos os Sentimentos</option>
            <option value="positivo">Apenas Positivos</option>
            <option value="neutro">Apenas Neutros</option>
            <option value="negativo">Apenas Negativos</option>
          </select>
        </div>
      </section>

      {/* Secção Resumo IA (Apenas vísivel com um evento selecionado) */}
      {filterEvent !== 'todos' && (
        <section className="ai-summary-section">
          <div className="ai-summary-card">
            <div className="ai-summary-header">
              <h3>Resumo da Festa por IA</h3>
              {!summary && !generatingSummary && (
                <button className="btn-generate" onClick={handleGenerateSummary}>
                  Gerar Resumo
                </button>
              )}
            </div>
            
            {generatingSummary && (
              <div className="ai-generating">
                <p>A Inteligência Artificial está a ler os comentários...</p>
              </div>
            )}
            
            {summary && !generatingSummary && (
              <div className="ai-summary-content">
                <p>"{summary}"</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Feed de Comentários */}
      <section className="feedbacks-feed">
        {loading ? (
          <p className="loading-text">A analisar dados com a IA...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : filteredFeedbacks.length === 0 ? (
          <p className="empty-text">Ainda não existem feedbacks com estes filtros.</p>
        ) : (
          <div className="feed-list">
            {filteredFeedbacks.map((f) => (
              <div key={f.id} className="feedback-card">
                <div className="f-header">
                  <div>
                    <strong>{f.users.full_name || f.users.email}</strong>
                    <span className="f-event"> em {f.events.name}</span>
                  </div>
                  <div className="tags-container" style={{display: 'flex', gap: '0.5rem'}}>
                    <div className="sentiment-tag" style={{background: '#333', color: '#fff'}}>
                      {(f.topic || 'Geral').toUpperCase()}
                    </div>
                    <div className={`sentiment-tag ${f.sentiment}`}>
                      {f.sentiment.toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="f-stars">
                  {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}
                </div>
                {f.comment && (
                  <p className="f-comment">"{f.comment}"</p>
                )}
                <span className="f-date">{new Date(f.created_at).toLocaleDateString('pt-PT')}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

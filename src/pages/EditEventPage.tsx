import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './CreateEventPage.css'; // reutiliza os mesmos estilos

interface TicketPhase {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

interface Artist {
  id: string;
  name: string;
  genre: string;
  bio?: string;
  image_url?: string;
}

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // STEP 1
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState('published');

  // STEP 2
  const [phases, setPhases] = useState<TicketPhase[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);
  const [searchArtistTerm, setSearchArtistTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Artist[]>([]);
  const [isCreatingArtist, setIsCreatingArtist] = useState(false);
  const [newArtist, setNewArtist] = useState({ name: '', genre: '', bio: '', image_url: '' });
  const [artistImageFile, setArtistImageFile] = useState<File | null>(null);
  const [artistImagePreview, setArtistImagePreview] = useState<string | null>(null);
  const [artistUploading, setArtistUploading] = useState(false);

  const token = localStorage.getItem('jwt_token');

  // Carregar dados do evento
  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/events/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Evento não encontrado.');
        const data = await res.json();

        setTitle(data.name);
        // Formatar data para datetime-local
        const d = new Date(data.date);
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString().slice(0, 16);
        setDate(local);
        setCapacity(String(data.capacity));
        setLocation(data.location);
        setDescription(data.description || '');
        setCurrentImageUrl(data.image_url || '');
        setStatus(data.status);

        // Fases
        if (data.ticket_types && data.ticket_types.length > 0) {
          setPhases(data.ticket_types.map((t: any) => ({
            id: t.id,
            name: t.name,
            description: t.description || '',   // ← corrigido: ler do DB
            price: t.price,
            quantity: t.total_quantity
          })));
        } else {
          setPhases([{ id: crypto.randomUUID(), name: 'Fase Geral', description: '', price: 10, quantity: 100 }]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar evento.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Pesquisa de artistas com debounce
  useEffect(() => {
    if (searchArtistTerm.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('http://localhost:5000/api/artists');
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.filter((a: Artist) =>
            a.name.toLowerCase().includes(searchArtistTerm.toLowerCase())
          ));
        }
      } catch (e) { console.error(e); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchArtistTerm]);

  // Handlers de imagem do evento
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Avançar step
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !capacity || !location) {
      setError('Preenche os campos obrigatórios.');
      return;
    }
    setError(null);
    setStep(2);
  };

  // Fases handlers
  const addPhase = () => setPhases([...phases, { id: `new-${Date.now()}`, name: '', description: '', price: 0, quantity: 0 }]);
  const updatePhase = (phaseId: string, field: keyof TicketPhase, value: string | number) =>
    setPhases(phases.map(p => p.id === phaseId ? { ...p, [field]: value } : p));
  const removePhase = (phaseId: string) => setPhases(phases.filter(p => p.id !== phaseId));

  // Artists handlers
  const selectArtist = (artist: Artist) => {
    if (!selectedArtists.find(a => a.id === artist.id)) setSelectedArtists([...selectedArtists, artist]);
    setSearchArtistTerm('');
    setSearchResults([]);
  };
  const removeSelectedArtist = (artistId: string) => setSelectedArtists(selectedArtists.filter(a => a.id !== artistId));

  const handleArtistImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setArtistImageFile(file);
      setArtistImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    setArtistUploading(true);
    try {
      let finalImageUrl = newArtist.image_url;
      if (artistImageFile) {
        const formData = new FormData();
        formData.append('image', artistImageFile);
        const uploadRes = await fetch('http://localhost:5000/api/artists/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || 'Erro no upload da foto');
        finalImageUrl = uploadData.imageUrl;
      }
      const res = await fetch('http://localhost:5000/api/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...newArtist, image_url: finalImageUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao criar artista');
      selectArtist(data);
      setIsCreatingArtist(false);
      setNewArtist({ name: '', genre: '', bio: '', image_url: '' });
      setArtistImageFile(null);
      setArtistImagePreview(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar artista');
    } finally {
      setArtistUploading(false);
    }
  };

  // Submeter edição
  const handleFinalSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      let uploadedImageUrl = currentImageUrl;

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await fetch('http://localhost:5000/api/events/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || 'Erro no upload da imagem');
        uploadedImageUrl = uploadData.imageUrl;
      }

      const payload = {
        name: title,
        description,
        date,
        location,
        capacity: Number(capacity),
        image_url: uploadedImageUrl,
        status,
        phases: phases.map(p => ({
          id: p.id,        // ← corrigido: incluir o ID para o backend identificar fases existentes
          name: p.name,
          description: p.description,
          price: Number(p.price),
          quantity: Number(p.quantity)
        })),
        artists: selectedArtists.map(a => a.id)
      };

      const res = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao guardar');

      alert('Evento atualizado com sucesso!');
      navigate('/organizer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao guardar');
      setSaving(false);
    }
  };

  if (loading) return <div className="container" style={{ paddingTop: '3rem' }}><p>A carregar evento...</p></div>;

  return (
    <div className="container create-event-page">
      <h1 style={{ color: 'var(--neon-cyan)' }}>Editar Evento</h1>

      {/* Stepper */}
      <div className="stepper">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-circle">1</div>
          <span>Informações & Média</span>
        </div>
        <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-circle">2</div>
          <span>Bilhética & Artistas</span>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="form-container glass-panel">
        {/* ─── STEP 1 ─── */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="create-event-form">
            <fieldset>
              <legend>Detalhes Básicos</legend>
              <div className="form-group">
                <label>Título do Evento *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Data e Hora *</label>
                  <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Capacidade Total *</label>
                  <input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} required min="1" />
                </div>
              </div>
              <div className="form-group">
                <label>Localização *</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}></textarea>
              </div>
            </fieldset>

            <fieldset>
              <legend>Cartaz & Visibilidade</legend>
              <div className="form-row">
                <div className="form-group">
                  <label>Cartaz Atual</label>
                  {currentImageUrl ? (
                    <div className="image-preview-wrap">
                      <img src={currentImageUrl} alt="Cartaz atual" className="image-preview-thumb" />
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Imagem atual</span>
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Sem cartaz definido.</p>
                  )}
                  <label style={{ marginTop: '0.75rem', display: 'block' }}>
                    Substituir cartaz <span className="label-hint">(opcional)</span>
                  </label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" />
                  {imagePreview && (
                    <div className="image-preview-wrap" style={{ marginTop: '0.5rem' }}>
                      <img src={imagePreview} alt="Nova imagem" className="image-preview-thumb" />
                      <button type="button" className="btn-remove-img" onClick={() => { setImageFile(null); setImagePreview(null); }}>✖ Remover</button>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="glass-select">
                    <option value="published">Publicado</option>
                    <option value="draft">Rascunho</option>
                  </select>
                </div>
              </div>
            </fieldset>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => navigate('/organizer')}>← Cancelar</button>
              <button type="submit" className="btn-primary">Próximo →</button>
            </div>
          </form>
        )}

        {/* ─── STEP 2 ─── */}
        {step === 2 && (
          <div className="create-event-form">
            <fieldset>
              <legend>Fases de Bilhetes</legend>
              <p className="helper-text">Atenção: ao guardar, as fases existentes serão substituídas pelas que definires aqui.</p>
              <div className="phases-list">
                {phases.map(phase => (
                  <div key={phase.id} className="phase-card glass-panel-inner">
                    <div className="phase-header">
                      <div className="form-group" style={{ flex: 2 }}>
                        <label>Nome da Fase *</label>
                        <input type="text" value={phase.name} onChange={e => updatePhase(phase.id, 'name', e.target.value)} required />
                      </div>
                      {phases.length > 1 && (
                        <button type="button" onClick={() => removePhase(phase.id)} className="btn-remove">✖</button>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Descrição da Fase</label>
                      <input type="text" value={phase.description} onChange={e => updatePhase(phase.id, 'description', e.target.value)} placeholder="Ex: Acesso geral ao recinto" />
                    </div>
                    <div className="form-row-3">
                      <div className="form-group">
                        <label>Preço (€) *</label>
                        <input type="number" step="0.01" min="0" value={phase.price} onChange={e => updatePhase(phase.id, 'price', e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label>Quantidade *</label>
                        <input type="number" min="1" value={phase.quantity} onChange={e => updatePhase(phase.id, 'quantity', e.target.value)} required />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addPhase} className="btn-secondary btn-sm">+ Adicionar Fase</button>
            </fieldset>

            <fieldset style={{ marginTop: '2rem' }}>
              <legend>Artistas / Line-up</legend>
              {selectedArtists.length > 0 && (
                <div className="selected-artists">
                  {selectedArtists.map(artist => (
                    <div key={artist.id} className="artist-badge">
                      {artist.image_url && <img src={artist.image_url} alt={artist.name} className="artist-badge-img" />}
                      <span>{artist.name}</span>
                      <span className="artist-badge-genre">{artist.genre}</span>
                      <button onClick={() => removeSelectedArtist(artist.id)}>✖</button>
                    </div>
                  ))}
                </div>
              )}

              {!isCreatingArtist ? (
                <div className="artist-search">
                  <div className="form-group">
                    <label>Pesquisar artista existente</label>
                    <input type="text" value={searchArtistTerm} onChange={e => setSearchArtistTerm(e.target.value)} placeholder="Começa a escrever o nome..." />
                  </div>
                  {searchResults.length > 0 && (
                    <ul className="search-results glass-panel-inner">
                      {searchResults.map(artist => (
                        <li key={artist.id} onClick={() => selectArtist(artist)}>
                          {artist.image_url && <img src={artist.image_url} alt={artist.name} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', marginRight: 8 }} />}
                          <strong>{artist.name}</strong><span>{artist.genre}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>
                    Não encontras? <button type="button" onClick={() => setIsCreatingArtist(true)} className="link-button">Criar novo artista</button>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCreateArtist} className="new-artist-form glass-panel-inner">
                  <h4>Novo Artista</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nome *</label>
                      <input type="text" value={newArtist.name} onChange={e => setNewArtist({ ...newArtist, name: e.target.value })} required autoFocus />
                    </div>
                    <div className="form-group">
                      <label>Género *</label>
                      <input type="text" value={newArtist.genre} onChange={e => setNewArtist({ ...newArtist, genre: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Foto <span className="label-hint">(ficheiro ou URL)</span></label>
                    <div className="artist-photo-input">
                      <input type="file" accept="image/*" onChange={handleArtistImageChange} className="file-input" />
                      {!artistImageFile && (
                        <input type="url" value={newArtist.image_url} onChange={e => setNewArtist({ ...newArtist, image_url: e.target.value })} placeholder="Ou cola uma URL..." />
                      )}
                      {artistImagePreview && (
                        <div className="image-preview-wrap">
                          <img src={artistImagePreview} alt="Preview" className="artist-preview-img" />
                          <button type="button" className="btn-remove-img" onClick={() => { setArtistImageFile(null); setArtistImagePreview(null); }}>✖ Remover</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                    <button type="submit" className="btn-primary btn-sm" disabled={artistUploading}>
                      {artistUploading ? 'A guardar...' : 'Guardar e Selecionar'}
                    </button>
                    <button type="button" onClick={() => setIsCreatingArtist(false)} className="btn-secondary btn-sm">Cancelar</button>
                  </div>
                </form>
              )}
            </fieldset>

            <div className="form-actions" style={{ justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setStep(1)} className="btn-secondary">← Anterior</button>
              <button type="button" onClick={handleFinalSubmit} className="btn-primary" disabled={saving}>
                {saving ? 'A guardar...' : '✓ Guardar Alterações'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

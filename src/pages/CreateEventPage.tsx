import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateEventPage.css';

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

export default function CreateEventPage() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- STEP 1: Basic Info & Media ---
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState('published');

  // --- STEP 2: Ticketing & Artists ---
  const [phases, setPhases] = useState<TicketPhase[]>([
    { id: '1', name: 'Early Bird', description: 'Bilhetes com preço reduzido para os mais rápidos.', price: 15.0, quantity: 100 }
  ]);
  
  // Artists
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);
  const [searchArtistTerm, setSearchArtistTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Artist[]>([]);
  const [isCreatingArtist, setIsCreatingArtist] = useState(false);
  const [newArtist, setNewArtist] = useState({ name: '', genre: '', bio: '', image_url: '' });
  const [artistImageFile, setArtistImageFile] = useState<File | null>(null);
  const [artistImagePreview, setArtistImagePreview] = useState<string | null>(null);
  const [artistUploading, setArtistUploading] = useState(false);

  // Debounced artist search
  useEffect(() => {
    if (searchArtistTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    const fetchArtists = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/artists`);
        if (response.ok) {
          const data = await response.json();
          const filtered = data.filter((a: Artist) => 
            a.name.toLowerCase().includes(searchArtistTerm.toLowerCase())
          );
          setSearchResults(filtered);
        }
      } catch (err) {
        console.error('Erro ao pesquisar artistas:', err);
      }
    };
    const debounce = setTimeout(fetchArtists, 300);
    return () => clearTimeout(debounce);
  }, [searchArtistTerm]);

  // STEP 1 handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !capacity || !location) {
      setError('Preenche os campos obrigatórios.');
      return;
    }
    if (!imageFile) {
      setError('É obrigatório fazer upload do cartaz do evento.');
      return;
    }
    setError(null);
    setStep(2);
  };

  // STEP 2 - Phases
  const addPhase = () => {
    setPhases([...phases, { id: Math.random().toString(), name: '', description: '', price: 0, quantity: 0 }]);
  };

  const updatePhase = (id: string, field: keyof TicketPhase, value: string | number) => {
    setPhases(phases.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePhase = (id: string) => {
    setPhases(phases.filter(p => p.id !== id));
  };

  // STEP 2 - Artists
  const selectArtist = (artist: Artist) => {
    if (!selectedArtists.find(a => a.id === artist.id)) {
      setSelectedArtists([...selectedArtists, artist]);
    }
    setSearchArtistTerm('');
    setSearchResults([]);
  };

  const removeSelectedArtist = (id: string) => {
    setSelectedArtists(selectedArtists.filter(a => a.id !== id));
  };

  const handleArtistImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setArtistImageFile(file);
      setArtistImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('jwt_token');
    setArtistUploading(true);
    
    try {
      let finalImageUrl = newArtist.image_url;

      // Upload artist photo if a file was selected
      if (artistImageFile) {
        const formData = new FormData();
        formData.append('image', artistImageFile);

        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/artists/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || 'Erro no upload da foto');
        finalImageUrl = uploadData.imageUrl;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/artists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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

  // Final Submit
  const handleFinalSubmit = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('jwt_token');

    try {
      // 1. Upload Event Poster
      let uploadedImageUrl = '';
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/events/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || 'Erro no upload da imagem');
        uploadedImageUrl = uploadData.imageUrl;
      }

      // 2. Create Event with all data
      const eventPayload = {
        name: title,
        description,
        date,
        location,
        capacity: Number(capacity),
        image_url: uploadedImageUrl,
        status,
        phases: phases.map(p => ({
          name: p.name,
          description: p.description,
          price: Number(p.price),
          quantity: Number(p.quantity)
        })),
        artists: selectedArtists.map(a => a.id)
      };

      const eventRes = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventPayload)
      });

      const eventData = await eventRes.json();
      if (!eventRes.ok) throw new Error(eventData.message || 'Erro ao criar evento');

      alert('Evento criado com sucesso!');
      navigate('/organizer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao submeter');
      setLoading(false);
    }
  };

  return (
    <div className="container create-event-page">
      <h1>Criar Novo Evento</h1>

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
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ex: DIMENSION V: The Transcendence" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Data e Hora *</label>
                  <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Capacidade Total *</label>
                  <input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} required placeholder="Ex: 1000" min="1" />
                </div>
              </div>

              <div className="form-group">
                <label>Localização *</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} required placeholder="Ex: Hard Club, Porto" />
              </div>

              <div className="form-group">
                <label>Descrição do Evento</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Descreve a experiência que os participantes vão ter..."></textarea>
              </div>
            </fieldset>

            <fieldset>
              <legend>Cartaz & Visibilidade</legend>

              <div className="form-row">
                <div className="form-group">
                  <label>Cartaz do Evento * <span className="label-hint">(Imagem, max. 10MB)</span></label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  {imagePreview && (
                    <div className="image-preview-wrap">
                      <img src={imagePreview} alt="Preview do cartaz" className="image-preview-thumb" />
                      <button type="button" className="btn-remove-img" onClick={() => { setImageFile(null); setImagePreview(null); }}>✖ Remover</button>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Estado Inicial</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="glass-select">
                    <option value="published">Publicado (Visível para todos)</option>
                    <option value="draft">Rascunho (Apenas tu consegues ver)</option>
                  </select>
                  <p className="field-hint">Podes mudar o estado mais tarde.</p>
                </div>
              </div>
            </fieldset>

            <div className="form-actions">
              <button type="submit" className="btn-primary">Próximo Passo →</button>
            </div>
          </form>
        )}

        {/* ─── STEP 2 ─── */}
        {step === 2 && (
          <div className="create-event-form">

            {/* Ticket Phases */}
            <fieldset>
              <legend>Fases de Bilhetes</legend>
              <p className="helper-text">Define as fases de venda. A soma das quantidades não deve exceder a capacidade total ({capacity} lugares).</p>
              
              <div className="phases-list">
                {phases.map((phase) => (
                  <div key={phase.id} className="phase-card glass-panel-inner">
                    <div className="phase-header">
                      <div className="form-group" style={{ flex: 2 }}>
                        <label>Nome da Fase *</label>
                        <input type="text" value={phase.name} onChange={e => updatePhase(phase.id, 'name', e.target.value)} placeholder="Ex: 1ª Fase, VIP, Early Bird..." required />
                      </div>
                      {phases.length > 1 && (
                        <button type="button" onClick={() => removePhase(phase.id)} className="btn-remove" title="Remover Fase">✖</button>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Descrição da Fase</label>
                      <input
                        type="text"
                        value={phase.description}
                        onChange={e => updatePhase(phase.id, 'description', e.target.value)}
                        placeholder="Ex: Acesso geral ao recinto + brindes exclusivos"
                      />
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

            {/* Artists */}
            <fieldset style={{ marginTop: '2rem' }}>
              <legend>Artistas / Line-up</legend>

              {selectedArtists.length > 0 && (
                <div className="selected-artists">
                  {selectedArtists.map(artist => (
                    <div key={artist.id} className="artist-badge">
                      {artist.image_url && <img src={artist.image_url} alt={artist.name} className="artist-badge-img" />}
                      <span>{artist.name}</span>
                      <span className="artist-badge-genre">{artist.genre}</span>
                      <button onClick={() => removeSelectedArtist(artist.id)} title="Remover">✖</button>
                    </div>
                  ))}
                </div>
              )}

              {!isCreatingArtist ? (
                <div className="artist-search">
                  <div className="form-group">
                    <label>Pesquisar artista existente</label>
                    <input
                      type="text"
                      value={searchArtistTerm}
                      onChange={e => setSearchArtistTerm(e.target.value)}
                      placeholder="Começa a escrever o nome..."
                    />
                  </div>
                  {searchResults.length > 0 && (
                    <ul className="search-results glass-panel-inner">
                      {searchResults.map(artist => (
                        <li key={artist.id} onClick={() => selectArtist(artist)}>
                          {artist.image_url && <img src={artist.image_url} alt={artist.name} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', marginRight: 8 }} />}
                          <strong>{artist.name}</strong>
                          <span>{artist.genre}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {searchArtistTerm.length >= 2 && searchResults.length === 0 && (
                    <p className="helper-text" style={{ marginTop: '0.5rem' }}>Nenhum artista encontrado. <button type="button" onClick={() => { setIsCreatingArtist(true); setNewArtist({ ...newArtist, name: searchArtistTerm }); }} className="link-button">Criar "{searchArtistTerm}"</button></p>
                  )}
                  {searchArtistTerm.length === 0 && (
                    <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>
                      Não encontras? <button type="button" onClick={() => setIsCreatingArtist(true)} className="link-button">Criar novo artista</button>
                    </p>
                  )}
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
                      <input type="text" value={newArtist.genre} onChange={e => setNewArtist({ ...newArtist, genre: e.target.value })} placeholder="HardTechno, Schranz, Industrial..." required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Foto do Artista <span className="label-hint">(upload de ficheiro ou URL)</span></label>
                    <div className="artist-photo-input">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleArtistImageChange}
                        className="file-input"
                        style={{ marginBottom: '0.5rem' }}
                      />
                      {!artistImageFile && (
                        <input
                          type="url"
                          value={newArtist.image_url}
                          onChange={e => setNewArtist({ ...newArtist, image_url: e.target.value })}
                          placeholder="Ou cola uma URL de imagem..."
                        />
                      )}
                      {artistImagePreview && (
                        <div className="image-preview-wrap" style={{ marginTop: '0.5rem' }}>
                          <img src={artistImagePreview} alt="Preview" className="artist-preview-img" />
                          <button type="button" className="btn-remove-img" onClick={() => { setArtistImageFile(null); setArtistImagePreview(null); }}>✖ Remover</button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Bio (opcional)</label>
                    <textarea value={newArtist.bio} onChange={e => setNewArtist({ ...newArtist, bio: e.target.value })} rows={2} placeholder="Breve descrição do artista..."></textarea>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                    <button type="submit" className="btn-primary btn-sm" disabled={artistUploading}>
                      {artistUploading ? 'A guardar...' : 'Guardar e Selecionar'}
                    </button>
                    <button type="button" onClick={() => { setIsCreatingArtist(false); setArtistImageFile(null); setArtistImagePreview(null); }} className="btn-secondary btn-sm">Cancelar</button>
                  </div>
                </form>
              )}
            </fieldset>

            <div className="form-actions" style={{ justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setStep(1)} className="btn-secondary">← Anterior</button>
              <button type="button" onClick={handleFinalSubmit} className="btn-primary" disabled={loading}>
                {loading ? 'A processar...' : '✓ Finalizar e Publicar Evento'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

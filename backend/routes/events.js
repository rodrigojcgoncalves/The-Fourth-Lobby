/**
 * Rotas de Eventos (/api/events)
 * 
 * IMPORTANTE: Rotas estáticas (ex: /upload, /my/events, /slug/:slug) DEVEM estar
 * definidas ANTES de rotas dinâmicas (ex: /:id) para evitar conflitos.
 */
const express = require('express');
const multer = require('multer');
const { verifyToken, requireRole } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');

const router = express.Router();

// Configurar multer para manter o ficheiro em memória (limite 10MB)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Helper: gera slug a partir de um nome de evento
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')                  // separa acentos
    .replace(/[\u0300-\u036f]/g, '')   // remove acentos
    .replace(/[^a-z0-9\s-]/g, '')     // remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-')             // espaços → hífens
    .replace(/-+/g, '-');             // múltiplos hífens → 1 hífen
}

// Helper: gera slug único (com sufixo aleatório se necessário)
async function generateUniqueSlug(name, excludeId = null) {
  const base = slugify(name);
  let candidate = base;
  let suffix = 1;

  while (true) {
    let query = supabase.from('events').select('id').eq('slug', candidate);
    if (excludeId) query = query.neq('id', excludeId);
    const { data } = await query;

    if (!data || data.length === 0) return candidate;
    candidate = `${base}-${suffix++}`;
  }
}

// ─────────────────────────────────────────────────────
// ROTAS ESTÁTICAS (têm de vir ANTES das rotas com :id)
// ─────────────────────────────────────────────────────

// GET /api/events - Listar eventos publicados (qualquer pessoa)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('date', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao carregar eventos.', error: err.message });
  }
});

// GET /api/events/my/events - Organizador vê os SEUS eventos (inclui rascunhos)
router.get('/my/events', verifyToken, requireRole('organizer'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', req.user.id)
      .order('date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao carregar os teus eventos.', error: err.message });
  }
});

// GET /api/events/slug/:slug - Ver evento por slug amigável
router.get('/slug/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*, ticket_types(*)')
      .eq('slug', req.params.slug)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Evento não encontrado.' });
    }

    // Se não estiver publicado, verificar se é o próprio organizador
    if (data.status !== 'published') {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(404).json({ message: 'Evento não encontrado.' });

      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        if (decoded.id !== data.organizer_id) {
          return res.status(404).json({ message: 'Evento não encontrado.' });
        }
      } catch {
        return res.status(404).json({ message: 'Evento não encontrado.' });
      }
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao carregar evento.', error: err.message });
  }
});

// POST /api/events/upload - Upload de cartaz para Supabase Storage (apenas organizer)
router.post('/upload', verifyToken, requireRole('organizer'), upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum ficheiro recebido.' });
  }

  try {
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `events/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('EVENT-IMAGES')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('EVENT-IMAGES')
      .getPublicUrl(fileName);

    res.status(200).json({ 
      message: 'Upload concluído com sucesso.', 
      imageUrl: publicUrlData.publicUrl 
    });
  } catch (err) {
    console.error('Event upload error:', err);
    res.status(500).json({ message: 'Erro ao fazer upload da imagem.', error: err.message });
  }
});

// POST /api/events - Criar evento com slug, fases e artistas (apenas organizer)
router.post('/', verifyToken, requireRole('organizer'), async (req, res) => {
  const { name, description, date, location, capacity, image_url, status, phases, artists } = req.body;

  try {
    // 1. Gerar slug único
    const slug = await generateUniqueSlug(name);

    // 2. Inserir o Evento
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert([{
        organizer_id: req.user.id,
        name,
        slug,
        description,
        date,
        location,
        capacity,
        image_url,
        status: status || 'draft'
      }])
      .select()
      .single();

    if (eventError) throw eventError;

    const eventId = event.id;

    // 3. Inserir as Fases (Ticket Types)
    if (phases && phases.length > 0) {
      const ticketTypesToInsert = phases.map(p => ({
        event_id: eventId,
        name: p.name,
        price: p.price,
        total_quantity: p.quantity,
        sold_quantity: 0
      }));

      const { error: phasesError } = await supabase
        .from('ticket_types')
        .insert(ticketTypesToInsert);

      if (phasesError) {
        await supabase.from('events').delete().eq('id', eventId);
        throw new Error(`Erro ao inserir fases: ${phasesError.message}`);
      }
    }

    // 4. Associar Artistas via event_artists
    if (artists && artists.length > 0) {
      const { error: artistsError } = await supabase
        .from('event_artists')
        .insert(artists.map(artistId => ({ event_id: eventId, artist_id: artistId })));

      if (artistsError) {
        console.error('Aviso: Erro ao associar artistas:', artistsError.message);
      }
    }

    res.status(201).json({ message: 'Evento criado com sucesso!', event });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar evento.', error: err.message });
  }
});

// ─────────────────────────────────────────────────────
// ROTAS DINÂMICAS COM :id (têm de vir DEPOIS das estáticas)
// ─────────────────────────────────────────────────────

// GET /api/events/:id - Ver detalhes de um evento por UUID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*, ticket_types(*)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Evento não encontrado.' });
    }

    if (data.status !== 'published') {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(404).json({ message: 'Evento não encontrado.' });

      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        if (decoded.id !== data.organizer_id) {
          return res.status(404).json({ message: 'Evento não encontrado.' });
        }
      } catch {
        return res.status(404).json({ message: 'Evento não encontrado.' });
      }
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao carregar evento.', error: err.message });
  }
});

// PUT /api/events/:id - Editar evento (slug, fases e artistas são substituídos)
router.put('/:id', verifyToken, requireRole('organizer'), async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Verifica propriedade
    const { data: existing } = await supabase
      .from('events')
      .select('organizer_id, name')
      .eq('id', id)
      .single();

    if (!existing || existing.organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'Não tens permissão para editar este evento.' });
    }

    const { name, description, date, location, capacity, image_url, status, phases, artists } = req.body;

    // 2. Re-gerar slug se o nome mudou
    let slug;
    if (name && name !== existing.name) {
      slug = await generateUniqueSlug(name, id);
    }

    // 3. Atualizar o evento
    const updatePayload = { name, description, date, location, capacity, image_url, status };
    if (slug) updatePayload.slug = slug;

    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 4. Substituir fases (apagar antigas, inserir novas)
    if (phases !== undefined) {
      await supabase.from('ticket_types').delete().eq('event_id', id);
      if (phases.length > 0) {
        const { error: phasesError } = await supabase
          .from('ticket_types')
          .insert(phases.map(p => ({
            event_id: id,
            name: p.name,
            price: Number(p.price),
            total_quantity: Number(p.quantity),
            sold_quantity: 0
          })));
        if (phasesError) console.error('Erro ao reinserir fases:', phasesError.message);
      }
    }

    // 5. Substituir artistas (apagar antigas ligações, inserir novas)
    if (artists !== undefined) {
      await supabase.from('event_artists').delete().eq('event_id', id);
      if (artists.length > 0) {
        const { error: artistsError } = await supabase
          .from('event_artists')
          .insert(artists.map(artistId => ({ event_id: id, artist_id: artistId })));
        if (artistsError) console.error('Erro ao reinserir artistas:', artistsError.message);
      }
    }

    res.json({ message: 'Evento atualizado!', event: updatedEvent });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar evento.', error: err.message });
  }
});

// DELETE /api/events/:id - Apagar evento (apenas o organizador DONO)
router.delete('/:id', verifyToken, requireRole('organizer'), async (req, res) => {
  try {
    const { data: event } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', req.params.id)
      .single();

    if (!event || event.organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'Não tens permissão para apagar este evento.' });
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Evento apagado com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao apagar evento.', error: err.message });
  }
});

module.exports = router;

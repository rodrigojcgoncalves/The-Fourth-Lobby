/**
 * Rotas do Organizador (/api/organizer)
 * Todas as rotas exigem autenticação e role "organizer".
 *
 * GET /api/organizer/events/:id/guests
 *   → Lista todos os bilhetes vendidos para um evento (apenas o dono do evento)
 */
const express = require('express');
const multer = require('multer');
const { verifyToken, requireRole } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');

const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Função auxiliar para garantir que um organizador tem Label
async function getOrCreateLabel(user) {
  let { data: label, error: labelError } = await supabase
    .from('labels')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (labelError && labelError.code === '42P01') {
    return null; // Tabela não existe, devolve null para fallback
  }

  if (!label) {
    const newLabelName = `Label de ${user.email.split('@')[0]}`;
    const newLabelSlug = `label-${user.id.substring(0, 8)}`;
    const { data: newLabel, error: createError } = await supabase
      .from('labels')
      .insert([{ owner_id: user.id, name: newLabelName, slug: newLabelSlug }])
      .select('id')
      .single();
      
    if (createError) throw createError;
    label = newLabel;
  }
  return label;
}

// GET /api/organizer/events/:id/guests - Lista de compradores do evento
router.get('/events/:id/guests', verifyToken, requireRole('organizer'), async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Verificar que o organizador autenticado é o dono deste evento
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', id)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ message: 'Evento não encontrado.' });
    }

    if (event.organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'Não tens permissão para ver os dados deste evento.' });
    }

    // 2. Buscar todos os bilhetes deste evento, com dados do utilizador e da fase
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select(`
        id,
        qr_code,
        status,
        price_paid,
        purchased_at,
        users(email),
        ticket_types(name)
      `)
      .eq('event_id', id)
      .order('purchased_at', { ascending: false });

    if (ticketsError) throw ticketsError;

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao carregar a lista de convidados.', error: err.message });
  }
});

// POST /api/organizer/events/:id/scan - Valida um bilhete por QR Code
router.post('/events/:id/scan', verifyToken, requireRole('organizer'), async (req, res) => {
  const { id } = req.params;
  const { qr_code } = req.body;

  if (!qr_code) {
    return res.status(400).json({ message: 'QR Code não fornecido.' });
  }

  try {
    // 1. Verificar se organizador é dono do evento
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', id)
      .single();

    if (eventError || !event || event.organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'Sem permissão para este evento.' });
    }

    // 2. Procurar bilhete
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        id, status, 
        users(email, full_name),
        ticket_types(name)
      `)
      .eq('event_id', id)
      .eq('qr_code', qr_code)
      .single();

    if (ticketError || !ticket) {
      return res.status(404).json({ message: 'Bilhete não encontrado para este evento.' });
    }

    // 3. Verificar estado
    if (ticket.status === 'used') {
      return res.status(400).json({ 
        message: 'Bilhete já utilizado!', 
        ticket: { ...ticket, qr_code }
      });
    }
    if (ticket.status !== 'valid') {
      return res.status(400).json({ 
        message: `Bilhete inválido (estado: ${ticket.status}).`,
        ticket: { ...ticket, qr_code }
      });
    }

    // 4. Marcar como usado
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ status: 'used' })
      .eq('id', ticket.id);

    if (updateError) throw updateError;

    ticket.status = 'used';

    res.json({
      message: 'Bilhete validado com sucesso!',
      ticket: { ...ticket, qr_code }
    });

  } catch (err) {
    res.status(500).json({ message: 'Erro ao validar bilhete.', error: err.message });
  }
});

// --- GESTÃO DA EQUIPA (RPs) ---

// GET /api/organizer/team - Lista de Promotores da Label
router.get('/team', verifyToken, requireRole('organizer'), async (req, res) => {
  try {
    // 1. Obter ou criar a label do organizer
    const label = await getOrCreateLabel(req.user);

    if (!label) {
      // Fallback para caso a tabela não exista ainda (evitar crash)
      return res.json([]); 
    }

    // 2. Obter os promotores associados
    const { data: team, error: teamError } = await supabase
      .from('label_promoters')
      .select(`
        id, status, user_id,
        users ( id, email, full_name )
      `)
      .eq('label_id', label.id);

    if (teamError) {
      if (teamError.code === '42P01') return res.json([]);
      throw teamError;
    }

    // 3. Obter os IDs e referral codes da tabela promoters
    const userIds = team.map(t => t.user_id);
    const { data: promotersData } = await supabase
      .from('promoters')
      .select('id, user_id, referral_code')
      .in('user_id', userIds);

    const promoterIds = promotersData ? promotersData.map(p => p.id) : [];
    
    // 4. Obter as conversões reais (bilhetes vendidos por eles)
    let conversionsData = [];
    if (promoterIds.length > 0) {
      const { data: cData } = await supabase
        .from('affiliate_conversions')
        .select('promoter_id')
        .in('promoter_id', promoterIds);
      conversionsData = cData || [];
    }

    const formattedTeam = team.map(t => {
      const pData = (promotersData || []).find(p => p.user_id === t.user_id);
      const ticketsSold = pData 
        ? conversionsData.filter(c => c.promoter_id === pData.id).length 
        : 0;

      return {
        id: t.id,
        user_id: t.user_id,
        status: t.status,
        email: t.users?.email,
        full_name: t.users?.full_name,
        referral_code: pData ? pData.referral_code : 'N/A',
        tickets_sold: ticketsSold
      };
    });

    res.json(formattedTeam);
  } catch (err) {
    console.error('[TEAM GET]', err);
    res.status(500).json({ message: 'Erro ao carregar equipa.', error: err.message });
  }
});

// POST /api/organizer/team/invite - Convidar/Adicionar RP por Email
router.post('/team/invite', verifyToken, requireRole('organizer'), async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email obrigatório.' });

  try {
    // 1. Verificar se user existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'Este email ainda não está registado na plataforma.' });
    }

    // 2. Obter ou criar a label do organizer
    const label = await getOrCreateLabel(req.user);

    if (!label) return res.status(500).json({ message: 'Erro: A tabela labels não existe na base de dados.' });

    // 3. Verificar se já está na equipa
    const { data: existing } = await supabase
      .from('label_promoters')
      .select('id')
      .eq('label_id', label.id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return res.status(400).json({ message: 'Este utilizador já pertence à tua equipa.' });
    }

    // 4. Só promover a 'promoter' se for um simples 'customer'. Nunca fazer downgrade de roles superiores.
    if (user.role === 'customer') {
      await supabase.from('users').update({ role: 'promoter' }).eq('id', user.id);
    }
    // Se já for 'promoter' ou 'organizer', não alterar — apenas garantir que está na tabela promoters
    
    // Garantir que existe na tabela promoters
    const { data: pExist } = await supabase.from('promoters').select('id').eq('user_id', user.id).single();
    if (!pExist) {
      const referral = email.split('@')[0].toUpperCase() + Math.floor(10+Math.random()*90);
      await supabase.from('promoters').insert([{ user_id: user.id, referral_code: referral }]);
    }

    // 5. Inserir em label_promoters
    const { error: insertError } = await supabase
      .from('label_promoters')
      .insert([{ label_id: label.id, user_id: user.id, status: 'active' }]);

    if (insertError) throw insertError;

    res.json({ message: 'Promotor adicionado com sucesso!' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao adicionar promotor.', error: err.message });
  }
});

// PUT /api/organizer/team/:userId/status - Mudar Estado (Soft Delete)
router.put('/team/:userId/status', verifyToken, requireRole('organizer'), async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  // Validar que o status é um valor permitido
  const ALLOWED_STATUSES = ['active', 'inactive'];
  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ message: `Status inválido. Valores permitidos: ${ALLOWED_STATUSES.join(', ')}.` });
  }

  try {
    const label = await getOrCreateLabel(req.user);

    if (!label) return res.status(500).json({ message: 'Tabela labels não existe.' });

    const { error: updateError } = await supabase
      .from('label_promoters')
      .update({ status })
      .eq('label_id', label.id)
      .eq('user_id', userId);

    if (updateError) throw updateError;

    res.json({ message: 'Estado atualizado com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar estado.', error: err.message });
  }
});

// --- GESTÃO DA LABEL (PERFIL) ---

// GET /api/organizer/label-profile - Ver Perfil e Métricas da Label
router.get('/label-profile', verifyToken, requireRole('organizer'), async (req, res) => {
  try {
    const label = await getOrCreateLabel(req.user);
    if (!label) return res.status(500).json({ message: 'Tabela labels não existe.' });

    // Buscar dados completos da label
    const { data: labelData, error } = await supabase
      .from('labels')
      .select('name, slug, bio, logo_url, banner_url, support_email, payment_info, social_links')
      .eq('id', label.id)
      .single();

    if (error) throw error;

    // Calcular Métricas Agregadas (Global Revenue e Total Tickets)
    // 1. Obter todos os eventos deste organizador
    const { data: events } = await supabase.from('events').select('id').eq('organizer_id', req.user.id);
    const eventIds = events ? events.map(e => e.id) : [];

    let totalTicketsSold = 0;
    let globalRevenue = 0;

    if (eventIds.length > 0) {
      // 2. Buscar todas as orders (pagas) ou tickets destes eventos
      // Incluir 'valid' E 'used' — ambos representam vendas reais e confirmadas
      const { data: tickets } = await supabase
        .from('tickets')
        .select('price_paid')
        .in('event_id', eventIds)
        .in('status', ['valid', 'used']);

      if (tickets && tickets.length > 0) {
        totalTicketsSold = tickets.length;
        globalRevenue = tickets.reduce((sum, t) => sum + parseFloat(t.price_paid || 0), 0);
      }
    }

    res.json({
      ...labelData,
      metrics: {
        totalTicketsSold,
        globalRevenue
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao carregar perfil da label.', error: err.message });
  }
});

// PUT /api/organizer/label-profile - Atualizar Perfil da Label
router.put('/label-profile', verifyToken, requireRole('organizer'), async (req, res) => {
  const { name, bio, support_email, payment_info, social_links } = req.body;

  try {
    const label = await getOrCreateLabel(req.user);
    if (!label) return res.status(500).json({ message: 'Tabela labels não existe.' });

    const updatePayload = {
      name,
      bio,
      support_email,
      payment_info,
      social_links: social_links || {}
    };

    const { error } = await supabase
      .from('labels')
      .update(updatePayload)
      .eq('id', label.id);

    if (error) throw error;

    res.json({ message: 'Perfil da label atualizado com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar perfil.', error: err.message });
  }
});

// POST /api/organizer/label-profile/upload - Upload de logo ou banner
router.post('/label-profile/upload', verifyToken, requireRole('organizer'), upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Ficheiro não enviado.' });
  
  // fieldName ajuda-nos a saber se é 'logo' ou 'banner' para atualizar a BD automaticamente
  const { type } = req.body; // 'logo' ou 'banner'

  try {
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `labels/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('event-images') // usamos o mesmo bucket para simplificar (podemos ajustar depois se necessário)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('event-images')
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    // Se passarem o tipo, guardamos logo na BD
    if (type === 'logo' || type === 'banner') {
      const label = await getOrCreateLabel(req.user);
      if (label) {
        const updateField = type === 'logo' ? { logo_url: imageUrl } : { banner_url: imageUrl };
        await supabase.from('labels').update(updateField).eq('id', label.id);
      }
    }

    res.json({ message: 'Upload feito com sucesso.', imageUrl });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao fazer upload da imagem.', error: err.message });
  }
});

module.exports = router;


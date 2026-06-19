/**
 * Rotas do Organizador (/api/organizer)
 * Todas as rotas exigem autenticação e role "organizer".
 *
 * GET /api/organizer/events/:id/guests
 *   → Lista todos os bilhetes vendidos para um evento (apenas o dono do evento)
 */
const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');

const router = express.Router();

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

    // 3. Obter os referral codes da tabela promoters
    const userIds = team.map(t => t.user_id);
    const { data: promotersData } = await supabase
      .from('promoters')
      .select('user_id, referral_code')
      .in('user_id', userIds);

    const formattedTeam = team.map(t => {
      const pData = (promotersData || []).find(p => p.user_id === t.user_id);
      return {
        id: t.id,
        user_id: t.user_id,
        status: t.status,
        email: t.users?.email,
        full_name: t.users?.full_name,
        referral_code: pData ? pData.referral_code : 'N/A',
        tickets_sold: 0 // Simplificação Ponytail
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

    // 4. Promover a 'promoter' se não for, e gerar referral code (simulação)
    if (user.role !== 'promoter') {
      await supabase.from('users').update({ role: 'promoter' }).eq('id', user.id);
    }
    
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
  const { status } = req.body; // 'active' ou 'inactive'

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

module.exports = router;


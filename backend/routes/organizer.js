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

module.exports = router;

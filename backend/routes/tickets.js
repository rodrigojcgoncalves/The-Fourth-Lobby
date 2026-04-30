/**
 * Rotas de Bilhetes (/api/tickets)
 * 
 * Substitui o RLS do Supabase por controlo manual:
 * - GET /my           → Utilizador vê os SEUS bilhetes (qualquer role logado)
 * - GET /event/:id    → Organizador vê bilhetes vendidos de UM evento seu
 */
const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');

const router = express.Router();

// ─────────────────────────────────────────────────────
// ROTAS PROTEGIDAS - QUALQUER UTILIZADOR LOGADO
// ─────────────────────────────────────────────────────

// GET /api/tickets/my - O utilizador vê apenas os SEUS bilhetes
router.get('/my', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, events(name, date, location)')
      .eq('user_id', req.user.id);  // Filtro: só os bilhetes DESTE user

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao carregar bilhetes.', error: err.message });
  }
});

// ─────────────────────────────────────────────────────
// ROTAS PROTEGIDAS - ORGANIZADORES
// ─────────────────────────────────────────────────────

// GET /api/tickets/event/:eventId - Organizador vê bilhetes de UM evento SEU
router.get('/event/:eventId', verifyToken, requireRole('organizer'), async (req, res) => {
  try {
    // 1. Verificar se o evento pertence ao organizador autenticado
    const { data: event } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', req.params.eventId)
      .single();

    if (!event || event.organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'Não tens permissão para ver os bilhetes deste evento.' });
    }

    // 2. Buscar bilhetes desse evento
    const { data, error } = await supabase
      .from('tickets')
      .select('*, users(email), ticket_types(name, price)')
      .eq('event_id', req.params.eventId);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao carregar bilhetes do evento.', error: err.message });
  }
});

module.exports = router;

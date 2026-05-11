/**
 * Rotas de Despesas (/api/expenses)
 * 
 * Substitui o RLS do Supabase por controlo manual:
 * - GET /event/:id    → Organizador vê despesas de UM evento seu
 * - POST /event/:id   → Organizador adiciona despesa a UM evento seu
 * - DELETE /:id       → Organizador apaga uma despesa de um evento seu
 * 
 * Todas as rotas são exclusivas para organizadores.
 */
const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');

const router = express.Router();

/**
 * Helper: Verifica se um evento pertence ao organizador autenticado.
 * Reutilizado em todas as rotas para evitar repetição de código.
 */
async function verifyEventOwnership(eventId, userId) {
  const { data: event } = await supabase
    .from('events')
    .select('organizer_id')
    .eq('id', eventId)
    .single();

  return event && event.organizer_id === userId;
}

// ─────────────────────────────────────────────────────
// TODAS AS ROTAS SÃO EXCLUSIVAS PARA ORGANIZADORES
// ─────────────────────────────────────────────────────

// GET /api/expenses/event/:eventId - Ver despesas de um evento
router.get('/event/:eventId', verifyToken, requireRole('organizer'), async (req, res) => {
  try {
    const isOwner = await verifyEventOwnership(req.params.eventId, req.user.id);
    if (!isOwner) {
      return res.status(403).json({ message: 'Não tens permissão para ver as despesas deste evento.' });
    }

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('event_id', req.params.eventId)
      .order('date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao carregar despesas.', error: err.message });
  }
});

// POST /api/expenses/event/:eventId - Adicionar despesa a um evento
router.post('/event/:eventId', verifyToken, requireRole('organizer'), async (req, res) => {
  try {
    const isOwner = await verifyEventOwnership(req.params.eventId, req.user.id);
    if (!isOwner) {
      return res.status(403).json({ message: 'Não tens permissão para adicionar despesas a este evento.' });
    }

    const { description, category, amount, date, is_paid = false, paid_by = null } = req.body;

    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        event_id: req.params.eventId,
        description,
        category,
        amount,
        date,
        is_paid,
        paid_by
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Despesa adicionada!', expense: data });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao adicionar despesa.', error: err.message });
  }
});

// PATCH /api/expenses/:id/toggle-paid - Alternar estado pago/pendente
router.patch('/:id/toggle-paid', verifyToken, requireRole('organizer'), async (req, res) => {
  try {
    const { data: expense } = await supabase
      .from('expenses')
      .select('event_id, is_paid')
      .eq('id', req.params.id)
      .single();

    if (!expense) return res.status(404).json({ message: 'Despesa não encontrada.' });

    const isOwner = await verifyEventOwnership(expense.event_id, req.user.id);
    if (!isOwner) return res.status(403).json({ message: 'Sem permissão.' });

    const { paid_by } = req.body;
    const newIsPaid = !expense.is_paid;

    const { data, error } = await supabase
      .from('expenses')
      .update({ is_paid: newIsPaid, paid_by: newIsPaid ? (paid_by || null) : null })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: newIsPaid ? 'Marcada como paga.' : 'Marcada como pendente.', expense: data });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar estado.', error: err.message });
  }
});

// DELETE /api/expenses/:id - Apagar uma despesa
router.delete('/:id', verifyToken, requireRole('organizer'), async (req, res) => {
  try {
    // Buscar a despesa para saber o event_id
    const { data: expense } = await supabase
      .from('expenses')
      .select('event_id')
      .eq('id', req.params.id)
      .single();

    if (!expense) {
      return res.status(404).json({ message: 'Despesa não encontrada.' });
    }

    const isOwner = await verifyEventOwnership(expense.event_id, req.user.id);
    if (!isOwner) {
      return res.status(403).json({ message: 'Não tens permissão para apagar esta despesa.' });
    }

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Despesa apagada com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao apagar despesa.', error: err.message });
  }
});

module.exports = router;

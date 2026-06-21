/**
 * Rotas de Encomendas (/api/orders)
 *
 * POST /api/orders → Cria uma order completa (order + order_items + tickets)
 *   de forma "transacional" (rollback manual se algo falhar).
 *
 * Fluxo:
 *   1. Verificar se a ticket_type existe e tem stock suficiente
 *   2. Criar a order
 *   3. Criar o order_item
 *   4. Criar o ticket individual
 *   5. Incrementar sold_quantity no ticket_type
 *   Se qualquer passo falhar → apagar tudo o que foi criado (rollback manual)
 */
const express = require('express');
const crypto = require('crypto');
const { verifyToken } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');

const router = express.Router();

// Helper: gera um QR code único
function generateQRCode() {
  return `TFL-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
}

// POST /api/orders - Criar uma encomenda completa
router.post('/', verifyToken, async (req, res) => {
  const { ticket_type_id, quantity = 1, referral_code } = req.body;

  if (!ticket_type_id) {
    return res.status(400).json({ message: 'ticket_type_id é obrigatório.' });
  }
  if (quantity < 1 || quantity > 10) {
    return res.status(400).json({ message: 'Quantidade inválida (1-10 por encomenda).' });
  }

  // IDs das entidades criadas (para rollback)
  let orderId = null;
  let ticketIds = [];

  try {
    // ── PASSO 1: Verificar e Reservar Stock (Atómico) ──────────────────────
    const { data: reserved, error: rpcError } = await supabase
      .rpc('reserve_tickets', {
        p_ticket_type_id: ticket_type_id,
        p_quantity: quantity
      });

    if (rpcError) {
      return res.status(500).json({ message: 'Erro ao comunicar com a base de dados.', error: rpcError.message });
    }

    if (!reserved) {
      return res.status(409).json({ message: 'Stock insuficiente para a quantidade solicitada.' });
    }

    // Agora que o stock está reservado, vamos buscar o ticketType para obter o preço e o event_id
    const { data: ticketType, error: ttError } = await supabase
      .from('ticket_types')
      .select('event_id, price')
      .eq('id', ticket_type_id)
      .single();

    if (ttError || !ticketType) {
      // Se falhar aqui, libertamos o stock
      await supabase.rpc('release_tickets', { p_ticket_type_id: ticket_type_id, p_quantity: quantity });
      return res.status(404).json({ message: 'Detalhes da fase de bilhete não encontrados.' });
    }

    let discountPercent = 0;
    let promoterId = null;
    let commissionRate = 0;

    // Verificar o Promocode
    if (referral_code) {
      const { data: promoter } = await supabase
        .from('promoters')
        .select('id, commission_rate')
        .eq('referral_code', referral_code)
        .single();
        
      if (promoter) {
        discountPercent = 10; // Ponytail Mode: 10% fixo para o cliente
        promoterId = promoter.id;
        commissionRate = parseFloat(promoter.commission_rate || 0);
      }
    }

    const basePrice = parseFloat(ticketType.price);
    const pricePaid = parseFloat((basePrice * (1 - discountPercent / 100)).toFixed(2));
    const totalAmount = parseFloat((pricePaid * quantity).toFixed(2));

    // ── PASSO 2: Criar a Order ──────────────────────────────────────────────
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: req.user.id,
        total_amount: totalAmount,
        status: 'completed'  // Sem Stripe por agora: marcar como completado direto
      }])
      .select()
      .single();

    if (orderError) throw new Error(`Erro ao criar order: ${orderError.message}`);
    orderId = order.id;

    // ── PASSO 3: Criar o Order Item ─────────────────────────────────────────
    const { error: itemError } = await supabase
      .from('order_items')
      .insert([{
        order_id: orderId,
        ticket_type_id: ticket_type_id,
        quantity: quantity
      }]);

    if (itemError) throw new Error(`Erro ao criar order_item: ${itemError.message}`);

    // ── PASSO 4: Criar os Tickets individuais ───────────────────────────────
    const ticketsToInsert = Array.from({ length: quantity }, () => ({
      user_id: req.user.id,
      event_id: ticketType.event_id,
      ticket_type_id: ticket_type_id,
      order_id: orderId,
      price_paid: pricePaid,
      status: 'valid',
      qr_code: generateQRCode()
    }));

    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .insert(ticketsToInsert)
      .select();

    if (ticketsError) throw new Error(`Erro ao criar tickets: ${ticketsError.message}`);
    ticketIds = tickets.map(t => t.id);

    // ── PASSO 5: Criar Conversões de Afiliados (Comissões RPs) ──────────────
    if (promoterId) {
      // Comissão ganha por cada bilhete
      const commissionAmount = parseFloat((pricePaid * (commissionRate / 100)).toFixed(2));
      
      const conversionsToInsert = ticketIds.map(tId => ({
        promoter_id: promoterId,
        ticket_id: tId,
        commission_amount: commissionAmount,
        status: 'pending'
      }));

      const { error: convError } = await supabase
        .from('affiliate_conversions')
        .insert(conversionsToInsert);

      if (convError) throw new Error(`Erro ao registar comissão: ${convError.message}`);
    }

    // ── SUCESSO ─────────────────────────────────────────────────────────────
    res.status(201).json({
      message: 'Compra concluída com sucesso!',
      order: {
        id: orderId,
        total_amount: totalAmount,
        tickets: tickets
      }
    });

  } catch (err) {
    console.error('[ORDERS] Erro original - a iniciar rollback:', err.message);

    // ── ROLLBACK MANUAL — cada passo tem tratamento de erro independente ──
    try {
      // 1. Libertar o stock que foi reservado no RPC (crítico — deve ser primeiro)
      const { error: releaseError } = await supabase.rpc('release_tickets', { 
        p_ticket_type_id: ticket_type_id, 
        p_quantity: quantity 
      });
      if (releaseError) {
        console.error('[ORDERS ROLLBACK CRÍTICO] Falha ao libertar stock! Intervenção manual necessária.', {
          ticket_type_id,
          quantity,
          error: releaseError.message
        });
      }
    } catch (releaseErr) {
      console.error('[ORDERS ROLLBACK CRÍTICO] Exceção ao libertar stock:', releaseErr.message);
    }

    // 2. Apagar por ordem inversa para respeitar foreign keys
    try {
      if (ticketIds.length > 0) {
        await supabase.from('tickets').delete().in('id', ticketIds);
      }
    } catch (deleteTicketsErr) {
      console.error('[ORDERS ROLLBACK] Falha ao apagar tickets:', deleteTicketsErr.message);
    }

    try {
      if (orderId) {
        await supabase.from('order_items').delete().eq('order_id', orderId);
        await supabase.from('orders').delete().eq('id', orderId);
      }
    } catch (deleteOrderErr) {
      console.error('[ORDERS ROLLBACK] Falha ao apagar order:', deleteOrderErr.message);
    }

    res.status(500).json({ message: 'Erro ao processar compra. Tenta novamente.', error: err.message });
  }
});

// GET /api/orders/my - Histórico de compras do utilizador
router.get('/my', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, ticket_types(name, price))')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao carregar histórico.', error: err.message });
  }
});

module.exports = router;

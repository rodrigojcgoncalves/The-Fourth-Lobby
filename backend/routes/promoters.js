const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');

const router = express.Router();

// GET /api/promoters/dashboard
// Retorna a dashboard única do promotor (Single-Tenant)
router.get('/dashboard', verifyToken, requireRole('promoter'), async (req, res) => {
  try {
    // 1. Obter o referral code do promotor e o ID
    const { data: promoterData } = await supabase
      .from('promoters')
      .select('id, referral_code')
      .eq('user_id', req.user.id)
      .single();

    // 2. Verificar a que label pertence (Fourth Dimension)
    const { data: assoc, error: assocError } = await supabase
      .from('label_promoters')
      .select('label_id, status')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .single();

    if (assocError && assocError.code === '42P01') {
      return res.json({ hasLabel: false }); // Tabela não existe
    }

    if (!assoc) {
      return res.json({ hasLabel: false }); // Não tem label associada ainda
    }

    // 3. Descobrir quem é o dono da label
    const { data: label } = await supabase
      .from('labels')
      .select('owner_id')
      .eq('id', assoc.label_id)
      .single();

    // 4. Obter os eventos futuros do organizador da label
    let events = [];
    if (label) {
      const { data: eventsData } = await supabase
        .from('events')
        .select('id, name, date, location, image_url, capacity')
        .eq('organizer_id', label.owner_id)
        .eq('status', 'published')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true });
      events = eventsData || [];
    }

    // 5. Obter estatísticas reais de conversão
    let ticketsSold = 0;
    let totalEarned = 0;

    if (promoterData) {
      const { data: conversions } = await supabase
        .from('affiliate_conversions')
        .select('commission_amount')
        .eq('promoter_id', promoterData.id);

      if (conversions && conversions.length > 0) {
        ticketsSold = conversions.length;
        totalEarned = conversions.reduce((sum, conv) => sum + parseFloat(conv.commission_amount || 0), 0);
      }
    }

    res.json({
      hasLabel: true,
      referralCode: promoterData ? promoterData.referral_code : 'N/A',
      ticketsSold,
      totalEarned,
      events
    });

  } catch (err) {
    console.error('[PROMOTER DASHBOARD]', err);
    res.status(500).json({ message: 'Erro ao carregar dashboard.', error: err.message });
  }
});

// GET /api/promoters/labels/:id/events
// Retorna eventos futuros da label
router.get('/labels/:id/events', verifyToken, requireRole('promoter'), async (req, res) => {
  const { id } = req.params;
  
  try {
    // 1. Verificar se o promotor pertence mesmo a esta label
    const { data: assoc, error: assocError } = await supabase
      .from('label_promoters')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('label_id', id)
      .eq('status', 'active')
      .single();

    if (assocError || !assoc) {
      return res.status(403).json({ message: 'Não és promotor ativo desta label.' });
    }

    // 2. Descobrir quem é o dono da label (organizer)
    const { data: label, error: labelError } = await supabase
      .from('labels')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (labelError || !label) {
      return res.status(404).json({ message: 'Label não encontrada.' });
    }

    // 3. Obter eventos publicados do organizador dessa label
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, name, date, location, image_url, capacity')
      .eq('organizer_id', label.owner_id)
      .eq('status', 'published')
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true });

    if (eventsError) throw eventsError;

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao carregar eventos.', error: err.message });
  }
});

// GET /api/promoters/verify/:code
// Verifica se um promocode é válido e retorna o desconto aplicável
router.get('/verify/:code', verifyToken, async (req, res) => {
  const { code } = req.params;

  try {
    const { data: promoter, error } = await supabase
      .from('promoters')
      .select('id, user_id, commission_rate')
      .eq('referral_code', code)
      .single();

    if (error || !promoter) {
      return res.status(404).json({ message: 'Código promocional inválido.' });
    }

    // Ponytail Mode: O desconto para o cliente é fixo de 10% se o código for válido
    const DISCOUNT_RATE = 10;

    res.json({
      valid: true,
      discount_percentage: DISCOUNT_RATE,
      message: `Código aplicado! Desconto de ${DISCOUNT_RATE}% ativo.`
    });

  } catch (err) {
    res.status(500).json({ message: 'Erro ao verificar código.', error: err.message });
  }
});

module.exports = router;

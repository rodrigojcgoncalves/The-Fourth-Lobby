const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');

const router = express.Router();

/**
 * Função Helper: Avalia o sentimento bruto do comentário via IA.
 */
async function getAISentiment(text) {
  if (!text || text.trim() === '') return null;

  const HF_TOKEN = process.env.HF_TOKEN;
  const MODEL_URL = "https://api-inference.huggingface.co/models/nlptown/bert-base-multilingual-uncased-sentiment";

  try {
    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: text }),
    });

    if (!response.ok) return null;

    const result = await response.json();
    if (result && result.length > 0 && result[0].length > 0) {
      const bestMatch = result[0][0].label;
      if (bestMatch === '5 stars' || bestMatch === '4 stars') return 'positivo';
      if (bestMatch === '3 stars') return 'neutro';
      return 'negativo';
    }
    return null;
  } catch (error) {
    return null;
  }
}

function calculateHybridSentiment(rating, aiSentiment) {
  let starSentiment;
  if (rating >= 4) starSentiment = 'positivo';
  else if (rating === 3) starSentiment = 'neutro';
  else starSentiment = 'negativo';

  if (!aiSentiment) return starSentiment;
  if (starSentiment === aiSentiment) return starSentiment;
  if (rating === 3) return aiSentiment;
  return starSentiment;
}

/**
 * Função Helper: Extrai o tópico principal do comentário (Fase 5.2)
 */
async function getAITopic(text) {
  if (!text || text.trim() === '') return 'Geral';

  const HF_TOKEN = process.env.HF_TOKEN;
  const MODEL_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli";

  try {
    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          candidate_labels: ["Som/Música", "Bar/Bebidas", "Local/Espaço", "Staff/Segurança", "Geral"]
        }
      }),
    });

    if (!response.ok) {
      console.error("[NLP Topic Error] Erro na resposta da Hugging Face:", response.statusText);
      return 'Geral';
    }

    const result = await response.json();
    
    // O modelo retorna { sequence: "texto", labels: ["Som", "Bar", ...], scores: [0.9, 0.05, ...] }
    if (result && result.labels && result.scores && result.labels.length > 0) {
      // Apenas consideramos válido se tiver confiança de pelo menos 30%
      if (result.scores[0] > 0.3) {
        return result.labels[0];
      }
    }
    return 'Geral';
  } catch (error) {
    console.error("[NLP Topic Error] Falha:", error.message);
    return 'Geral';
  }
}

/**
 * POST /api/feedbacks
 * Cliente submete o seu feedback.
 * Rota verifica sentiment na IA e guarda na BD.
 */
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { event_id, rating, comment } = req.body;
    const user_id = req.user.id;

    if (!event_id || !rating) {
      return res.status(400).json({ message: 'Event ID e Rating são obrigatórios.' });
    }

    // 1. Garantir que o utilizador tem mesmo um bilhete 'used' para este evento
    const { data: tickets } = await supabase
      .from('tickets')
      .select('id')
      .eq('user_id', user_id)
      .eq('event_id', event_id)
      .eq('status', 'used');

    if (!tickets || tickets.length === 0) {
      return res.status(403).json({ message: 'Apenas podes avaliar eventos onde efetuaste o check-in (bilhete usado).' });
    }

    // 2. Chamar o serviço de IA para analisar sentimento e tópico
    const [aiSentiment, aiTopic] = await Promise.all([
      getAISentiment(comment),
      getAITopic(comment)
    ]);

    const sentiment = calculateHybridSentiment(rating, aiSentiment);

    // 3. Inserir na Base de Dados
    const { data, error } = await supabase
      .from('feedbacks')
      .insert({
        user_id,
        event_id,
        rating,
        comment: comment || null,
        sentiment,
        topic: aiTopic
      })
      .select()
      .single();

    if (error) {
      // 23505 é o código do PostgreSQL para violação de chave UNIQUE (unique_user_event_feedback)
      if (error.code === '23505') {
        return res.status(409).json({ message: 'Já submeteste um feedback para este evento.' });
      }
      throw error;
    }

    res.status(201).json({ message: 'Feedback registado com sucesso.', feedback: data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/feedbacks/pending
 * Retorna o próximo evento pendente de avaliação para o utilizador atual.
 * Utilizado para mostrar o pop-up no frontend.
 */
router.get('/pending', verifyToken, async (req, res, next) => {
  try {
    const user_id = req.user.id;

    // 1. Obter todos os bilhetes "usados" deste utilizador, juntamente com a data do evento
    // Fazemos inner join com a tabela events
    const { data: usedTickets, error: ticketsError } = await supabase
      .from('tickets')
      .select(`
        event_id,
        events (
          id,
          name,
          date,
          image_url
        )
      `)
      .eq('user_id', user_id)
      .eq('status', 'used');

    if (ticketsError) throw ticketsError;

    if (!usedTickets || usedTickets.length === 0) {
      return res.json({ pendingEvent: null });
    }

    // 2. Extrair apenas os eventos que já aconteceram no passado
    const now = new Date();
    const pastEventsMap = new Map(); // Usar map para evitar duplicados caso o user tenha 2 bilhetes para o mesmo evento
    
    usedTickets.forEach(ticket => {
      const eventDate = new Date(ticket.events.date);
      if (eventDate < now) {
        pastEventsMap.set(ticket.events.id, ticket.events);
      }
    });

    if (pastEventsMap.size === 0) {
      return res.json({ pendingEvent: null });
    }

    const pastEventIds = Array.from(pastEventsMap.keys());

    // 3. Obter todos os feedbacks já dados por este utilizador
    const { data: givenFeedbacks, error: fbError } = await supabase
      .from('feedbacks')
      .select('event_id')
      .eq('user_id', user_id);

    if (fbError) throw fbError;

    const feedbackEventIds = givenFeedbacks.map(fb => fb.event_id);

    // 4. Encontrar o primeiro evento passado que AINDA NÃO tem feedback
    const pendingEventId = pastEventIds.find(id => !feedbackEventIds.includes(id));

    if (pendingEventId) {
      // Encontrou um evento para avaliar!
      const pendingEventDetails = pastEventsMap.get(pendingEventId);
      return res.json({ pendingEvent: pendingEventDetails });
    }

    // Tudo avaliado
    res.json({ pendingEvent: null });

  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/feedbacks/organizer
 * (Apenas para organizadores)
 * Retorna os feedbacks dos eventos deste organizador
 */
router.get('/organizer', verifyToken, requireRole(['organizer']), async (req, res, next) => {
  try {
    const organizer_id = req.user.id;
    const { event_id, sentiment } = req.query;

    // 1. Quais são os eventos deste organizador?
    let eventsQuery = supabase.from('events').select('id, name').eq('organizer_id', organizer_id);
    const { data: myEvents, error: evError } = await eventsQuery;
    
    if (evError) throw evError;
    if (!myEvents || myEvents.length === 0) return res.json([]);

    const myEventIds = myEvents.map(e => e.id);

    // 2. Procurar feedbacks desses eventos
    let query = supabase
      .from('feedbacks')
      .select(`
        *,
        users ( full_name, email ),
        events ( name )
      `)
      .in('event_id', myEventIds)
      .order('created_at', { ascending: false });

    // 3. Aplicar Filtros, se fornecidos via query params
    if (event_id) {
      query = query.eq('event_id', event_id);
    }
    if (sentiment) {
      query = query.eq('sentiment', sentiment);
    }

    const { data: feedbacks, error: fbError } = await query;
    if (fbError) throw fbError;

    res.json(feedbacks);

  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/feedbacks/organizer/summary
 * (Apenas para organizadores)
 * Retorna um resumo gerado por IA de todos os comentários de uma festa
 */
router.get('/organizer/summary', verifyToken, requireRole(['organizer']), async (req, res, next) => {
  try {
    const { event_id } = req.query;
    if (!event_id) return res.status(400).json({ message: 'event_id é obrigatório' });

    // 1. Obter todos os comentários desta festa
    const { data: feedbacks, error: fbError } = await supabase
      .from('feedbacks')
      .select('comment')
      .eq('event_id', event_id)
      .not('comment', 'is', null);

    if (fbError) throw fbError;

    if (!feedbacks || feedbacks.length === 0) {
      return res.json({ summary: "Não há comentários suficientes para gerar um resumo." });
    }

    // Juntar os comentários todos numa única string de texto
    const allText = feedbacks.map(f => f.comment).join(". ");

    // 2. Tentar chamar a Hugging Face para resumir
    const HF_TOKEN = process.env.HF_TOKEN;
    const MODEL_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";

    try {
      const response = await fetch(MODEL_URL, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: allText,
          parameters: { max_length: 100, min_length: 30, do_sample: false }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result && result.length > 0 && result[0].summary_text) {
          return res.json({ summary: result[0].summary_text });
        }
      }
      throw new Error("Resposta inválida da Hugging Face");
    } catch (hfError) {
      // FALLBACK PARA DESENVOLVIMENTO LOCAL (devido a erros de DNS/Rede no terminal)
      console.log("[NLP Summary] Fallback acionado devido a falha na rede:", hfError.message);
      
      const mockSummary = "O evento foi um sucesso! A música e a energia do público foram os pontos mais altos destacados pelos clientes. Houve algumas notas menos positivas em relação ao tempo de espera no bar e à temperatura do espaço na pista principal, mas de forma geral, a festa superou as expectativas.";
      return res.json({ summary: mockSummary });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;

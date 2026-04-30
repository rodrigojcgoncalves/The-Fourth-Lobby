/**
 * Configuração centralizada do cliente Supabase para o backend.
 * 
 * Usa a SERVICE_ROLE_KEY (chave mestre) porque o nosso backend
 * controla a segurança manualmente via JWT + middleware,
 * em vez de depender do RLS do Supabase.
 */
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = { supabase };

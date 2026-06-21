require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const envConfig = require('dotenv').parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("A procurar as Festas Retro...");

  const { data: events, error: findError } = await supabase
    .from('events')
    .select('id, name')
    .ilike('name', 'Festa Retro (Simulação NLP)%');

  if (findError) {
    console.error("Erro ao procurar:", findError);
    return;
  }

  if (!events || events.length === 0) {
    console.log("Nenhuma Festa Retro encontrada.");
    return;
  }

  console.log(`Encontradas ${events.length} festas para apagar.`);

  for (const event of events) {
    console.log(`A apagar dependências do evento ${event.id}...`);
    
    // 1. Apagar feedbacks associados ao evento
    await supabase.from('feedbacks').delete().eq('event_id', event.id);
    
    // 2. Apagar tickets associados ao evento
    await supabase.from('tickets').delete().eq('event_id', event.id);
    
    // 3. Procurar os ticket_types para limpar os order_items (opcional/safe)
    const { data: ticketTypes } = await supabase.from('ticket_types').select('id').eq('event_id', event.id);
    if (ticketTypes && ticketTypes.length > 0) {
      const typeIds = ticketTypes.map(t => t.id);
      await supabase.from('order_items').delete().in('ticket_type_id', typeIds);
    }

    // 4. Apagar os ticket_types do evento
    await supabase.from('ticket_types').delete().eq('event_id', event.id);
    
    // 5. Finalmente, apagar o evento
    const { error: deleteError } = await supabase.from('events').delete().eq('id', event.id);
    
    if (deleteError) {
      console.error(`Erro ao apagar o evento ${event.name}:`, deleteError);
    } else {
      console.log(`✅ Evento "${event.name}" apagado com sucesso.`);
    }
  }

  console.log("Limpeza concluída!");
}

run();

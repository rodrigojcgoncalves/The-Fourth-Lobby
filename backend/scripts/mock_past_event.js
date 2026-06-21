require('dotenv').config({ path: '../.env' }); // Lê o .env da raiz se não houver no backend, ou ajustamos
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente manualmente se necessário
const envPath = path.join(__dirname, '..', '.env');
const envConfig = require('dotenv').parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltam variáveis do Supabase.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("A procurar um Organizador e um Cliente...");
  
  // 1. Procurar Organizer
  const { data: orgs, error: orgError } = await supabase.from('users').select('id').eq('role', 'organizer').limit(1);
  if (orgError || !orgs || orgs.length === 0) {
    console.error("Não encontrei nenhum utilizador com role 'organizer'.", orgError);
    return;
  }
  const organizerId = orgs[0].id;

  // 2. Procurar Customer teste@teste.com
  const { data: customers, error: custError } = await supabase.from('users').select('id').eq('email', 'teste@teste.com').limit(1);
  let customerId;
  if (custError || !customers || customers.length === 0) {
    console.error("Não encontrei o utilizador teste@teste.com na base de dados.", custError);
    return;
  }
  customerId = customers[0].id;

  console.log(`Usando Organizador: ${organizerId}`);
  console.log(`Usando Cliente: ${customerId}`);

  // 3. Criar Evento no Passado
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 5); // 5 dias atrás

  const { data: event, error: eventError } = await supabase.from('events').insert({
    organizer_id: organizerId,
    name: 'Festa Retro (Simulação NLP)',
    slug: 'festa-retro-nlp-' + Date.now(),
    date: pastDate.toISOString(),
    location: 'Lisboa, Portugal',
    capacity: 500,
    description: 'Um evento criado pelo sistema para testar as capacidades de avaliação e IA.',
    status: 'published'
  }).select().single();

  if (eventError) {
    console.error("Erro ao criar evento:", eventError);
    return;
  }
  console.log(`Evento Passado criado: ${event.name} (ID: ${event.id})`);

  // 4. Criar Tipo de Bilhete
  const { data: ticketType, error: typeError } = await supabase.from('ticket_types').insert({
    event_id: event.id,
    name: 'Geral',
    price: 15.00,
    total_quantity: 500,
    sold_quantity: 1
  }).select().single();

  if (typeError) {
    console.error("Erro ao criar ticket type:", typeError);
    return;
  }

  // 5. Criar Order
  const { data: order, error: orderError } = await supabase.from('orders').insert({
    user_id: customerId,
    total_amount: 15.00,
    status: 'completed'
  }).select().single();

  if (orderError) {
    console.error("Erro ao criar order:", orderError);
    return;
  }

  // 6. Criar Ticket com status 'used'
  const { data: ticket, error: ticketError } = await supabase.from('tickets').insert({
    user_id: customerId,
    event_id: event.id,
    ticket_type_id: ticketType.id,
    order_id: order.id,
    price_paid: 15.00,
    status: 'used',
    qr_code: 'MOCK-QR-' + Date.now()
  }).select().single();

  if (ticketError) {
    console.error("Erro ao criar bilhete:", ticketError);
    return;
  }

  console.log("--------------------------------------------------");
  console.log("SUCESSO! DADOS MOCK INSERIDOS.");
  console.log("Agora, faz login na aplicação com a conta de CLIENTE para ver o Pop-up.");
  console.log("Para saberes qual o email do cliente (caso não saibas a password, podes criar outro ou alterar na BD):");
  const { data: cInfo } = await supabase.from('users').select('email').eq('id', customerId).single();
  console.log(`Email do cliente: ${cInfo.email}`);
}

run();

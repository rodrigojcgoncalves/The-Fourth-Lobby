require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs'); // Assumindo que bcryptjs está instalado no backend

const envPath = path.join(__dirname, '..', '.env');
const envConfig = require('dotenv').parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Arrays de feedback mock
const feedbacksMock = [
  { rating: 5, comment: "Festa incrível, a música estava no ponto! Grande ambiente.", sentiment: "positivo" },
  { rating: 4, comment: "Gostei muito, mas o bar demorou um bocado a servir.", sentiment: "positivo" },
  { rating: 3, comment: "Foi okay, a primeira hora foi fraquinha mas depois melhorou.", sentiment: "neutro" },
  { rating: 5, comment: "A melhor noite da minha vida, o set do Pharah foi divinal!", sentiment: "positivo" },
  { rating: 2, comment: "O som estava demasiado alto e distorcido, fiquei com dores de cabeça.", sentiment: "negativo" }
];

// Arrays de despesas mock
const expensesMock = [
  { description: "Aluguer de Som e Luzes", category: "Produção", amount: 1500, is_paid: true },
  { description: "Staff e Seguranças", category: "Staff", amount: 800, is_paid: true },
  { description: "Bebidas Bar", category: "Bar", amount: 1200, is_paid: true },
  { description: "Marketing e Flyers", category: "Marketing", amount: 200, is_paid: true }
];

async function run() {
  console.log("A procurar as festas passadas...");
  const now = new Date().toISOString();

  const { data: pastEvents, error: eventsError } = await supabase
    .from('events')
    .select('id, name')
    .lt('date', now);

  if (eventsError || !pastEvents || pastEvents.length === 0) {
    console.log("Não encontrei festas passadas ou ocorreu um erro.", eventsError);
    return;
  }

  console.log(`Encontradas ${pastEvents.length} festas passadas. A gerar dados...`);

  // Gerar 5 clientes mock
  const customers = [];
  const passwordHash = await bcrypt.hash('password123', 10);
  for (let i = 1; i <= 5; i++) {
    const email = `mock_customer${i}@exemplo.com`;
    let { data: user } = await supabase.from('users').select('id').eq('email', email).single();
    if (!user) {
      const { data: newUser, error: createError } = await supabase.from('users').insert({
        email,
        password_hash: passwordHash,
        role: 'customer',
        full_name: `Cliente Teste ${i}`
      }).select('id').single();
      if (!createError) customers.push(newUser.id);
    } else {
      customers.push(user.id);
    }
  }

  if (customers.length === 0) {
    console.error("Não foi possível gerar/encontrar clientes mock.");
    return;
  }

  for (const event of pastEvents) {
    console.log(`\n--- Populando Evento: ${event.name} ---`);

    // 1. Garantir que tem um Ticket Type
    let { data: ticketType } = await supabase.from('ticket_types').select('id, price').eq('event_id', event.id).limit(1).single();
    if (!ticketType) {
      const { data: newType } = await supabase.from('ticket_types').insert({
        event_id: event.id,
        name: 'Geral',
        price: 20.00,
        total_quantity: 500,
        sold_quantity: 0
      }).select('id, price').single();
      ticketType = newType;
    }

    if (!ticketType) {
      console.log("Não foi possível criar Ticket Type, a saltar evento.");
      continue;
    }

    let ticketsSold = 0;
    const ticketPrice = ticketType.price;

    // 2. Criar Orders, Tickets e Feedbacks para os 5 clientes
    for (let i = 0; i < customers.length; i++) {
      const customerId = customers[i];
      const fbMock = feedbacksMock[i];

      // Order
      const { data: order } = await supabase.from('orders').insert({
        user_id: customerId,
        total_amount: ticketPrice,
        status: 'completed'
      }).select('id').single();

      if (order) {
        // Order Item
        await supabase.from('order_items').insert({
          order_id: order.id,
          ticket_type_id: ticketType.id,
          quantity: 1
        });

        // Ticket (sempre 'used' porque é passado)
        const { data: ticket } = await supabase.from('tickets').insert({
          user_id: customerId,
          event_id: event.id,
          ticket_type_id: ticketType.id,
          order_id: order.id,
          price_paid: ticketPrice,
          status: 'used',
          qr_code: `MOCK-${event.id.substring(0,4)}-${i}`
        }).select('id').single();

        if (ticket) {
          ticketsSold++;
          // Apagar feedback existente caso a gente já tenha corrido o script
          await supabase.from('feedbacks').delete().eq('user_id', customerId).eq('event_id', event.id);

          // Criar Feedback
          await supabase.from('feedbacks').insert({
            user_id: customerId,
            event_id: event.id,
            rating: fbMock.rating,
            comment: fbMock.comment,
            sentiment: fbMock.sentiment
          });
        }
      }
    }

    // Atualizar quantidade vendida no ticket type
    await supabase.from('ticket_types').update({
      sold_quantity: 150 + ticketsSold // Fingir que vendemos 150 bilhetes no total
    }).eq('id', ticketType.id);

    console.log(`> Adicionados ${ticketsSold} bilhetes (status: used) e 5 reviews.`);

    // 3. Adicionar Despesas (se não existirem)
    const { data: existingExp } = await supabase.from('expenses').select('id').eq('event_id', event.id);
    if (!existingExp || existingExp.length === 0) {
      for (const exp of expensesMock) {
        await supabase.from('expenses').insert({
          event_id: event.id,
          description: exp.description,
          category: exp.category,
          amount: exp.amount,
          date: new Date().toISOString().split('T')[0],
          is_paid: exp.is_paid
        });
      }
      console.log(`> Adicionadas 4 despesas de produção.`);
    } else {
      console.log(`> Despesas já existem para este evento.`);
    }
  }

  console.log("\nDados populados com sucesso!");
}

run();

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
  console.log("A aplicar Tópicos mock manualmente...");
  const { data: feedbacks } = await supabase.from('feedbacks').select('id, comment');

  for (const fb of feedbacks) {
    let topic = 'Geral';
    const text = fb.comment.toLowerCase();
    
    if (text.includes('bar') || text.includes('bebida') || text.includes('servir')) topic = 'Bar/Bebidas';
    else if (text.includes('som') || text.includes('música') || text.includes('set') || text.includes('dj')) topic = 'Som/Música';
    else if (text.includes('staff') || text.includes('segurança')) topic = 'Staff/Segurança';
    else if (text.includes('calor') || text.includes('espaço') || text.includes('casa de banho')) topic = 'Local/Espaço';

    await supabase.from('feedbacks').update({ topic }).eq('id', fb.id);
  }
  console.log("Tópicos atualizados com sucesso!");
}

run();

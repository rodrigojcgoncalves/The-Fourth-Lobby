require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const envConfig = require('dotenv').parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const HF_TOKEN = envConfig.HF_TOKEN || process.env.HF_TOKEN;

async function getAITopic(text) {
  if (!text || text.trim() === '') return 'Geral';
  const MODEL_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli";

  try {
    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: { "Authorization": `Bearer ${HF_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        inputs: text,
        parameters: { candidate_labels: ["Som/Música", "Bar/Bebidas", "Local/Espaço", "Staff/Segurança", "Geral"] }
      }),
    });

    if (!response.ok) return 'Geral';

    const result = await response.json();
    if (result && result.labels && result.scores && result.labels.length > 0) {
      if (result.scores[0] > 0.3) return result.labels[0];
    }
    return 'Geral';
  } catch (error) {
    return 'Geral';
  }
}

async function run() {
  console.log("A procurar feedbacks para atualizar tópicos...");
  const { data: feedbacks, error } = await supabase.from('feedbacks').select('id, comment, topic');

  if (error || !feedbacks) {
    console.error("Erro ou nenhum feedback encontrado:", error);
    return;
  }

  let updated = 0;
  for (const fb of feedbacks) {
    if (fb.topic && fb.topic !== 'Geral') continue; // Já tem tópico

    console.log(`Analisando: "${fb.comment}"`);
    const novoTopico = await getAITopic(fb.comment);
    
    const { error: updateError } = await supabase.from('feedbacks').update({ topic: novoTopico }).eq('id', fb.id);
    if (updateError) {
      console.error(`Erro ao atualizar feedback ${fb.id}:`, updateError);
    } else {
      console.log(` -> Tópico detetado: ${novoTopico}`);
      updated++;
    }
    
    // Pequena pausa para evitar limites da API gratuita
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\nConcluído! Foram atualizados ${updated} feedbacks com novos tópicos NLP.`);
}

run();

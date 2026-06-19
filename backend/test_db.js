const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkDb() {
  const { data, error } = await supabase.from('labels').select('*').limit(1);
  console.log('Labels exists?', !error);
  if (error) console.log(error);
}
checkDb();

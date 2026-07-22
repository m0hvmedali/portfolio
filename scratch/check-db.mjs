import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pawwqdaiucbvohsgmtop.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhd3dxZGFpdWNidm9oc2dtdG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMTQ5MDgsImV4cCI6MjA3ODc5MDkwOH0.EuNNd8Cj9TBxJvmPARhhR1J1KPwoS3X46msX-MhriRk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkTable(name) {
  try {
    const { data, error } = await supabase.from(name).select('*').limit(3);
    if (error) {
      console.log(`❌ Table '${name}': Error -> ${error.message}`);
    } else {
      console.log(`✅ Table '${name}': Connected! Found ${data.length} row(s).`);
      if (data.length > 0) {
        console.log(`   Sample:`, JSON.stringify(data[0]).substring(0, 120));
      }
    }
  } catch (err) {
    console.log(`❌ Table '${name}': Exception ->`, err.message);
  }
}

async function main() {
  console.log('Checking Supabase connection and tables status...');
  const tables = ['profile', 'skills', 'projects', 'experience', 'education', 'certifications', 'learnings', 'blog'];
  for (const table of tables) {
    await checkTable(table);
  }
}

main().catch(console.error);

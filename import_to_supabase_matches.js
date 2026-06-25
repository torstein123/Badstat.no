const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kfxdblvdunnrxhuxqvzi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeGRibHZkdW5ucnhodXhxdnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MTQ5NzEsImV4cCI6MjA5Nzk5MDk3MX0.TZ6LCEIbEcqKsPUQQyGjLNsAbCZvTr2WJxBl4A-W2i8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importMatches() {
  console.log('Reading formatted matches data...');
  const matchesData = JSON.parse(fs.readFileSync('matches_formatted.json', 'utf8'));
  
  console.log(`Found ${matchesData.length} matches to import`);
  
  // First, clear existing data
  console.log('Clearing existing matches...');
  const { error: deleteError } = await supabase.from('matches').delete().neq('id', 0);
  if (deleteError) {
    console.error('Error clearing matches:', deleteError);
    return;
  } else {
    console.log('Existing matches cleared');
  }
  
  // Insert matches in batches
  const batchSize = 1000;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < matchesData.length; i += batchSize) {
    const batch = matchesData.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(matchesData.length / batchSize);
    
    console.log(`Importing batch ${batchNum}/${totalBatches} (${i + 1}-${Math.min(i + batchSize, matchesData.length)})...`);
    
    const { data, error } = await supabase.from('matches').insert(batch);
    
    if (error) {
      console.error(`Error importing batch ${batchNum}:`, error.message);
      errorCount += batch.length;
    } else {
      console.log(`Successfully imported batch ${batchNum}`);
      successCount += batch.length;
    }
    
    // Small delay to avoid rate limiting
    if (i + batchSize < matchesData.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log('\nImport completed!');
  console.log(`Successfully imported: ${successCount} matches`);
  console.log(`Errors: ${errorCount} matches`);
}

async function main() {
  try {
    await importMatches();
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
}

main();





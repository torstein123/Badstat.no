const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment or you can hardcode them
const supabaseUrl = 'https://kfxdblvdunnrxhuxqvzi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeGRibHZkdW5ucnhodXhxdnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MTQ5NzEsImV4cCI6MjA5Nzk5MDk3MX0.TZ6LCEIbEcqKsPUQQyGjLNsAbCZvTr2WJxBl4A-W2i8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importPlayers() {
  console.log('Reading players data...');
  const playersData = JSON.parse(fs.readFileSync('players_data.json', 'utf8'));
  
  console.log(`Found ${playersData.length} players to import`);
  
  // Tables already truncated via MCP, so we can proceed directly to insert
  
  // Insert players in batches
  const batchSize = 1000;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < playersData.length; i += batchSize) {
    const batch = playersData.slice(i, i + batchSize);
    console.log(`Importing players batch ${Math.floor(i / batchSize) + 1} (${i + 1}-${Math.min(i + batchSize, playersData.length)})...`);
    
    const { data, error } = await supabase.from('players').insert(batch);
    
    if (error) {
      console.error(`Error importing batch ${Math.floor(i / batchSize) + 1}:`, error);
      errorCount += batch.length;
    } else {
      console.log(`Successfully imported batch ${Math.floor(i / batchSize) + 1}`);
      successCount += batch.length;
    }
  }
  
  console.log(`Players import completed: ${successCount} successful, ${errorCount} errors`);
}

async function importRankings() {
  console.log('Reading rankings data...');
  const rankingsData = JSON.parse(fs.readFileSync('public/combined_rankings_with_categories.json', 'utf8'));
  
  console.log(`Found ${rankingsData.length} rankings to import`);
  
  // Tables already truncated via MCP, so we can proceed directly to insert
  
  // Insert rankings in batches
  const batchSize = 1000;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < rankingsData.length; i += batchSize) {
    const batch = rankingsData.slice(i, i + batchSize);
    console.log(`Importing rankings batch ${Math.floor(i / batchSize) + 1} (${i + 1}-${Math.min(i + batchSize, rankingsData.length)})...`);
    
    const { data, error } = await supabase.from('rankings').insert(batch);
    
    if (error) {
      console.error(`Error importing batch ${Math.floor(i / batchSize) + 1}:`, error);
      errorCount += batch.length;
    } else {
      console.log(`Successfully imported batch ${Math.floor(i / batchSize) + 1}`);
      successCount += batch.length;
    }
  }
  
  console.log(`Rankings import completed: ${successCount} successful, ${errorCount} errors`);
}

async function main() {
  try {
    await importPlayers();
    await importRankings();
    console.log('\nAll imports completed successfully!');
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
}

main();


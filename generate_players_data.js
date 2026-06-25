const fs = require('fs');
const path = require('path');

console.log('Generating players data from rankings...');

try {
  // Read the combined rankings JSON file
  const rankingsData = JSON.parse(fs.readFileSync('public/combined_rankings.json', 'utf8'));
  
  console.log(`Found ${rankingsData.length} ranking records`);
  
  // Create a Map to store unique players
  const uniquePlayers = new Map();
  
  // Process each ranking record
  rankingsData.forEach((player, index) => {
    const spillerId = player['Spiller-Id'];
    const navn = player['Navn'];
    const allClubs = player['All Clubs'] || '';
    const currentClub = player['Current Club'] || '';
    
    // Only add if we haven't seen this Spiller-Id before
    if (!uniquePlayers.has(spillerId)) {
      uniquePlayers.set(spillerId, {
        'Spiller-Id': spillerId,
        'Navn': navn,
        'All Clubs': allClubs,
        'Current Club': currentClub
      });
    }
    
    // Log progress every 10000 records
    if ((index + 1) % 10000 === 0) {
      console.log(`Processed ${index + 1} records, found ${uniquePlayers.size} unique players`);
    }
  });
  
  // Convert Map to Array
  const playersArray = Array.from(uniquePlayers.values());
  
  console.log(`\nGenerated ${playersArray.length} unique players`);
  
  // Write to JSON file
  const outputPath = 'players_data.json';
  fs.writeFileSync(outputPath, JSON.stringify(playersArray, null, 2));
  
  console.log(`Players data saved to: ${outputPath}`);
  
  // Also create a CSV version for easier import
  const csvPath = 'players_data.csv';
  const csvHeader = 'Spiller-Id,Navn,All Clubs,Current Club\n';
  const csvRows = playersArray.map(player => 
    `"${player['Spiller-Id']}","${player['Navn']}","${player['All Clubs']}","${player['Current Club']}"`
  ).join('\n');
  
  fs.writeFileSync(csvPath, csvHeader + csvRows);
  console.log(`CSV version saved to: ${csvPath}`);
  
  // Show some sample data
  console.log('\nSample players data:');
  console.log(JSON.stringify(playersArray.slice(0, 3), null, 2));
  
  // Show statistics
  const clubsWithPlayers = new Set(playersArray.map(p => p['Current Club']).filter(c => c));
  console.log(`\nStatistics:`);
  console.log(`- Total unique players: ${playersArray.length}`);
  console.log(`- Players with current club: ${playersArray.filter(p => p['Current Club']).length}`);
  console.log(`- Unique clubs: ${clubsWithPlayers.size}`);
  
} catch (error) {
  console.error('Error generating players data:', error);
  process.exit(1);
}







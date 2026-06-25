const fs = require('fs');

console.log('Reading cleaned_file.json...');
const matchesData = JSON.parse(fs.readFileSync('src/cleaned_file.json', 'utf8'));

console.log(`Found ${matchesData.length} matches to format`);

// Format the data to match database structure
const formattedData = matchesData.map((match, index) => {
  const formatted = {
    "Season": match["Season"] === "NaN" || !match["Season"] ? null : match["Season"],
    "Tournament Name": match["Tournament Name"] === "NaN" || !match["Tournament Name"] ? null : match["Tournament Name"],
    "Date": match["Date"] === "NaN" || !match["Date"] ? null : match["Date"],
    "Tournament Class": match["Tournament Class"] === "NaN" || !match["Tournament Class"] ? null : match["Tournament Class"],
    "Match": match["Match"] === "NaN" || !match["Match"] ? null : match["Match"],
    "Tab": match["Tab"] === "NaN" || !match["Tab"] ? null : match["Tab"],
    "Team 1 Player 1": match["Team 1 Player 1"] === "NaN" || !match["Team 1 Player 1"] ? null : match["Team 1 Player 1"],
    "Team 1 Player 2": match["Team 1 Player 2"] === "NaN" || !match["Team 1 Player 2"] ? null : match["Team 1 Player 2"],
    "Team 2 Player 1": match["Team 2 Player 1"] === "NaN" || !match["Team 2 Player 1"] ? null : match["Team 2 Player 1"],
    "Team 2 Player 2": match["Team 2 Player 2"] === "NaN" || !match["Team 2 Player 2"] ? null : match["Team 2 Player 2"],
    "Result": match["Result"] === "NaN" || !match["Result"] ? null : match["Result"],
    "Winner Player 1": match["Winner Player 1"] === "NaN" || !match["Winner Player 1"] ? null : match["Winner Player 1"],
    "Winner Player 2": match["Winner Player 2"] === "NaN" || !match["Winner Player 2"] ? null : match["Winner Player 2"]
  };
  
  if ((index + 1) % 100000 === 0) {
    console.log(`Processed ${index + 1} matches...`);
  }
  
  return formatted;
});

console.log('\nSaving formatted JSON...');
fs.writeFileSync('matches_formatted.json', JSON.stringify(formattedData, null, 2), 'utf8');
console.log(`Formatted JSON saved to: matches_formatted.json`);

// Also create a CSV version for easier manual import if needed
console.log('\nCreating CSV version...');
const csvHeader = 'Season,"Tournament Name",Date,"Tournament Class",Match,Tab,"Team 1 Player 1","Team 1 Player 2","Team 2 Player 1","Team 2 Player 2",Result,"Winner Player 1","Winner Player 2"\n';

const csvRows = formattedData.map(match => {
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };
  
  return [
    escapeCSV(match["Season"]),
    escapeCSV(match["Tournament Name"]),
    escapeCSV(match["Date"]),
    escapeCSV(match["Tournament Class"]),
    escapeCSV(match["Match"]),
    escapeCSV(match["Tab"]),
    escapeCSV(match["Team 1 Player 1"]),
    escapeCSV(match["Team 1 Player 2"]),
    escapeCSV(match["Team 2 Player 1"]),
    escapeCSV(match["Team 2 Player 2"]),
    escapeCSV(match["Result"]),
    escapeCSV(match["Winner Player 1"]),
    escapeCSV(match["Winner Player 2"])
  ].join(',');
});

fs.writeFileSync('matches_formatted.csv', csvHeader + csvRows.join('\n'), 'utf8');
console.log(`CSV version saved to: matches_formatted.csv`);

console.log('\nFormatting completed!');
console.log(`Total matches: ${formattedData.length}`);
console.log('\nYou can now:');
console.log('1. Delete all rows in the matches table');
console.log('2. Import matches_formatted.json using Supabase dashboard or');
console.log('3. Use the import_to_supabase_matches.js script to import programmatically');





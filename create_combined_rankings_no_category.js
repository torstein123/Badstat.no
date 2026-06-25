const fs = require('fs');
const path = require('path');

// Define categories and files
const categories = {
    'HS': 'src/combined_rankingsHS.json',
    'HD': 'src/combined_rankingsHD.json',
    'DD': 'src/combined_rankingsDD.json',
    'DS': 'src/combined_rankingsDS.json',
    'MIX': 'src/combined_rankingsMIX.json'
};

const outputPath = 'src/combined_rankings.json';
let allData = [];

console.log('Combining all ranking files (without categories)...');

// Process each category
Object.entries(categories).forEach(([category, filePath]) => {
    console.log(`Processing ${category} from ${filePath}`);
    
    try {
        // Read JSON file
        const jsonContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(jsonContent);
        
        // Add all records without category field
        allData = allData.concat(data);
        console.log(`Added ${data.length} records from ${category}`);
    } catch (error) {
        console.error(`Error processing ${category}:`, error.message);
    }
});

console.log(`Total records: ${allData.length}`);

// Write JSON file
fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2), 'utf8');
console.log(`Combined JSON without categories saved to: ${outputPath}`);

// Also copy to public for generate_players_data.js
const publicPath = 'public/combined_rankings.json';
fs.writeFileSync(publicPath, JSON.stringify(allData, null, 2), 'utf8');
console.log(`Also copied to: ${publicPath}`);





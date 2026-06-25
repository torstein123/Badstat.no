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

const outputPath = 'public/combined_rankings_with_categories.json';
let allData = [];

console.log('Combining all ranking files with categories...');

// Process each category
Object.entries(categories).forEach(([category, filePath]) => {
    console.log(`Processing ${category} from ${filePath}`);
    
    try {
        // Read JSON file
        const jsonContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(jsonContent);
        
        // Add category to each record
        data.forEach(record => {
            record.category = category;
        });
        
        allData = allData.concat(data);
        console.log(`Added ${data.length} records from ${category}`);
    } catch (error) {
        console.error(`Error processing ${category}:`, error.message);
    }
});

console.log(`Total records: ${allData.length}`);

// Write JSON file
fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2), 'utf8');
console.log(`Combined JSON with categories saved to: ${outputPath}`);

// Show sample data
console.log('\nSample data with categories:');
console.log(JSON.stringify(allData.slice(0, 3), null, 2));







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

const outputPath = 'src/all_rankings_combined.csv';
let allData = [];

console.log('Combining all ranking files...');

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

// Convert to CSV
if (allData.length > 0) {
    // Get all unique column names
    const columns = new Set();
    allData.forEach(record => {
        Object.keys(record).forEach(key => columns.add(key));
    });
    
    // Ensure category is at the end
    const columnArray = Array.from(columns).filter(col => col !== 'category');
    columnArray.push('category');
    
    // Create CSV content
    const csvLines = [];
    
    // Add header
    csvLines.push(columnArray.join(','));
    
    // Add data rows
    allData.forEach(record => {
        const row = columnArray.map(column => {
            let value = record[column] || '';
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                value = '"' + value.replace(/"/g, '""') + '"';
            }
            return value;
        });
        csvLines.push(row.join(','));
    });
    
    // Write to file
    fs.writeFileSync(outputPath, csvLines.join('\n'), 'utf8');
    console.log(`Combined CSV saved to: ${outputPath}`);
    console.log(`Total records: ${allData.length}`);
} else {
    console.log('No data to export!');
} 
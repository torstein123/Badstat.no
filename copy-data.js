const fs = require('fs');
const path = require('path');

// Define the source and destination paths
const sourcePath = path.join(__dirname, 'src', 'combined_rankings.json');
const destPath = path.join(__dirname, 'public', 'combined_rankings.json');

// Copy the file
try {
  fs.copyFileSync(sourcePath, destPath);
} catch (error) {
  console.error('Error copying file:', error);
} 
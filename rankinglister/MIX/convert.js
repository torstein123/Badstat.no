// Import necessary libraries
const csvtojson = require("csvtojson");
const fs = require("fs");

// Specify the paths to the input CSV file and the output JSON file
const csvFilePath = './combined_rankingsMIX.csv'; // Make sure this path is correct
const jsonFilePath = './combined_rankingsMIX.json'; // This is where the output will be saved

// Convert CSV to JSON
csvtojson()
  .fromFile(csvFilePath)
  .then(jsonData => {
    // Write JSON data to file
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');
    console.log("JSON file has been created");
  })
  .catch(error => {
    console.error("An error occurred:", error);
  });

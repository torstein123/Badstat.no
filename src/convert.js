// Import necessary libraries
const csvtojson = require("csvtojson");
const fs = require("fs");

// Specify the paths to the input CSV file and the output JSON file
const csvFilePath = './combined_rankings.csv';
const jsonFilePath = './combined_rankings.json';

// Convert CSV to JSON
csvtojson()
  .fromFile(csvFilePath)
  .then(jsonData => {
    // Write JSON data to file
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf-8', function(err) {
      if(err) {
        console.log(err);
      }
    });
    console.log("JSON file has been created");
  })
  .catch(error => {
    console.error("An error occurred:", error);
  });

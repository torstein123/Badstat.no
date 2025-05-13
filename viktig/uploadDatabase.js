const uploadJsonFile = async (filePath, collectionName, documentName) => {
    try {
      // Read the JSON file
      const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
      // Upload the data to Firestore
      const docRef = doc(db, collectionName, documentName);
      await setDoc(docRef, { data: jsonData }, { merge: true });
    } catch (error) {
      console.error(`Error uploading ${filePath}:`, error);
    }
  };
  
  // Example usage
  // Specify the path to your JSON file, collection name, and document name
  uploadJsonFile('path/to/your/tournamentMatches.json', 'tournamentData', 'allMatches');
  uploadJsonFile('path/to/your/singlesRankings.json', 'rankings', 'singles_rankings');
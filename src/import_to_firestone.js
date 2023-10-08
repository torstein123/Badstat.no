const admin = require('firebase-admin');
const fs = require('fs');

// No need to import again, so remove the repeated import

// Correct the path for your service account
var serviceAccount = require("C:\\Users\\Torstein\\Documents\\badmintonsentralen-firebase-adminsdk-dsozq-3ad83530cd.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://badmintonsentralen-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.firestore();

// Load your JSON data
// Also, correct the path and ensure your file's extension is just '.json' not '.json.json'
const data = JSON.parse(fs.readFileSync('src\\cleaned_file.json', 'latin1'));

// Assuming your data is an array of objects
data.forEach((item, index) => {
    // Adding to 'matches' collection in Firestore
    db.collection('matches').doc(index.toString()).set(item)
    .then(() => {
        console.log(`Document ${index} written`);
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
    });
});

import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore'
const firebaseConfig = {
    apiKey: "AIzaSyAGGsM-d0f7sL5NHuJFgIETYTk3l6c8Rd4",
    authDomain: "badstats.firebaseapp.com",
    projectId: "badstats",
    storageBucket: "badstats.appspot.com",
    messagingSenderId: "532006575315",
    appId: "1:532006575315:web:0e352b593029a421f80826",
    measurementId: "G-Q69Z2MFQ3P"
  };

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
const auth = getAuth(app);
export {auth};

// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
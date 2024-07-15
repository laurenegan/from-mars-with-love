import firebase from "firebase";

const firebaseConfig = {
    // config from Firebase site
    apiKey: "AIzaSyCAzSPMMawien3RtX74ak3YCSgPoc4RnAM",
    authDomain: "from-mars-with-love-174b0.firebaseapp.com",
    databaseURL: "https://from-mars-with-love-174b0.firebaseio.com",
    projectId: "from-mars-with-love-174b0",
    storageBucket: "from-mars-with-love-174b0.appspot.com",
    messagingSenderId: "571357351587",
    appId: "1:571357351587:web:480d4a8e708c0114eaf916"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

const database = firebaseApp.database();

export default database;
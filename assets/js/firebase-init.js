// firebase-init.js
const firebaseConfig = {
  apiKey: "AIzaSyBY5k9J-3zyKluZp04bi5n5-eRcEgBQQ7s",
  authDomain: "contiglesia.firebaseapp.com",
  projectId: "contiglesia",
  storageBucket: "contiglesia.appspot.com",
  messagingSenderId: "824452265660",
  appId: "1:824452265660:web:832d8cd04343c3a7e2c2b9",
  measurementId: "G-7WCZFJLN4B"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencias globales
const auth = firebase.auth();
const db = firebase.firestore();

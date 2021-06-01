import firebase from "firebase/app";
import "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDzlPmeB2dOYyYm9AhR7BxDb2i7YXvvIsY",
  authDomain: "cs374-kaist.firebaseapp.com",
  databaseURL: "https://cs374-kaist-default-rtdb.firebaseio.com",
  projectId: "cs374-kaist",
  storageBucket: "cs374-kaist.appspot.com",
  messagingSenderId: "806654795589",
  appId: "1:806654795589:web:2d48f8bd8fb80fb8a4682c",
  measurementId: "G-KTYQTEEZ03",
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();

export { database };

// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCqGXqgrziq6Rvtj8qnPCwOhRlxXKOXNDU",
  authDomain: "hospital-fbccf.firebaseapp.com",
  projectId: "hospital-fbccf",
  storageBucket: "hospital-fbccf.firebasestorage.app",
  messagingSenderId: "862579505758",
  appId: "1:862579505758:web:2b9f19181a66a5659c52cf",
  measurementId: "G-WYKLG7QT31"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

export { db, auth };
export default app;

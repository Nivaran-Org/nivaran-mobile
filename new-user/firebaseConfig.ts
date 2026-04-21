import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace with your Firebase config
export const firebaseConfig = {
    apiKey: "AIzaSyCSP0KAxgEFeOnHKnWZDQN7tK2zeFt78r0",
    authDomain: "eduniketan-freelance.firebaseapp.com",
    databaseURL: "https://eduniketan-freelance-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "eduniketan-freelance",
    storageBucket: "eduniketan-freelance.firebasestorage.app",
    messagingSenderId: "650098010937",
    appId: "1:650098010937:web:8c786102871abd43d0d6e8",
    measurementId: "G-5ES38LMT0E"
};



const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
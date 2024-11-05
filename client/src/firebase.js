// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "lyriclab-f275c.firebaseapp.com",
  projectId: "lyriclab-f275c",
  storageBucket: "lyriclab-f275c.firebasestorage.app",
  messagingSenderId: "538424755375",
  appId: "1:538424755375:web:d816ce71c9ffbd0ff9405a"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

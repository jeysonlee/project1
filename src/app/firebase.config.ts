import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBXBPIzcw2kSdJvAj2ZHRhdpAuVdZ0EAx4",
  authDomain: "agro-gest.firebaseapp.com",
  projectId: "agro-gest",
  storageBucket: "agro-gest.firebasestorage.app",
  messagingSenderId: "795304910968",
  appId: "1:795304910968:web:89ea605461cdeddb184d8d"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);


/*
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXBPIzcw2kSdJvAj2ZHRhdpAuVdZ0EAx4",
  authDomain: "agro-gest.firebaseapp.com",
  projectId: "agro-gest",
  storageBucket: "agro-gest.firebasestorage.app",
  messagingSenderId: "795304910968",
  appId: "1:795304910968:web:89ea605461cdeddb184d8d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); */

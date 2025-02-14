// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCcoqw1uT5s08TR05NKauq7CEX7CumfbcE",
    authDomain: "hairai-21bb9.firebaseapp.com",
    projectId: "hairai-21bb9",
    storageBucket: "hairai-21bb9.appspot.com",
    messagingSenderId: "1061733888804",
    appId: "1:1061733888804:web:f2400b97b2da815302f9b1",
    measurementId: "G-P0WEH6RMFY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
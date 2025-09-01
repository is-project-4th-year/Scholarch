// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeAuth, getReactNativePersistence } from "@firebase/auth";
import React from "react";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC8dsilGCgYs8fKieVszjGDlKPKR-MAHAU",
  authDomain: "scholarcg-b7aba.firebaseapp.com",
  projectId: "scholarcg-b7aba",
  storageBucket: "scholarcg-b7aba.firebasestorage.app",
  messagingSenderId: "108812962970",
  appId: "1:108812962970:web:8ad172cd29d5d0fd2b2323",
  measurementId: "G-SC0G0N66VP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);
//const analytics = getAnalytics(app);
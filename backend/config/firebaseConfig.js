import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDfIO-zXOQAK7DCGwE-hLQbeAIUatkiQxI",
  authDomain: "householdenergymonitoringapp.firebaseapp.com",
  projectId: "householdenergymonitoringapp",
  storageBucket: "householdenergymonitoringapp.firebasestorage.app",
  messagingSenderId: "55569988863",
  appId: "1:55569988863:web:13a566f8c824a275c3a0ca"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});



import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

// Firebase configuration
// TODO: Replace with your Firebase project configuration
// Get these values from: Firebase Console > Project Settings > General > Your apps > SDK setup and configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'YOUR_DATABASE_URL',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

// Initialize Firebase
let app: FirebaseApp | undefined;
let database: Database | undefined;

if (typeof window !== 'undefined') {
  // Only initialize on client side if config is valid
  const hasValidConfig = firebaseConfig.apiKey &&
                          firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
                          firebaseConfig.projectId &&
                          firebaseConfig.projectId !== 'YOUR_PROJECT_ID';

  if (hasValidConfig) {
    try {
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        database = getDatabase(app);
      } else {
        app = getApps()[0];
        database = getDatabase(app);
      }
    } catch (error) {
      console.warn('Firebase initialization failed:', error);
    }
  } else {
    console.warn('Firebase not configured. Please add your Firebase config to .env.local');
  }
}

export { app, database };

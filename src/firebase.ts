// Placeholder Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyPlaceholderKeyForFirebaseIntegration",
  authDomain: "election-assistant-demo.firebaseapp.com",
  projectId: "election-assistant-demo",
  storageBucket: "election-assistant-demo.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef1234567890",
  measurementId: "G-ABCDEF1234"
};

// Initialize Firebase only if we are in a browser environment
let app;
let analytics;
let auth;

try {
  app = initializeApp(firebaseConfig);
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
    auth = getAuth(app);
  }
} catch (error) {
  console.warn("Failed to initialize Firebase:", error);
}

export const signInDemoUser = async () => {
  if (!auth) return null;
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.warn("Firebase Auth Error:", error);
    return null;
  }
};

export { app, analytics, auth };

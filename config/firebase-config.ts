// lib/firebase/config.ts

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize App Check (client-side only)
let appCheckInstance = null;

if (typeof window !== 'undefined') {
  // Development mode: use debug token
  if (process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN) {
    // @ts-ignore
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN;
  }
  
  // Initialize App Check - use debug token to bypass ReCAPTCHA throttling
  if (process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN) {
    // Debug token will be used instead of ReCAPTCHA
    try {
      appCheckInstance = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('6LeJQI0rAAAAAJZXTrFZ_x5UPEMiR_Tklu3OGHs3'), // Fallback, debug token takes precedence
        isTokenAutoRefreshEnabled: true
      });
    } catch (error) {
      console.warn('AppCheck initialization failed:', error);
    }
  }
}

export const appCheck = appCheckInstance;

// Initialize Analytics (client-side only)
export const analytics = typeof window !== 'undefined'
  ? isSupported().then(yes => yes ? getAnalytics(app) : null)
  : null;


export default app;
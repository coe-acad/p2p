import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Allow disabling phone app verification for testing (e.g., local development)
const isDisablePhoneAppVerificationForTesting =
  import.meta.env.VITE_DISABLE_PHONE_APP_VERIFICATION_FOR_TESTING === "true";

if (isDisablePhoneAppVerificationForTesting) {
  auth.settings.appVerificationDisabledForTesting = true;
  console.log("🔓 Phone app verification DISABLED for testing");
}

export const db = getFirestore(app);
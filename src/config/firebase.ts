import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator, initializeFirestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Use dummy config for emulator
const firebaseConfig = {
  apiKey: 'fake-api-key',
  authDomain: 'localhost',
  projectId: 'tiktok-landscape-clone',
  storageBucket: 'tiktok-landscape-clone.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true
});
export const storage = getStorage(app);

// Initialize emulators connection
export const initializeEmulators = async () => {
  try {
    // Connect to emulators
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectStorageEmulator(storage, '127.0.0.1', 9199);

    console.log('Connected to Firebase emulators');
    return true;
  } catch (error) {
    console.error('Failed to connect to Firebase emulators:', error);
    return false;
  }
};

export default app;

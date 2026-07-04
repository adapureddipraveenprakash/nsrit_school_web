// Firebase Web SDK initialization — shared across the entire web app
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: 'AIzaSyDmZ85vptodQk1jSIYBPSCWFNJ4RMjFoyU',
  authDomain: 'nsrit-school-2b749.firebaseapp.com',
  projectId: 'nsrit-school-2b749',
  storageBucket: 'nsrit-school-2b749.firebasestorage.app',
  messagingSenderId: '234250139606',
  appId: '1:234250139606:web:nsrit-web',
};

export const USE_EMULATOR = false;

export const dataConnectConfig = {
  projectId: 'nsrit-school-2b749',
  location: 'asia-south1',
  serviceId: 'nsrit-school-2b749-service',
  connectorId: 'nsrit',
  apiBaseURL: USE_EMULATOR
    ? 'http://localhost:9399/v1'
    : 'https://firebasedataconnect.googleapis.com/v1',
};     


const firebaseApp =
  getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

if (USE_EMULATOR) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}

export default firebaseApp;
import { initializeApp } from 'firebase/app'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIwrjeA5Gqp4UTNZoZ8qtKDOmRC8_Zfgs",
  authDomain: "chorequest-b8a42.firebaseapp.com",
  projectId: "chorequest-b8a42",
  storageBucket: "chorequest-b8a42.firebasestorage.app",
  messagingSenderId: "441006817313",
  appId: "1:441006817313:web:e6f87dc67ed696590ee360"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore with settings
const db = getFirestore(app)

// Enable offline persistence (optional but recommended for better user experience)
// This allows the app to work offline by caching data
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.error('Multiple tabs open, persistence can only be enabled in one tab at a time.')
    } else if (err.code === 'unimplemented') {
      console.error('The current browser does not support all features required for Firestore offline persistence.')
    }
  })

const auth = getAuth(app)
const storage = getStorage(app)

export { db, auth, storage, app }

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBFpWpArWJAEawCoaodzBh17KoAx-eD_rE",
  authDomain: "deepgaurd-d29ed.firebaseapp.com",
  projectId: "deepgaurd-d29ed",
  storageBucket: "deepgaurd-d29ed.firebasestorage.app",
  messagingSenderId: "231898708978",
  appId: "1:231898708978:web:3c440b58f981f48df2496b"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

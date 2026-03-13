import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyA07-kYYG76rHG7j4sjNcWlpqcrjDfWol0",
  authDomain: "coolbros-c7ed7.firebaseapp.com",
  projectId: "coolbros-c7ed7",
  storageBucket: "coolbros-c7ed7.firebasestorage.app",
  messagingSenderId: "121980049295",
  appId: "1:121980049295:web:56c83c5e7eaeb8e0bd5dfa"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
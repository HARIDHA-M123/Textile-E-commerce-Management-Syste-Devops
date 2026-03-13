import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './config'

const googleProvider = new GoogleAuthProvider()

// Sign up with email & password
export const signUp = async ({ firstName, lastName, email, phone, password }) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  // Update display name
  await updateProfile(user, { displayName: `${firstName} ${lastName}` })

  // Send email verification
  await sendEmailVerification(user)

  // Save user to Firestore
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    firstName,
    lastName,
    email,
    phone,
    displayName: `${firstName} ${lastName}`,
    role: 'customer',
    isBlocked: false,
    createdAt: serverTimestamp()
  })

  return user
}

// Sign in with email & password
export const signIn = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

// Sign in with Google
export const signInWithGoogle = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider)
  const user = userCredential.user

  // Check if user already exists in Firestore
  const userDoc = await getDoc(doc(db, 'users', user.uid))
  if (!userDoc.exists()) {
    const nameParts = (user.displayName || '').split(' ')
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: user.email,
      phone: '',
      displayName: user.displayName || '',
      role: 'customer',
      isBlocked: false,
      createdAt: serverTimestamp()
    })
  }

  return user
}

// Sign out
export const logOut = async () => {
  await signOut(auth)
}

// Forgot password
export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email)
}

// Get user data from Firestore
export const getUserData = async (uid) => {
  const userDoc = await getDoc(doc(db, 'users', uid))
  return userDoc.exists() ? userDoc.data() : null
}
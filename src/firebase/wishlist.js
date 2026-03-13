import {
  doc, collection, setDoc, deleteDoc, getDocs
} from 'firebase/firestore'
import { db } from './config'

const wishlistCol = (uid) => collection(db, 'users', uid, 'wishlist')
const wishlistDoc = (uid, productId) => doc(db, 'users', uid, 'wishlist', productId)

// ── Get all wishlist items ─────────────────────────────────────
export const getWishlist = async (uid) => {
  const snapshot = await getDocs(wishlistCol(uid))
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── Add item to wishlist ───────────────────────────────────────
export const addToWishlist = async (uid, item) => {
  await setDoc(wishlistDoc(uid, item.productId), item)
}

// ── Remove item from wishlist ─────────────────────────────────
export const removeFromWishlist = async (uid, productId) => {
  await deleteDoc(wishlistDoc(uid, productId))
}

// ── Clear entire wishlist ─────────────────────────────────────
export const clearWishlist = async (uid) => {
  const snapshot = await getDocs(wishlistCol(uid))
  await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)))
}
import {
  doc, collection, setDoc, deleteDoc,
  getDocs, updateDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from './config'

const cartCol = (uid) => collection(db, 'users', uid, 'cart')
const cartDoc = (uid, itemId) => doc(db, 'users', uid, 'cart', itemId)

// ── Get all cart items for a user ─────────────────────────────
export const getCart = async (uid) => {
  const snapshot = await getDocs(cartCol(uid))
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── Add or update a cart item ─────────────────────────────────
// itemId is unique per product+size+color combo
export const addToCart = async (uid, item) => {
  const itemId = `${item.productId}_${item.size}_${item.color?.name || 'default'}`
  const ref = cartDoc(uid, itemId)
  await setDoc(ref, { ...item, itemId, updatedAt: serverTimestamp() }, { merge: true })
  return itemId
}

// ── Update quantity of a cart item ────────────────────────────
export const updateCartQuantity = async (uid, itemId, quantity) => {
  await updateDoc(cartDoc(uid, itemId), { quantity, updatedAt: serverTimestamp() })
}

// ── Remove a cart item ────────────────────────────────────────
export const removeFromCart = async (uid, itemId) => {
  await deleteDoc(cartDoc(uid, itemId))
}

// ── Clear entire cart ─────────────────────────────────────────
export const clearCart = async (uid) => {
  const snapshot = await getDocs(cartCol(uid))
  const deletes = snapshot.docs.map(d => deleteDoc(d.ref))
  await Promise.all(deletes)
}
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, orderBy, where, serverTimestamp
} from 'firebase/firestore'
import { db } from './config'

const COLLECTION = 'products'

// ── Get all products (for Shop page) ──────────────────────────
export const getAllProducts = async () => {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// ── Get single product by ID (for ProductDetail page) ─────────
export const getProductById = async (id) => {
  const docRef = doc(db, COLLECTION, id)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() }
}

// ── Get featured products (for Home page) ─────────────────────
export const getFeaturedProducts = async (limit = 8) => {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.slice(0, limit).map(doc => ({ id: doc.id, ...doc.data() }))
}

// ── Add new product (Admin) ────────────────────────────────────
export const addProduct = async (productData) => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...productData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  return docRef.id
}

// ── Update product (Admin) ─────────────────────────────────────
export const updateProduct = async (id, productData) => {
  const docRef = doc(db, COLLECTION, id)
  await updateDoc(docRef, {
    ...productData,
    updatedAt: serverTimestamp()
  })
}

// ── Delete product (Admin) ─────────────────────────────────────
export const deleteProduct = async (id) => {
  await deleteDoc(doc(db, COLLECTION, id))
}

// ── Get products by category ───────────────────────────────────
export const getProductsByCategory = async (category) => {
  const q = query(
    collection(db, COLLECTION),
    where('category', '==', category),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// ── Decrement stock after order placed ────────────────────────
export const decrementStock = async (cartItems) => {
  const updates = cartItems.map(async (item) => {
    const docRef = doc(db, COLLECTION, item.productId)
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) return
    const current = snapshot.data()
    const newStock = Math.max(0, (current.stock || 0) - item.quantity)
    const newInStock = newStock > 0
    const newStatus = newStock === 0
      ? 'Out of Stock'
      : newStock <= 10
        ? 'Low Stock'
        : current.status === 'Out of Stock' ? 'Active' : current.status
    await updateDoc(docRef, {
      stock: newStock,
      inStock: newInStock,
      status: newStatus,
      updatedAt: serverTimestamp(),
    })
  })
  await Promise.all(updates)
}
import {
  collection, doc, addDoc, updateDoc, getDocs,
  query, where, orderBy, serverTimestamp, getDoc
} from 'firebase/firestore'
import { db } from './config'

// ── Save a new order after payment ────────────────────────────
export const createOrder = async (uid, orderData) => {
  const docRef = await addDoc(collection(db, 'orders'), {
    ...orderData,
    uid,
    status: 'Confirmed',
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

// ── Get all orders for a user ─────────────────────────────────
// orderBy removed to avoid composite Firestore index requirement — sorted client-side instead
export const getUserOrders = async (uid) => {
  const q = query(
    collection(db, 'orders'),
    where('uid', '==', uid)
  )
  const snapshot = await getDocs(q)
  const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  return orders.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0
    const bTime = b.createdAt?.toMillis?.() ?? 0
    return bTime - aTime
  })
}

// ── Get all orders (Admin) ────────────────────────────────────
export const getAllOrders = async () => {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── Update order status (Admin) ───────────────────────────────
export const updateOrderStatus = async (orderId, status) => {
  await updateDoc(doc(db, 'orders', orderId), { status, updatedAt: serverTimestamp() })
}

// ── Get single order ──────────────────────────────────────────
export const getOrderById = async (orderId) => {
  const snapshot = await getDoc(doc(db, 'orders', orderId))
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() }
}
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, query, where, serverTimestamp, increment, arrayUnion
} from 'firebase/firestore'
import { db } from './config'

// ── Get all coupons ───────────────────────────────────────────
export const getAllCoupons = async () => {
  const snapshot = await getDocs(collection(db, 'coupons'))
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── Add a new coupon ──────────────────────────────────────────
export const addCoupon = async (couponData) => {
  const docRef = await addDoc(collection(db, 'coupons'), {
    ...couponData,
    uses: 0,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

// ── Update a coupon ───────────────────────────────────────────
export const updateCoupon = async (couponId, couponData) => {
  await updateDoc(doc(db, 'coupons', couponId), {
    ...couponData,
    updatedAt: serverTimestamp(),
  })
}

// ── Delete a coupon ───────────────────────────────────────────
export const deleteCoupon = async (couponId) => {
  await deleteDoc(doc(db, 'coupons', couponId))
}

// ── Toggle coupon status ──────────────────────────────────────
export const toggleCouponStatus = async (couponId, currentStatus) => {
  const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active'
  await updateDoc(doc(db, 'coupons', couponId), { status: newStatus })
  return newStatus
}

// ── Validate & apply coupon at checkout ──────────────────────
export const validateCoupon = async (code, orderTotal, userId) => {
  const q = query(
    collection(db, 'coupons'),
    where('code', '==', code.toUpperCase()),
    where('status', '==', 'Active')
  )
  const snapshot = await getDocs(q)
  if (snapshot.empty) return { valid: false, message: 'Invalid or expired coupon code.' }

  const coupon = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }

  if (coupon.uses >= coupon.maxUses) return { valid: false, message: 'This coupon has reached its usage limit.' }
  if (orderTotal < coupon.minOrder) return { valid: false, message: `Minimum order of ₹${coupon.minOrder} required.` }

  // ── Check if this user already used this coupon ──────────
  const usedBy = coupon.usedBy || []
  if (userId && usedBy.includes(userId)) return { valid: false, message: 'You have already used this coupon.' }

  // ── Check expiry ──────────────────────────────────────────
  if (coupon.expiry) {
    const expiryDate = new Date(coupon.expiry)
    expiryDate.setHours(23, 59, 59, 999)
    if (new Date() > expiryDate) return { valid: false, message: 'This coupon has expired.' }
  }

  const discount = coupon.type === 'Percentage'
    ? Math.round((orderTotal * coupon.value) / 100)
    : coupon.value

  return { valid: true, coupon, discount }
}

// ── Mark coupon as used by a specific user after order ───────
export const markCouponUsed = async (couponId, userId) => {
  await updateDoc(doc(db, 'coupons', couponId), {
    uses: increment(1),
    usedBy: arrayUnion(userId),
  })
}

// ── Increment uses after successful order (legacy) ────────────
export const incrementCouponUses = async (couponId) => {
  await updateDoc(doc(db, 'coupons', couponId), { uses: increment(1) })
}
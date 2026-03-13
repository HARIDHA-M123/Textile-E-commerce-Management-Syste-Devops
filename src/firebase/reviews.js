import {
  collection, doc, addDoc, getDocs, query,
  where, serverTimestamp, updateDoc
} from 'firebase/firestore'
import { db } from './config'

// ── Get all reviews for a product ─────────────────────────────
export const getProductReviews = async (productId) => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId)
    )
    const snapshot = await getDocs(q)
    const reviews = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    reviews.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() ?? 0
      const bTime = b.createdAt?.toMillis?.() ?? 0
      return bTime - aTime
    })
    return reviews
  } catch (err) {
    console.error('getProductReviews error:', err)
    return []
  }
}

// ── Check if user has ordered this product ────────────────────
export const hasUserOrderedProduct = async (uid, productId) => {
  try {
    const q = query(collection(db, 'orders'), where('uid', '==', uid))
    const snapshot = await getDocs(q)
    return snapshot.docs.some(d => {
      const items = d.data().items || []
      return items.some(item => item.productId === productId)
    })
  } catch {
    return false
  }
}

// ── Check if user already reviewed this product ───────────────
export const getUserReview = async (uid, productId) => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      where('uid', '==', uid)
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
  } catch {
    return null
  }
}

// ── Add review + recalculate product rating ───────────────────
export const addReview = async ({ productId, uid, userName, rating, comment }) => {
  await addDoc(collection(db, 'reviews'), {
    productId, uid, userName, rating, comment,
    createdAt: serverTimestamp()
  })

  const allReviews = await getProductReviews(productId)
  const count = allReviews.length
  const avg = count > 0
    ? Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
    : rating

  await updateDoc(doc(db, 'products', productId), {
    rating: avg,
    reviews: count
  })
}

// ── One-time sync: recalculate ratings for ALL products ───────
// Call this from AdminProducts to fix existing products
export const syncAllProductRatings = async () => {
  const reviewsSnap = await getDocs(collection(db, 'reviews'))
  const reviews = reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

  const byProduct = {}
  reviews.forEach(r => {
    if (!r.productId) return
    if (!byProduct[r.productId]) byProduct[r.productId] = []
    byProduct[r.productId].push(r.rating)
  })

  for (const [productId, ratings] of Object.entries(byProduct)) {
    const count = ratings.length
    const avg = Math.round((ratings.reduce((a, b) => a + b, 0) / count) * 10) / 10
    await updateDoc(doc(db, 'products', productId), { rating: avg, reviews: count })
  }

  return Object.keys(byProduct).length
}
import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { getWishlist, addToWishlist, removeFromWishlist, clearWishlist } from '../firebase/wishlist'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import toast from 'react-hot-toast'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const { user, isLoggedIn } = useAuth()
  const [wishlistItems, setWishlistItems] = useState([])
  const [wishlistLoading, setWishlistLoading] = useState(false)

  // Fetch wishlist with live inStock from products — callable any time
  const refreshWishlist = async () => {
    if (!user) return
    setWishlistLoading(true)
    try {
      const items = await getWishlist(user.uid)
      const updated = await Promise.all(items.map(async (item) => {
        try {
          const productSnap = await getDoc(doc(db, 'products', item.productId || item.id))
          if (productSnap.exists()) {
            const liveData = productSnap.data()
            return {
              ...item,
              inStock: liveData.inStock ?? true,
              price: liveData.price ?? item.price,
              originalPrice: liveData.originalPrice ?? item.originalPrice,
            }
          }
        } catch {}
        return item
      }))
      setWishlistItems(updated)
    } catch (err) {
      console.error('Failed to load wishlist:', err)
    } finally {
      setWishlistLoading(false)
    }
  }

  // Load wishlist on login
  useEffect(() => {
    if (isLoggedIn && user) {
      refreshWishlist()
    } else {
      setWishlistItems([])
    }
  }, [isLoggedIn, user])

  const isWishlisted = (productId) => wishlistItems.some(i => i.id === productId)

  const toggleWishlist = async (item) => {
    if (!user) { toast.error('Please login to save to wishlist'); return }
    try {
      if (isWishlisted(item.productId)) {
        await removeFromWishlist(user.uid, item.productId)
        setWishlistItems(prev => prev.filter(i => i.id !== item.productId))
        toast.success('Removed from wishlist')
      } else {
        await addToWishlist(user.uid, item)
        setWishlistItems(prev => [...prev, { ...item, id: item.productId }])
        toast.success('Added to wishlist!')
      }
    } catch {
      toast.error('Something went wrong')
    }
  }

  const removeItem = async (productId) => {
    if (!user) return
    try {
      await removeFromWishlist(user.uid, productId)
      setWishlistItems(prev => prev.filter(i => i.id !== productId))
    } catch {
      toast.error('Failed to remove item')
    }
  }

  const emptyWishlist = async () => {
    if (!user) return
    try {
      await clearWishlist(user.uid)
      setWishlistItems([])
    } catch {
      toast.error('Failed to clear wishlist')
    }
  }

  const wishlistCount = wishlistItems.length

  return (
    <WishlistContext.Provider value={{
      wishlistItems, wishlistLoading, wishlistCount,
      isWishlisted, toggleWishlist, removeItem, emptyWishlist,
      refreshWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used inside WishlistProvider')
  return context
}
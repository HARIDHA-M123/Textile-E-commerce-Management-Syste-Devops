import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { getCart, addToCart, updateCartQuantity, removeFromCart, clearCart } from '../firebase/cart'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user, isLoggedIn } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [cartLoading, setCartLoading] = useState(false)

  // Load cart when user logs in
  useEffect(() => {
    if (isLoggedIn && user) {
      setCartLoading(true)
      getCart(user.uid)
        .then(items => setCartItems(items))
        .catch(err => console.error('Failed to load cart:', err))
        .finally(() => setCartLoading(false))
    } else {
      setCartItems([])
    }
  }, [isLoggedIn, user])

  // Add item to cart
  const addItem = async (item) => {
    if (!user) { toast.error('Please login to add to cart'); return }
    try {
      const itemId = `${item.productId}_${item.size}_${item.color?.name || 'default'}`
      const existing = cartItems.find(i => i.id === itemId)
      if (existing) {
        // Increase quantity if already in cart
        const newQty = Math.min(10, existing.quantity + item.quantity)
        await updateCartQuantity(user.uid, itemId, newQty)
        setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i))
        toast.success('Cart updated!')
      } else {
        await addToCart(user.uid, item)
        setCartItems(prev => [...prev, { ...item, id: itemId }])
        toast.success('Added to cart!')
      }
    } catch {
      toast.error('Failed to add to cart')
    }
  }

  // Update item quantity
  const updateQty = async (itemId, quantity) => {
    if (!user) return
    try {
      await updateCartQuantity(user.uid, itemId, quantity)
      setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i))
    } catch {
      toast.error('Failed to update quantity')
    }
  }

  // Remove item
  const removeItem = async (itemId) => {
    if (!user) return
    try {
      await removeFromCart(user.uid, itemId)
      setCartItems(prev => prev.filter(i => i.id !== itemId))
    } catch {
      toast.error('Failed to remove item')
    }
  }

  // Clear entire cart
  const emptyCart = async () => {
    if (!user) return
    try {
      await clearCart(user.uid)
      setCartItems([])
    } catch {
      toast.error('Failed to clear cart')
    }
  }

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      cartItems, cartLoading, cartCount, cartTotal,
      addItem, updateQty, removeItem, emptyCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}
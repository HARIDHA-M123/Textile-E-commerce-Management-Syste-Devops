import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'

function WishlistCard({ item, onRemove, onMoveToCart }) {
  const [removing, setRemoving] = useState(false)
  const discount = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)

  const handleRemove = () => {
    setRemoving(true)
    setTimeout(() => onRemove(item.id), 300)
  }

  return (
    <div className={`bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-300 group ${removing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>

      {/* Image */}
      <div className="relative aspect-3/4 overflow-hidden bg-gray-100">
        <img
          src={(item.image)?.replace('/upload/', '/upload/w_600,q_90,f_auto/')}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        {item.badge && (
          <span className="absolute top-3 left-3 bg-[#111111] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
            {item.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 right-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
            -{discount}%
          </span>
        )}

        {/* Remove from wishlist */}
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors group/btn"
          title="Remove from wishlist"
        >
          <svg className="w-4 h-4 text-red-400 group-hover/btn:text-red-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
          </svg>
        </button>

        {/* Out of Stock overlay */}
        {!item.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">{item.category}</p>
        <Link to={`/product/${item.id}`}>
          <h3 className="text-sm font-semibold text-gray-900 hover:text-gray-500 transition-colors line-clamp-1 mb-2">
            {item.name}
          </h3>
        </Link>

        {/* Colors */}
        <div className="flex items-center gap-1 mb-2">
          {item.colors.map((color, i) => (
            <span
              key={i}
              className="w-3 h-3 rounded-full border border-gray-200"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
          <span className="text-xs text-gray-400 line-through">₹{item.originalPrice.toLocaleString()}</span>
        </div>

        {/* Add to Cart */}
        <button
          onClick={() => item.inStock && onMoveToCart(item.id)}
          disabled={!item.inStock}
          className={`w-full py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors ${
            item.inStock
              ? 'bg-[#111111] text-white hover:bg-gray-800'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {item.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  )
}

export default function Wishlist() {
  const { wishlistItems: wishlist, wishlistLoading, removeItem, emptyWishlist, refreshWishlist } = useWishlist()
  const { addItem } = useCart()

  // Fetch fresh inStock status every time user visits this page
  useEffect(() => {
    refreshWishlist()
  }, [])

  const handleRemove = (id) => removeItem(id)

  const handleMoveToCart = async (itemId) => {
    const item = wishlist.find(i => i.id === itemId)
    if (!item) return
    await addItem({
      productId: item.productId || item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      size: item.sizes?.[0] || 'M',
      color: item.colors?.[0] || { name: 'Default', hex: '#111111' },
      quantity: 1,
    })
  }

  const handleClearAll = () => emptyWishlist()

  if (wishlistLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // ── Empty State ────────────────────────────────────────────
  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center text-center px-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-3">Your Wishlist is Empty</h1>
        <p className="text-gray-500 text-sm mb-8 max-w-xs">Save items you love and come back to them anytime.</p>
        <Link
          to="/shop"
          className="bg-[#111111] text-white text-sm font-bold uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-gray-800 transition-colors"
        >
          Explore Products
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* Page Header */}
      <div className="bg-[#111111] text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">CoolBros</p>
          <h1 className="text-4xl font-black" style={{ letterSpacing: '-0.03em' }}>My Wishlist</h1>
          <p className="text-gray-400 text-sm mt-2">{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{wishlist.filter(i => i.inStock).length}</span> of {wishlist.length} items in stock
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => wishlist.filter(i => i.inStock).forEach(i => handleMoveToCart(i.id))}
              className="text-sm font-semibold text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all"
            >
              Add All to Cart
            </button>
            <button
              onClick={handleClearAll}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors underline underline-offset-2"
            >
              Clear Wishlist
            </button>
          </div>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {wishlist.map(item => (
            <WishlistCard
              key={item.id}
              item={item}
              onRemove={handleRemove}
              onMoveToCart={handleMoveToCart}
            />
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-10 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
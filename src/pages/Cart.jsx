import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const VALID_COUPONS = {
  COOLBROS10: 10,
  COOLBROS20: 20,
  FIRST50: 50,
}

const SHIPPING_THRESHOLD = 999

export default function Cart() {
  const navigate = useNavigate()
  const { cartItems, cartLoading, updateQty, removeItem: removeFromCart } = useCart()
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')
  const [removingId, setRemovingId] = useState(null)

  // ── Cart Calculations ──────────────────────────────────────
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const originalTotal = cartItems.reduce((sum, item) => sum + (item.originalPrice || item.price) * item.quantity, 0)
  const savedOnMRP = originalTotal - subtotal
  const shippingFee = subtotal >= SHIPPING_THRESHOLD ? 0 : 99
  const discountAmount = appliedCoupon ? Math.round(subtotal * (appliedCoupon.percent / 100)) : 0
  const total = subtotal + shippingFee - discountAmount

  // ── Handlers ──────────────────────────────────────────────
  const updateQuantity = async (id, delta) => {
    const item = cartItems.find(i => i.id === id)
    if (!item) return
    const newQty = Math.min(10, Math.max(1, item.quantity + delta))
    await updateQty(id, newQty)
  }

  const removeItem = async (id) => {
    setRemovingId(id)
    await removeFromCart(id)
    setRemovingId(null)
  }

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase()
    if (!code) { setCouponError('Please enter a coupon code'); return }
    if (VALID_COUPONS[code]) {
      setAppliedCoupon({ code, percent: VALID_COUPONS[code] })
      setCouponSuccess(`Coupon "${code}" applied! You save ${VALID_COUPONS[code]}% on your order.`)
      setCouponError('')
    } else {
      setCouponError('Invalid coupon code. Please try again.')
      setCouponSuccess('')
      setAppliedCoupon(null)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponSuccess('')
    setCouponError('')
  }

  // ── Loading ───────────────────────────────────────────────
  if (cartLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // ── Empty Cart ─────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center text-center px-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-3">Your Cart is Empty</h1>
        <p className="text-gray-500 text-sm mb-8 max-w-xs">Looks like you haven't added anything yet. Start shopping and find something you love.</p>
        <Link
          to="/shop"
          className="bg-[#111111] text-white text-sm font-bold uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-gray-800 transition-colors"
        >
          Start Shopping
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
          <h1 className="text-4xl font-black" style={{ letterSpacing: '-0.03em' }}>
            Your Cart
          </h1>
          <p className="text-gray-400 text-sm mt-2">{cartItems.length} item{cartItems.length > 1 ? 's' : ''} in your cart</p>
        </div>
      </div>

      {/* Free Shipping Progress */}
      {subtotal < SHIPPING_THRESHOLD && (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600">
                Add <span className="font-bold text-gray-900">₹{(SHIPPING_THRESHOLD - subtotal).toLocaleString()}</span> more for free shipping
              </p>
              <p className="text-xs text-gray-400">{Math.round((subtotal / SHIPPING_THRESHOLD) * 100)}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-[#111111] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (subtotal / SHIPPING_THRESHOLD) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
      {subtotal >= SHIPPING_THRESHOLD && (
        <div className="bg-green-50 border-b border-green-100 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <p className="text-xs text-green-700 font-semibold text-center">You have unlocked free shipping on this order!</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left: Cart Items ──────────────────────────────── */}
          <div className="flex-1 flex flex-col gap-4">

            {/* Column Headers — Desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {cartItems.map(item => {
              const itemTotal = item.price * item.quantity
              const isRemoving = removingId === item.id

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl p-4 shadow-sm transition-all duration-300 ${isRemoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">

                    {/* Product Info */}
                    <div className="col-span-12 md:col-span-6 flex items-center gap-4">
                      <Link to={`/product/${item.productId}`} className="shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-24 object-cover rounded-lg bg-gray-100"
                        />
                      </Link>
                      <div className="flex flex-col gap-1 min-w-0">
                        <p className="text-[11px] text-gray-400 uppercase tracking-widest">{item.category}</p>
                        <Link to={`/product/${item.productId}`}>
                          <h3 className="text-sm font-bold text-gray-900 hover:text-gray-500 transition-colors line-clamp-2">{item.name}</h3>
                        </Link>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">Size: <span className="font-semibold text-gray-700">{item.size}</span></span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            Color:
                            <span
                              className="w-3 h-3 rounded-full border border-gray-200 inline-block"
                              style={{ backgroundColor: item.color.hex }}
                            />
                            <span className="font-semibold text-gray-700">{item.color.name}</span>
                          </span>
                        </div>
                        {/* Mobile Price */}
                        <p className="md:hidden text-sm font-bold text-gray-900 mt-1">₹{item.price.toLocaleString()}</p>
                        {/* Remove button — mobile */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="md:hidden text-xs text-red-400 hover:text-red-600 transition-colors text-left mt-1 w-fit"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Price — Desktop */}
                    <div className="hidden md:flex col-span-2 flex-col items-center">
                      <span className="text-sm font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
                      {item.originalPrice > item.price && (
                        <span className="text-xs text-gray-400 line-through">₹{item.originalPrice.toLocaleString()}</span>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-7 md:col-span-2 flex items-center justify-start md:justify-center">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors rounded-l-lg"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors rounded-r-lg"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        </button>
                      </div>
                    </div>

                    {/* Item Total + Remove — Desktop */}
                    <div className="hidden md:flex col-span-2 items-center justify-end gap-3">
                      <span className="text-sm font-bold text-gray-900">₹{itemTotal.toLocaleString()}</span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                        title="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" /></svg>
                      </button>
                    </div>

                    {/* Mobile: Item Total */}
                    <div className="col-span-5 md:hidden flex justify-end items-center">
                      <span className="text-sm font-bold text-gray-900">₹{itemTotal.toLocaleString()}</span>
                    </div>

                  </div>
                </div>
              )
            })}

            {/* Continue Shopping */}
            <Link
              to="/shop"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit mt-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
              Continue Shopping
            </Link>
          </div>

          {/* ── Right: Order Summary ──────────────────────────── */}
          <div className="lg:w-96 flex flex-col gap-4">

            {/* Coupon Code */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Coupon Code</h3>

              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-green-700">{appliedCoupon.code}</p>
                    <p className="text-xs text-green-600">{appliedCoupon.percent}% discount applied</p>
                  </div>
                  <button onClick={removeCoupon} className="text-green-400 hover:text-green-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponInput}
                    onChange={e => { setCouponInput(e.target.value); setCouponError('') }}
                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-900 transition-colors uppercase"
                  />
                  <button
                    onClick={applyCoupon}
                    className="bg-[#111111] text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    Apply
                  </button>
                </div>
              )}

              {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
              {couponSuccess && !appliedCoupon && <p className="text-xs text-green-600 mt-2">{couponSuccess}</p>}

              <p className="text-xs text-gray-400 mt-3">Try: COOLBROS10, COOLBROS20, FIRST50</p>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-5">Order Summary</h3>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString()}</span>
                </div>

                {savedOnMRP > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Saved on MRP</span>
                    <span className="font-semibold">-₹{savedOnMRP.toLocaleString()}</span>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span className="font-semibold">-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={`font-semibold ${shippingFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {shippingFee === 0 ? 'Free' : `₹${shippingFee}`}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-black text-gray-900 uppercase tracking-wide">Total</span>
                  <span className="font-black text-gray-900 text-lg">₹{total.toLocaleString()}</span>
                </div>

                {(savedOnMRP + discountAmount) > 0 && (
                  <div className="bg-green-50 rounded-lg px-3 py-2 text-center">
                    <p className="text-xs text-green-700 font-semibold">
                      You are saving ₹{(savedOnMRP + discountAmount).toLocaleString()} on this order
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-5 bg-[#111111] text-white text-sm font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Proceed to Checkout
              </button>

              {/* Secure checkout note */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                <p className="text-xs text-gray-400">Secure checkout powered by Razorpay</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
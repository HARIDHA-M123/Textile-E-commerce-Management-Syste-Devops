import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrder } from '../firebase/orders'
import { decrementStock } from '../firebase/products'
import { validateCoupon, markCouponUsed } from '../firebase/coupons'
import toast from 'react-hot-toast'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
]

const STEPS = ['Delivery', 'Payment', 'Confirmation']

// ─── Input Field Component ────────────────────────────────────
function InputField({ label, name, type = 'text', value, onChange, error, placeholder, required }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`border rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors ${
          error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-gray-900'
        }`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cartItems, emptyCart } = useCart()
  const [step, setStep] = useState(0)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [savedOrderId, setSavedOrderId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('razorpay') // 'razorpay' | 'cod'
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: user?.email || '', phone: '',
    address: '', apartment: '', city: '', state: '', pincode: '',
    saveAddress: false,
  })
  const [errors, setErrors] = useState({})

  // ── Order Calculations ─────────────────────────────────────
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const shippingFee = subtotal >= 999 ? 0 : 99
  const discount = couponDiscount
  const total = subtotal + shippingFee - discount

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')
    const result = await validateCoupon(couponCode.trim(), subtotal, user?.uid)
    setCouponLoading(false)
    if (!result.valid) {
      setCouponError(result.message)
      setAppliedCoupon(null)
      setCouponDiscount(0)
    } else {
      setAppliedCoupon(result.coupon)
      setCouponDiscount(result.discount)
      setCouponError('')
      toast.success(`Coupon applied! You save ₹${result.discount}`)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponDiscount(0)
    setCouponCode('')
    setCouponError('')
  }

  // ── Form Handling ──────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateDelivery = () => {
    const newErrors = {}
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email'
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^[6-9]\d{9}$/.test(form.phone)) newErrors.phone = 'Enter a valid 10-digit Indian mobile number'
    if (!form.address.trim()) newErrors.address = 'Address is required'
    if (!form.city.trim()) newErrors.city = 'City is required'
    if (!form.state) newErrors.state = 'State is required'
    if (!form.pincode.trim()) newErrors.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(form.pincode)) newErrors.pincode = 'Enter a valid 6-digit pincode'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleDeliveryNext = () => {
    if (validateDelivery()) setStep(1)
  }

  // ── Razorpay Payment ───────────────────────────────────────
  // NOTE: Replace 'YOUR_RAZORPAY_KEY' with real key from Razorpay dashboard
  // The client must create a Razorpay account at razorpay.com to get the key
  const handleRazorpayPayment = () => {
    setPaymentProcessing(true)

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: total * 100,
        currency: 'INR',
        name: 'CoolBros',
        description: `Order for ${cartItems.length} item(s)`,
        image: '',
        handler: async function (response) {
          try {
            // Save order to Firestore
            const orderId = await createOrder(user.uid, {
              items: cartItems,
              address: {
                name: `${form.firstName} ${form.lastName}`,
                phone: form.phone,
                email: form.email,
                line1: form.address,
                line2: form.apartment,
                city: form.city,
                state: form.state,
                pincode: form.pincode,
              },
              subtotal,
              shippingFee,
              discount,
              total,
              paymentId: response.razorpay_payment_id,
              paymentMethod: 'Razorpay',
            })
            setSavedOrderId(orderId)
            if (appliedCoupon) await markCouponUsed(appliedCoupon.id, user.uid)
            await decrementStock(cartItems)
            await emptyCart()
            setStep(2)
            setStep(2)
          } finally {
            setPaymentProcessing(false)
          }
        },
        prefill: {
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          contact: form.phone,
        },
        notes: {
          address: `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`,
        },
        theme: { color: '#111111' },
        modal: {
          ondismiss: () => setPaymentProcessing(false),
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    }
    script.onerror = () => {
      toast.error('Failed to load payment gateway. Please check your internet connection.')
      setPaymentProcessing(false)
    }
    document.body.appendChild(script)
  }

  // ── Cash on Delivery ───────────────────────────────────────
  const handleCODPayment = async () => {
    setPaymentProcessing(true)
    try {
      const orderId = await createOrder(user.uid, {
        items: cartItems,
        address: {
          name: `${form.firstName} ${form.lastName}`,
          phone: form.phone,
          email: form.email,
          line1: form.address,
          line2: form.apartment,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        subtotal,
        shippingFee,
        discount,
        total,
        paymentId: null,
        paymentMethod: 'Cash on Delivery',
      })
      setSavedOrderId(orderId)
      if (appliedCoupon) await markCouponUsed(appliedCoupon.id, user.uid)
      await decrementStock(cartItems)
      await emptyCart()
      setStep(2)
    } finally {
      setPaymentProcessing(false)
    }
  }

  // ── Handle Pay Button ──────────────────────────────────────
  const handlePay = () => {
    if (paymentMethod === 'cod') handleCODPayment()
    else handleRazorpayPayment()
  }
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < step ? 'bg-green-500 text-white'
              : i === step ? 'bg-[#111111] text-white'
              : 'bg-gray-200 text-gray-400'
            }`}>
              {i < step ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              ) : i + 1}
            </div>
            <span className={`text-[11px] mt-1 font-semibold ${i === step ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-16 sm:w-24 h-0.5 mb-4 mx-2 transition-all ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* Page Header */}
      <div className="bg-[#111111] text-white py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-1">CoolBros</p>
          <h1 className="text-3xl font-black" style={{ letterSpacing: '-0.03em' }}>Checkout</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <StepIndicator />

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left: Steps ───────────────────────────────────── */}
          <div className="flex-1">

            {/* STEP 0: Delivery Address */}
            {step === 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-base font-black text-gray-900 uppercase tracking-widest mb-6">Delivery Address</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="First Name" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} placeholder="Arjun" required />
                  <InputField label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} placeholder="Kumar" required />
                  <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="arjun@example.com" required />
                  <InputField label="Phone Number" name="phone" type="tel" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="9876543210" required />
                  <div className="sm:col-span-2">
                    <InputField label="Address Line 1" name="address" value={form.address} onChange={handleChange} error={errors.address} placeholder="House/Flat no, Street name" required />
                  </div>
                  <div className="sm:col-span-2">
                    <InputField label="Apartment, Suite, etc. (optional)" name="apartment" value={form.apartment} onChange={handleChange} placeholder="Apartment, suite, unit, building" />
                  </div>
                  <InputField label="City" name="city" value={form.city} onChange={handleChange} error={errors.city} placeholder="Chennai" required />
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      State <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      className={`border rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors bg-white ${
                        errors.state ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'
                      }`}
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
                  </div>
                  <InputField label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} error={errors.pincode} placeholder="600001" required />
                </div>

                <label className="flex items-center gap-2 mt-5 cursor-pointer">
                  <input type="checkbox" name="saveAddress" checked={form.saveAddress} onChange={handleChange} className="w-4 h-4 accent-black rounded" />
                  <span className="text-sm text-gray-600">Save this address for future orders</span>
                </label>

                <button
                  onClick={handleDeliveryNext}
                  className="w-full mt-6 bg-[#111111] text-white text-sm font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* STEP 1: Payment */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                {/* Delivery Summary */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Delivering to</p>
                      <p className="text-sm font-semibold text-gray-900">{form.firstName} {form.lastName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{form.address}{form.apartment ? `, ${form.apartment}` : ''}, {form.city}, {form.state} - {form.pincode}</p>
                      <p className="text-xs text-gray-500">{form.phone}</p>
                    </div>
                    <button onClick={() => setStep(0)} className="text-xs text-gray-400 underline hover:text-gray-900 transition-colors">Edit</button>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-base font-black text-gray-900 uppercase tracking-widest mb-6">Payment Method</h2>

                  {/* Razorpay Option */}
                  <div
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`border-2 rounded-xl p-4 mb-3 cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-[#111111] bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'razorpay' ? 'border-[#111111]' : 'border-gray-300'}`}>
                        {paymentMethod === 'razorpay' && <div className="w-2 h-2 rounded-full bg-[#111111]" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">Pay Online</p>
                        <p className="text-xs text-gray-500">UPI, Cards, Net Banking, Wallets via Razorpay</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {['UPI', 'VISA', 'MC'].map(m => (
                          <span key={m} className="text-[10px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{m}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cash on Delivery Option */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`border-2 rounded-xl p-4 mb-5 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#111111] bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'cod' ? 'border-[#111111]' : 'border-gray-300'}`}>
                        {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-[#111111]" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">Cash on Delivery</p>
                        <p className="text-xs text-gray-500">Pay with cash when your order arrives</p>
                      </div>
                      <svg className="w-6 h-6 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75" />
                      </svg>
                    </div>
                    {paymentMethod === 'cod' && (
                      <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mt-3">
                        COD orders may take 1-2 extra days to confirm. Please keep exact change ready at delivery.
                      </p>
                    )}
                  </div>



                  <button
                    onClick={handlePay}
                    disabled={paymentProcessing}
                    className={`w-full py-4 text-sm font-bold uppercase tracking-widest rounded-xl transition-all ${
                      paymentProcessing
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-[#111111] text-white hover:bg-gray-800'
                    }`}
                  >
                    {paymentProcessing
                      ? (paymentMethod === 'cod' ? 'Placing Order...' : 'Opening Payment Gateway...')
                      : paymentMethod === 'cod'
                        ? `Place Order · ₹${total.toLocaleString()} (COD)`
                        : `Pay ₹${total.toLocaleString()}`
                    }
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-3">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                    <p className="text-xs text-gray-400">256-bit SSL secured payment</p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Order Confirmation */}
            {step === 2 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Order Placed!</h2>
                <p className="text-gray-500 text-sm mb-1">Thank you, {form.firstName}. Your order has been confirmed.</p>
                <p className="text-gray-400 text-xs mb-6">A confirmation has been sent to <span className="font-semibold text-gray-700">{form.email}</span></p>

                <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Order ID</span>
                    <span className="font-bold text-gray-900">#CB{Date.now().toString().slice(-6)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Estimated Delivery</span>
                    <span className="font-bold text-gray-900">5-7 Business Days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Paid</span>
                    <span className="font-bold text-gray-900">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate('/orders')}
                    className="flex-1 border-2 border-gray-900 text-gray-900 text-sm font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-gray-900 hover:text-white transition-colors"
                  >
                    Track Order
                  </button>
                  <button
                    onClick={() => navigate('/shop')}
                    className="flex-1 bg-[#111111] text-white text-sm font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Order Summary ──────────────────────────── */}
          {step < 2 && (
            <div className="lg:w-80 shrink-0">
              <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">
                  Order Summary
                  <span className="ml-2 text-gray-400 font-normal normal-case tracking-normal text-xs">({cartItems.length} items)</span>
                </h3>

                {/* Items */}
                <div className="flex flex-col gap-3 mb-5">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img src={item.image} alt={item.name} className="w-14 h-16 object-cover rounded-lg bg-gray-100" />
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-[11px] text-gray-400">Size: {item.size} · {item.color.name}</p>
                      </div>
                      <span className="text-xs font-bold text-gray-900 shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 flex flex-col gap-2.5 text-sm">

                  {/* Coupon Input */}
                  {!appliedCoupon ? (
                    <div className="flex flex-col gap-1 mb-1">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Coupon code"
                          value={couponCode}
                          onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-gray-900 transition-colors"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponLoading}
                          className="bg-[#111111] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300"
                        >
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      </div>
                      {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-1">
                      <div>
                        <p className="text-xs font-bold text-green-700">{appliedCoupon.code}</p>
                        <p className="text-[11px] text-green-600">Coupon applied!</p>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-xs text-red-400 hover:text-red-600 font-semibold">Remove</button>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-semibold">₹{subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount {appliedCoupon && `(${appliedCoupon.code})`}</span>
                      <span className="font-semibold">-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span className={`font-semibold ${shippingFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {shippingFee === 0 ? 'Free' : `₹${shippingFee}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between">
                    <span className="font-black text-gray-900 uppercase tracking-wide">Total</span>
                    <span className="font-black text-gray-900 text-base">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
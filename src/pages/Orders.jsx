import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserOrders } from '../firebase/orders'

const STATUS_STYLES = {
  Confirmed:  { dot: 'bg-purple-500', text: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  Delivered:  { dot: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' },
  Shipped:    { dot: 'bg-blue-500',   text: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  Processing: { dot: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  Cancelled:  { dot: 'bg-red-400',    text: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200' },
}

const TRACKING_STEPS = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered']

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Processing
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${s.text} ${s.bg} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  )
}

function TrackingBar({ status }) {
  const currentStep = {
    Processing: 1, Shipped: 2, 'Out for Delivery': 3, Delivered: 4
  }[status] ?? 0

  return (
    <div className="flex items-center gap-0 w-full">
      {TRACKING_STEPS.map((step, i) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
              i <= currentStep ? 'bg-[#111111]' : 'bg-gray-200'
            }`}>
              {i < currentStep ? (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className={`text-[9px] font-bold ${i <= currentStep ? 'text-white' : 'text-gray-400'}`}>{i + 1}</span>
              )}
            </div>
            <span className={`text-[9px] font-medium mt-1 text-center leading-tight max-w-12 ${i <= currentStep ? 'text-gray-900' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>
          {i < TRACKING_STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mb-4 mx-1 ${i < currentStep ? 'bg-[#111111]' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">

      {/* Order Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Order ID</p>
            <p className="text-sm font-black text-gray-900">#{order.id}</p>
          </div>
          <div className="hidden sm:block w-px h-8 bg-gray-200" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Placed on</p>
            <p className="text-sm font-semibold text-gray-700">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : order.date || 'N/A'}</p>
          </div>
          <div className="hidden sm:block w-px h-8 bg-gray-200" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Payment</p>
            <p className="text-sm font-semibold text-gray-700">{order.paymentMethod}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <p className="text-base font-black text-gray-900">₹{order.total.toLocaleString()}</p>
        </div>
      </div>

      {/* Order Items Preview */}
      <div className="p-5">
        <div className="flex items-center gap-3 flex-wrap">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2 flex-1 min-w-48">
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-14 object-cover rounded-lg bg-gray-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                <p className="text-[11px] text-gray-400">Size: {item.size} · {typeof item.color === 'object' ? item.color?.name : item.color}</p>
                <p className="text-[11px] text-gray-400">Qty: {item.quantity ?? item.qty} · ₹{item.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Expand / Collapse */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors mt-4"
        >
          {expanded ? 'Hide Details' : 'View Details'}
          <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 flex flex-col gap-5">

          {/* Tracking */}
          {order.status !== 'Cancelled' && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Order Tracking</p>
              <TrackingBar status={order.status} />
              {order.tracking && (
                <p className="text-xs text-gray-400 mt-3">
                  Tracking ID: <span className="font-semibold text-gray-700">{order.tracking}</span>
                </p>
              )}
            </div>
          )}

          {/* Delivery Address */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Delivery Address</p>
            <p className="text-sm text-gray-600">{typeof order.address === 'object' ? `${order.address?.line1}, ${order.address?.city}, ${order.address?.state} - ${order.address?.pincode}` : order.address}</p>
          </div>

          {/* Price Breakdown */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Price Details</p>
            <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal ({order.items.reduce((s, i) => s + (i.quantity ?? i.qty ?? 1), 0)} items)</span>
                <span className="font-semibold text-gray-900">₹{order.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Shipping</span>
                <span className="font-semibold">Free</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-gray-900">
                <span>Total</span>
                <span>₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {order.status === 'Delivered' && (
              <>
                <Link
                  to={`/product/${order.items[0].id}`}
                  className="text-xs font-bold uppercase tracking-widest border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all"
                >
                  Buy Again
                </Link>
                <button className="text-xs font-bold uppercase tracking-widest border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all">
                  Write a Review
                </button>
              </>
            )}
            {(order.status === 'Processing' || order.status === 'Shipped') && (
              <button className="text-xs font-bold uppercase tracking-widest border border-red-200 text-red-500 px-4 py-2.5 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
                Cancel Order
              </button>
            )}
            {order.status === 'Delivered' && (
              <button className="text-xs font-bold uppercase tracking-widest border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all">
                Return / Exchange
              </button>
            )}
            <button className="text-xs font-bold uppercase tracking-widest border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all">
              Download Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('All')
  const filters = ['All', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

  useEffect(() => {
    if (!user) return
    setLoading(true)
    setError(null)
    getUserOrders(user.uid)
      .then(data => setOrders(data))
      .catch(err => {
        console.error('Failed to load orders:', err)
        setError('Failed to load orders. Please refresh the page.')
      })
      .finally(() => setLoading(false))
  }, [user])

  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center text-center px-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <p className="text-red-500 font-semibold mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-[#111111] text-white text-sm font-bold uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors">
          Retry
        </button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center text-center px-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-3">No Orders Yet</h1>
        <p className="text-gray-500 text-sm mb-8 max-w-xs">You haven't placed any orders yet. Start shopping to see your orders here.</p>
        <Link to="/shop" className="bg-[#111111] text-white text-sm font-bold uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-gray-800 transition-colors">
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* Page Header */}
      <div className="bg-[#111111] text-white py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">CoolBros</p>
          <h1 className="text-4xl font-black" style={{ letterSpacing: '-0.03em' }}>My Orders</h1>
          <p className="text-gray-400 text-sm mt-2">{orders.length} order{orders.length > 1 ? 's' : ''} placed</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border transition-all ${
                filter === f
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-900 hover:text-gray-900'
              }`}
            >
              {f}
              {f !== 'All' && (
                <span className="ml-1.5 text-[10px]">
                  ({orders.filter(o => o.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <p className="text-gray-400 text-sm">No {filter.toLowerCase()} orders found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
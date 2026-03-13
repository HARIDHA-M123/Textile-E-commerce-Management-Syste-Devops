import { useState, useEffect } from 'react'
import { getAllOrders, updateOrderStatus } from '../../firebase/orders'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

const STATUS_STYLES = {
  Confirmed:  { text: 'text-purple-700', bg: 'bg-purple-50' },
  Processing: { text: 'text-yellow-700', bg: 'bg-yellow-50' },
  Shipped:    { text: 'text-blue-700',   bg: 'bg-blue-50' },
  Delivered:  { text: 'text-green-700',  bg: 'bg-green-50' },
  Cancelled:  { text: 'text-red-600',    bg: 'bg-red-50' },
}

const getStyle = (status) => STATUS_STYLES[status] ?? { text: 'text-gray-600', bg: 'bg-gray-100' }

// ─── Order Detail Modal ───────────────────────────────────────
function OrderDetailModal({ order, onClose, onStatusChange, updatingId }) {
  const s = getStyle(order.status)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-black text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{order.createdAt?.toDate?.().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) || '—'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Status</span>
            <select
              value={order.status}
              onChange={e => onStatusChange(order.id, e.target.value)}
              disabled={updatingId === order.id}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer disabled:opacity-50 ${s.text} ${s.bg}`}
            >
              {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {/* Shipping Address */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">📦 Ship To</p>
            <p className="text-sm font-bold text-gray-900">{order.address?.name || '—'}</p>
            <p className="text-sm text-gray-600 mt-1">{order.address?.phone || '—'}</p>
            <p className="text-sm text-gray-600">{order.address?.email || '—'}</p>
            <p className="text-sm text-gray-600 mt-2">
              {[order.address?.line1, order.address?.line2, order.address?.city, order.address?.state, order.address?.pincode]
                .filter(Boolean).join(', ')}
            </p>
          </div>

          {/* Order Items */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">🛍 Items Ordered</p>
            <div className="flex flex-col gap-3">
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-14 object-cover rounded-lg bg-gray-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Size: {item.size} · Color: {item.color?.name || item.color || '—'} · Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-xs font-bold text-gray-900 shrink-0">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">💳 Payment</p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="text-gray-900">₹{order.subtotal?.toLocaleString() || '—'}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span className={order.shippingFee === 0 ? 'text-green-600' : 'text-gray-900'}>
                  {order.shippingFee === 0 ? 'Free' : `₹${order.shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between font-black text-gray-900 border-t border-gray-200 pt-2 mt-1">
                <span>Total</span>
                <span>₹{order.total?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500 mt-1">
                <span>Payment Method</span>
                <span className="font-semibold text-gray-900">{order.paymentMethod || '—'}</span>
              </div>
              {order.paymentId && (
                <div className="flex justify-between text-gray-500">
                  <span>Payment ID</span>
                  <span className="font-mono text-[11px] text-gray-700">{order.paymentId}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [updatingId, setUpdatingId] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await getAllOrders()
      setOrders(data)
    } catch (err) {
      console.error('Error fetching orders:', err)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      toast.success(`Order marked as ${newStatus}`)
    } catch (err) {
      console.error('Error updating status:', err)
      toast.error('Failed to update order status')
    } finally {
      setUpdatingId(null)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return '—'
    if (timestamp?.toDate) return timestamp.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    return '—'
  }

  const filtered = orders.filter(o => {
    const customerName = o.address?.name || ''
    const matchSearch =
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'All' || o.status === filterStatus
    return matchSearch && matchStatus
  })

  const statusCounts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div>
        <h1 className="text-2xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>Orders</h1>
        <p className="text-sm text-gray-500 mt-1">{loading ? '...' : `${orders.length} total orders`}</p>
      </div>

      {/* Status Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATUS_OPTIONS.map(s => {
          const st = getStyle(s)
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? 'All' : s)}
              className={`bg-white rounded-xl p-4 shadow-sm text-left border-2 transition-all ${filterStatus === s ? 'border-gray-900' : 'border-transparent hover:border-gray-200'}`}
            >
              {loading
                ? <div className="h-8 w-10 bg-gray-200 rounded animate-pulse mb-1" />
                : <p className="text-2xl font-black text-gray-900">{statusCounts[s] || 0}</p>
              }
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${st.text} ${st.bg}`}>{s}</span>
            </button>
          )
        })}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-900 transition-colors"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gray-900 cursor-pointer"
        >
          {['All', ...STATUS_OPTIONS].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Order ID', 'Customer', 'Total', 'Payment', 'Date', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.map(order => {
                const s = getStyle(order.status)
                const isUpdating = updatingId === order.id
                return (
                  <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-bold text-gray-900 text-xs">
                      #{order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-900 text-xs">{order.address?.name || '—'}</p>
                      <p className="text-[11px] text-gray-400">{order.address?.email || order.userEmail || '—'}</p>
                    </td>
                    <td className="px-5 py-3 font-bold text-gray-900 text-xs">₹{order.total?.toLocaleString()}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{order.paymentMethod || '—'}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-3">
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        disabled={isUpdating}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer disabled:opacity-50 ${s.text} ${s.bg}`}
                      >
                        {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-xs font-bold text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-900 px-3 py-1.5 rounded-lg transition-all"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(id, status) => {
            handleStatusChange(id, status)
            setSelectedOrder(prev => prev ? { ...prev, status } : null)
          }}
          updatingId={updatingId}
        />
      )}
    </div>
  )
}
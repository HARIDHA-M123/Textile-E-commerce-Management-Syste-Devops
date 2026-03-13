import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllOrders } from '../../firebase/orders'
import { getDocs, collection } from 'firebase/firestore'
import { db } from '../../firebase/config'

const STATUS_STYLES = {
  Confirmed:  { text: 'text-purple-700', bg: 'bg-purple-50' },
  Processing: { text: 'text-yellow-700', bg: 'bg-yellow-50' },
  Shipped:    { text: 'text-blue-700',   bg: 'bg-blue-50' },
  Delivered:  { text: 'text-green-700',  bg: 'bg-green-50' },
  Cancelled:  { text: 'text-red-600',    bg: 'bg-red-50' },
}
const getStyle = (status) => STATUS_STYLES[status] ?? { text: 'text-gray-600', bg: 'bg-gray-100' }

function StatCard({ label, value, icon, loading }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mb-1" />
      ) : (
        <p className="text-2xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>{value}</p>
      )}
      <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [userCount, setUserCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, usersSnap] = await Promise.all([
          getAllOrders(),
          getDocs(collection(db, 'users'))
        ])
        setOrders(ordersData)
        setUserCount(usersSnap.size)
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0)

  const pendingOrders = orders.filter(o =>
    o.status === 'Confirmed' || o.status === 'Processing'
  ).length

  const recentOrders = orders.slice(0, 5)

  // Calculate top products from real order data
  const productMap = {}
  orders.forEach(order => {
    if (order.status === 'Cancelled') return
    ;(order.items || []).forEach(item => {
      const key = item.name || item.productId
      if (!key) return
      if (!productMap[key]) {
        productMap[key] = { name: key, sold: 0, revenue: 0, image: item.image || '' }
      }
      const qty = item.quantity ?? item.qty ?? 1
      productMap[key].sold += qty
      productMap[key].revenue += (item.price || 0) * qty
    })
  })
  const topProducts = Object.values(productMap)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 4)

  const STATS = [
    {
      label: 'Total Revenue',
      value: loading ? '—' : `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h1.5m-1.5 0h-1.5m-9 0H4.5m1.5 0H4.5" /></svg>,
    },
    {
      label: 'Total Orders',
      value: loading ? '—' : orders.length.toLocaleString(),
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" /></svg>,
    },
    {
      label: 'Total Users',
      value: loading ? '—' : userCount.toLocaleString(),
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>,
    },
    {
      label: 'Pending Orders',
      value: loading ? '—' : pendingOrders.toLocaleString(),
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back. Here is what is happening today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(stat => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} loading={loading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-gray-400 hover:text-gray-900 underline underline-offset-2 transition-colors">View All</Link>
          </div>
          {loading ? (
            <div className="p-5 flex flex-col gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="px-5 py-10 text-sm text-gray-400 text-center">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => {
                    const s = getStyle(order.status)
                    const date = order.createdAt?.toDate
                      ? order.createdAt.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'
                    const customerName = order.address?.name || '—'
                    return (
                      <tr key={order.id} className={`border-t border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                        <td className="px-5 py-3 font-bold text-gray-900 text-xs">#{order.id.slice(-6).toUpperCase()}</td>
                        <td className="px-5 py-3 text-gray-700 text-xs">{customerName}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{order.items?.length ?? 0}</td>
                        <td className="px-5 py-3 font-semibold text-gray-900 text-xs">₹{order.total?.toLocaleString()}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.text} ${s.bg}`}>{order.status}</span>
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs">{date}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Top Products</h2>
            <Link to="/admin/products" className="text-xs text-gray-400 hover:text-gray-900 underline underline-offset-2 transition-colors">View All</Link>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)
            ) : topProducts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No sales data yet.</p>
            ) : (
              topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-xs font-black text-gray-300 w-4">{i + 1}</span>
                  {p.image
                    ? <img src={p.image} alt={p.name} className="w-10 h-12 object-cover rounded-lg bg-gray-100 shrink-0" />
                    : <div className="w-10 h-12 rounded-lg bg-gray-100 shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                    <p className="text-[11px] text-gray-400">{p.sold} sold</p>
                  </div>
                  <p className="text-xs font-bold text-gray-900">₹{(p.revenue / 1000).toFixed(0)}K</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Add Product', path: '/admin/products', color: 'bg-[#111111] text-white' },
          { label: 'Manage Orders', path: '/admin/orders', color: 'bg-white text-gray-900 border border-gray-200' },
          { label: 'View Users', path: '/admin/users', color: 'bg-white text-gray-900 border border-gray-200' },
          { label: 'Add Coupon', path: '/admin/coupons', color: 'bg-white text-gray-900 border border-gray-200' },
        ].map(action => (
          <Link
            key={action.label}
            to={action.path}
            className={`${action.color} text-xs font-bold uppercase tracking-widest px-4 py-3.5 rounded-xl text-center hover:opacity-80 transition-opacity shadow-sm`}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
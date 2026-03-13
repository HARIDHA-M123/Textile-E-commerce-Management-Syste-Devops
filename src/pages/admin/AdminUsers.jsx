import { useState, useEffect } from 'react'
import { getDocs, collection, updateDoc, doc, query, where } from 'firebase/firestore'
import { db } from '../../firebase/config'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const [usersSnapshot, ordersSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'orders'))
      ])
      const allOrders = ordersSnapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      const data = usersSnapshot.docs.map(d => {
        const user = { id: d.id, ...d.data() }
        const userOrders = allOrders.filter(o => o.uid === user.id && o.status !== 'Cancelled')
        return {
          ...user,
          orderCount: userOrders.length,
          totalSpent: userOrders.reduce((sum, o) => sum + (o.total || 0), 0)
        }
      })
      setUsers(data)
    } catch (err) {
      console.error('Error fetching users:', err)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const toggleBlock = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'Blocked' ? 'Active' : 'Blocked'
    try {
      await updateDoc(doc(db, 'users', userId), { status: newStatus })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u))
      toast.success(`User ${newStatus === 'Blocked' ? 'blocked' : 'unblocked'} successfully`)
    } catch (err) {
      console.error('Error updating user status:', err)
      toast.error('Failed to update user status')
    }
  }

  const filtered = users.filter(u =>
    (u.name || u.displayName || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = users.filter(u => u.status !== 'Blocked').length
  const blockedCount = users.filter(u => u.status === 'Blocked').length
  const totalOrders = users.reduce((s, u) => s + (u.orderCount || 0), 0)
  const avgOrders = users.length > 0 ? (totalOrders / users.length).toFixed(1) : '0'

  const getInitials = (user) => {
    const name = user.name || user.displayName || user.email || '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return '—'
    if (timestamp?.toDate) return timestamp.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    return '—'
  }

  return (
    <div className="flex flex-col gap-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div>
        <h1 className="text-2xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>Users</h1>
        <p className="text-sm text-gray-500 mt-1">{loading ? '...' : `${users.length} registered users`}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: loading ? '—' : users.length },
          { label: 'Active', value: loading ? '—' : activeCount },
          { label: 'Blocked', value: loading ? '—' : blockedCount },
          { label: 'Avg. Orders', value: loading ? '—' : avgOrders },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm">
            {loading
              ? <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-1" />
              : <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            }
            <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-900 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['User', 'Phone', 'Orders', 'Total Spent', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.map(user => {
                const status = user.status || 'Active'
                const name = user.name || user.displayName || '—'
                return (
                  <tr key={user.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                          {user.photoURL
                            ? <img src={user.photoURL} alt={name} className="w-8 h-8 rounded-full object-cover" />
                            : <span className="text-xs font-black text-gray-600">{getInitials(user)}</span>
                          }
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-xs">{name}</p>
                          <p className="text-[11px] text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{user.phone || '—'}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900 text-xs">{user.orderCount || 0}</td>
                    <td className="px-5 py-3 font-bold text-gray-900 text-xs">₹{(user.totalSpent || 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status === 'Active' ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {user.role === 'admin' ? (
                        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">Admin</span>
                      ) : (
                        <button
                          onClick={() => toggleBlock(user.id, status)}
                          className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${
                            status === 'Blocked'
                              ? 'border-green-200 text-green-600 hover:bg-green-500 hover:text-white hover:border-green-500'
                              : 'border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500'
                          }`}
                        >
                          {status === 'Blocked' ? 'Unblock' : 'Block'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
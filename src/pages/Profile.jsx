import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { logOut } from '../firebase/auth'
import { doc, updateDoc, getDocs, collection, query, where } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { db, auth } from '../firebase/config'
import toast from 'react-hot-toast'

const QUICK_LINKS = [
  { label: 'My Orders', path: '/orders', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" /></svg>
  )},
  { label: 'My Wishlist', path: '/wishlist', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
  )},
  { label: 'My Cart', path: '/cart', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>
  )},
  { label: 'Contact Us', path: '/contact', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
  )},
]

// ─── Edit Profile Modal ───────────────────────────────────────
function EditProfileModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({ firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!form.firstName.trim()) newErrors.firstName = 'Required'
    if (!form.lastName.trim()) newErrors.lastName = 'Required'
    if (!form.phone.trim()) newErrors.phone = 'Required'
    else if (!/^[6-9]\d{9}$/.test(form.phone)) newErrors.phone = 'Enter a valid 10-digit number'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-black text-gray-900 uppercase tracking-widest">Edit Profile</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {[['firstName', 'First Name'], ['lastName', 'Last Name']].map(([name, label]) => (
              <div key={name} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
                <input
                  type="text" name={name} value={form[name]} onChange={handleChange}
                  className={`border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors ${errors[name] ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}`}
                />
                {errors[name] && <p className="text-xs text-red-500">{errors[name]}</p>}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</label>
            <input type="email" value={user.email} disabled className="border border-gray-100 rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
            <p className="text-xs text-gray-400">Email cannot be changed here</p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Phone</label>
            <input
              type="tel" name="phone" value={form.phone} onChange={handleChange}
              className={`border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors ${errors.phone ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}`}
            />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
          </div>
          <div className="flex gap-3 mt-2">
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 text-sm font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#111111] text-white text-sm font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Address Card ─────────────────────────────────────────────
function AddressCard({ address, onDelete, onSetDefault }) {
  return (
    <div className={`bg-white rounded-xl p-4 border-2 transition-all ${address.isDefault ? 'border-[#111111]' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{address.label}</span>
          {address.isDefault && (
            <span className="text-xs font-bold uppercase tracking-widest bg-[#111111] text-white px-2 py-0.5 rounded">Default</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!address.isDefault && (
            <button onClick={() => onSetDefault(address.id)} className="text-xs text-gray-400 hover:text-gray-900 underline underline-offset-2 transition-colors">Set Default</button>
          )}
          <button onClick={() => onDelete(address.id)} className="text-gray-300 hover:text-red-500 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
          </button>
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-900">{address.name}</p>
      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
        {address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} - {address.pincode}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{address.phone}</p>
    </div>
  )
}

// ─── Main Profile Page ────────────────────────────────────────
export default function Profile() {
  const { user: authUser, userData, setUserData } = useAuth()
  const { wishlistItems } = useWishlist()

  const [profileData, setProfileData] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [orderCount, setOrderCount] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (authUser) fetchProfileData()
  }, [authUser])

  const fetchProfileData = async () => {
    try {
      setLoading(true)

      // Fetch user's orders to calculate stats
      const ordersSnap = await getDocs(
        query(collection(db, 'orders'), where('uid', '==', authUser.uid))
      )
      const orders = ordersSnap.docs.map(d => d.data())
      const activeOrders = orders.filter(o => o.status !== 'Cancelled')

      setOrderCount(activeOrders.length)
      setTotalSpent(activeOrders.reduce((sum, o) => sum + (o.total || 0), 0))

      // Build addresses from last 3 unique orders
      const seen = new Set()
      const savedAddresses = []
      orders
        .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
        .forEach((o, i) => {
          if (!o.address) return
          const key = `${o.address.line1}-${o.address.pincode}`
          if (!seen.has(key)) {
            seen.add(key)
            savedAddresses.push({
              id: key,
              label: savedAddresses.length === 0 ? 'Recent' : `Address ${savedAddresses.length + 1}`,
              name: o.address.name,
              line1: o.address.line1,
              line2: o.address.line2 || '',
              city: o.address.city,
              state: o.address.state,
              pincode: o.address.pincode,
              phone: o.address.phone,
              isDefault: savedAddresses.length === 0,
            })
          }
        })
      setAddresses(savedAddresses)

      // Build profile from userData + authUser
      setProfileData({
        firstName: userData?.firstName || authUser.displayName?.split(' ')[0] || '',
        lastName: userData?.lastName || authUser.displayName?.split(' ').slice(1).join(' ') || '',
        email: authUser.email || '',
        phone: userData?.phone || '',
        photoURL: authUser.photoURL || null,
        joinedDate: authUser.metadata?.creationTime
          ? new Date(authUser.metadata.creationTime).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
          : '—',
      })
    } catch (err) {
      console.error('Error loading profile:', err)
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (updated) => {
    try {
      // Update Firestore
      await updateDoc(doc(db, 'users', authUser.uid), {
        firstName: updated.firstName,
        lastName: updated.lastName,
        phone: updated.phone,
        displayName: `${updated.firstName} ${updated.lastName}`,
      })
      // Update Firebase Auth display name
      await updateProfile(auth.currentUser, {
        displayName: `${updated.firstName} ${updated.lastName}`
      })
      setProfileData(prev => ({ ...prev, ...updated }))
      setEditOpen(false)
      toast.success('Profile updated!')
    } catch (err) {
      console.error('Error updating profile:', err)
      toast.error('Failed to update profile')
    }
  }

  const handleDeleteAddress = (id) => {
    setAddresses(prev => prev.filter(a => a.id !== id))
  }

  const handleSetDefault = (id) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })))
  }

  const handleSignOut = async () => {
    try {
      await logOut()
      toast.success('Signed out successfully')
    } catch (err) {
      toast.error('Failed to sign out')
    }
  }

  if (loading || !profileData) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  const initials = `${profileData.firstName?.[0] || ''}${profileData.lastName?.[0] || ''}`.toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* Page Header */}
      <div className="bg-[#111111] text-white py-10 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
            {profileData.photoURL
              ? <img src={profileData.photoURL} alt={profileData.firstName} className="w-full h-full object-cover" />
              : <span className="text-xl font-black text-white">{initials}</span>
            }
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-1">My Account</p>
            <h1 className="text-3xl font-black leading-tight" style={{ letterSpacing: '-0.02em' }}>
              {profileData.firstName} {profileData.lastName}
            </h1>
            <p className="text-gray-400 text-sm mt-1">{profileData.email} · Member since {profileData.joinedDate}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: orderCount },
            { label: 'Total Spent', value: `₹${totalSpent.toLocaleString('en-IN')}` },
            { label: 'Wishlist Items', value: wishlistItems.length },
            { label: 'Saved Addresses', value: addresses.length },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl p-4 text-center shadow-sm">
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {QUICK_LINKS.map(link => (
            <Link
              key={link.label}
              to={link.path}
              className="bg-white rounded-xl p-4 flex flex-col items-center text-center gap-2 shadow-sm hover:shadow-md hover:border-gray-900 border-2 border-transparent transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-gray-900 group-hover:text-white transition-all">
                {link.icon}
              </div>
              <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">{link.label}</p>
            </Link>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-6 w-fit">
          {[['profile', 'Profile Info'], ['addresses', 'Saved Addresses']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-lg transition-all ${
                activeTab === key ? 'bg-[#111111] text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab: Profile Info */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Personal Information</h2>
              <button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-900 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>
                Edit
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: 'First Name', value: profileData.firstName },
                { label: 'Last Name', value: profileData.lastName },
                { label: 'Email Address', value: profileData.email },
                { label: 'Phone Number', value: profileData.phone || '—' },
                { label: 'Member Since', value: profileData.joinedDate },
                { label: 'Account Status', value: 'Active' },
              ].map(field => (
                <div key={field.label}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{field.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{field.value}</p>
                </div>
              ))}
            </div>

            {/* Account Actions */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Account Actions</p>
              <div className="flex flex-wrap gap-3">
                <Link to="/forgot-password" className="text-xs font-bold uppercase tracking-widest border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all">
                  Change Password
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-xs font-bold uppercase tracking-widest border border-red-200 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Saved Addresses */}
        {activeTab === 'addresses' && (
          <div className="flex flex-col gap-4">
            {addresses.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <p className="text-gray-400 text-sm mb-4">No saved addresses yet.</p>
                <Link to="/checkout" className="text-sm font-bold text-gray-900 underline underline-offset-2">
                  Add an address at checkout
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map(address => (
                    <AddressCard
                      key={address.id}
                      address={address}
                      onDelete={handleDeleteAddress}
                      onSetDefault={handleSetDefault}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">
                  Addresses are saved automatically when you place an order.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {editOpen && (
        <EditProfileModal
          user={profileData}
          onClose={() => setEditOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  )
}
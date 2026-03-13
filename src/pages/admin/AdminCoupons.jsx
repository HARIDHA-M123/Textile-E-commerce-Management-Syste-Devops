import { useState, useEffect } from 'react'
import { getAllCoupons, addCoupon, updateCoupon, deleteCoupon, toggleCouponStatus } from '../../firebase/coupons'
import toast from 'react-hot-toast'

const EMPTY_COUPON = { code: '', type: 'Percentage', value: '', minOrder: '', maxUses: '', expiry: '', status: 'Active' }

function CouponModal({ coupon, onClose, onSave }) {
  const [form, setForm] = useState(coupon
    ? { code: coupon.code, type: coupon.type, value: coupon.value, minOrder: coupon.minOrder, maxUses: coupon.maxUses, expiry: coupon.expiry, status: coupon.status }
    : EMPTY_COUPON
  )
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.code.trim()) e.code = 'Required'
    if (!form.value || isNaN(form.value) || Number(form.value) <= 0) e.value = 'Enter a valid value'
    if (form.type === 'Percentage' && Number(form.value) > 100) e.value = 'Cannot exceed 100%'
    if (!form.maxUses || isNaN(form.maxUses)) e.maxUses = 'Required'
    if (!form.expiry.trim()) e.expiry = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    const data = {
      ...form,
      code: form.code.toUpperCase(),
      value: Number(form.value),
      minOrder: Number(form.minOrder || 0),
      maxUses: Number(form.maxUses),
    }
    await onSave(data)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-black text-gray-900 uppercase tracking-widest">
            {coupon ? 'Edit Coupon' : 'Add Coupon'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Coupon Code</label>
            <input
              type="text" name="code" value={form.code}
              onChange={e => handleChange({ target: { name: 'code', value: e.target.value.toUpperCase() } })}
              placeholder="e.g. SAVE20"
              className={`border rounded-lg px-3 py-2.5 text-sm uppercase font-bold outline-none transition-colors ${errors.code ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}`}
            />
            {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Type</label>
              <select name="type" value={form.type} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-900 bg-white">
                <option>Percentage</option>
                <option>Fixed</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {form.type === 'Percentage' ? 'Discount %' : 'Discount ₹'}
              </label>
              <input
                type="number" name="value" value={form.value} onChange={handleChange}
                className={`border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors ${errors.value ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}`}
              />
              {errors.value && <p className="text-xs text-red-500">{errors.value}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Min. Order ₹</label>
              <input
                type="number" name="minOrder" value={form.minOrder} onChange={handleChange} placeholder="0"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-900"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Max Uses</label>
              <input
                type="number" name="maxUses" value={form.maxUses} onChange={handleChange}
                className={`border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors ${errors.maxUses ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}`}
              />
              {errors.maxUses && <p className="text-xs text-red-500">{errors.maxUses}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Expiry Date</label>
              <input
                type="date" name="expiry" value={form.expiry} onChange={handleChange}
                className={`border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors ${errors.expiry ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}`}
              />
              {errors.expiry && <p className="text-xs text-red-500">{errors.expiry}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-900 bg-white">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 text-sm font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#111111] text-white text-sm font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : coupon ? 'Save' : 'Add Coupon'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editCoupon, setEditCoupon] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const data = await getAllCoupons()
      setCoupons(data)
    } catch (err) {
      console.error('Error fetching coupons:', err)
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data) => {
    try {
      if (editCoupon) {
        await updateCoupon(editCoupon.id, data)
        setCoupons(prev => prev.map(c => c.id === editCoupon.id ? { ...c, ...data } : c))
        toast.success('Coupon updated!')
      } else {
        const newId = await addCoupon(data)
        setCoupons(prev => [...prev, { ...data, id: newId, uses: 0 }])
        toast.success('Coupon added!')
      }
      setModalOpen(false)
      setEditCoupon(null)
    } catch (err) {
      console.error('Error saving coupon:', err)
      toast.error('Failed to save coupon')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteCoupon(id)
      setCoupons(prev => prev.filter(c => c.id !== id))
      toast.success('Coupon deleted')
      setDeleteId(null)
    } catch (err) {
      console.error('Error deleting coupon:', err)
      toast.error('Failed to delete coupon')
    }
  }

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = await toggleCouponStatus(id, currentStatus)
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
      toast.success(`Coupon ${newStatus === 'Active' ? 'activated' : 'deactivated'}`)
    } catch (err) {
      console.error('Error toggling coupon status:', err)
      toast.error('Failed to update coupon')
    }
  }

  return (
    <div className="flex flex-col gap-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">{loading ? '...' : `${coupons.length} coupons created`}</p>
        </div>
        <button
          onClick={() => { setEditCoupon(null); setModalOpen(true) }}
          className="bg-[#111111] text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Coupon
        </button>
      </div>

      {/* Coupon Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5 h-48 animate-pulse" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-400 text-sm">No coupons yet. Add your first coupon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coupons.map(coupon => (
            <div key={coupon.id} className="bg-white rounded-xl shadow-sm p-5 border-2 border-dashed border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${coupon.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {coupon.status}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditCoupon(coupon); setModalOpen(true) }} className="text-gray-300 hover:text-gray-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                    </svg>
                  </button>
                  <button onClick={() => setDeleteId(coupon.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>

              <p className="text-xl font-black text-gray-900 tracking-widest mb-1">{coupon.code}</p>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                {coupon.type === 'Percentage' ? `${coupon.value}% off` : `₹${coupon.value} off`}
                {coupon.minOrder > 0 && <span className="text-xs text-gray-400"> · Min ₹{coupon.minOrder}</span>}
              </p>

              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{coupon.uses || 0} used</span>
                  <span>{coupon.maxUses} max</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-[#111111] h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, ((coupon.uses || 0) / coupon.maxUses) * 100)}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-gray-400 mt-2">Expires: {coupon.expiry}</p>

              <button
                onClick={() => handleToggleStatus(coupon.id, coupon.status)}
                className="mt-3 w-full text-xs font-bold uppercase tracking-widest border border-gray-200 py-2 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all text-gray-600"
              >
                {coupon.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <CouponModal
          coupon={editCoupon}
          onClose={() => { setModalOpen(false); setEditCoupon(null) }}
          onSave={handleSave}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <h3 className="text-base font-black text-gray-900 mb-2">Delete Coupon?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 text-gray-700 text-sm font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500 text-white text-sm font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
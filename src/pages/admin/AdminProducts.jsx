import { useState, useEffect } from 'react'
import { getAllProducts, addProduct, updateProduct, deleteProduct } from '../../firebase/products'
import { uploadMultipleImages } from '../../firebase/cloudinary'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
  'Active':       { text: 'text-green-700', bg: 'bg-green-50' },
  'Out of Stock': { text: 'text-red-600',   bg: 'bg-red-50' },
  'Low Stock':    { text: 'text-yellow-700',bg: 'bg-yellow-50' },
  'Draft':        { text: 'text-gray-500',  bg: 'bg-gray-100' },
}

const EMPTY_FORM = {
  name: '', category: 'T-Shirts', gender: 'Unisex',
  price: '', originalPrice: '', stock: '', status: 'Active',
  sizes: [], colors: [], description: '', material: '', fit: '', care: '',
  badge: '', images: []
}

const SIZES_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const BADGE_OPTIONS = ['', 'New', 'Best Seller', 'Sale', 'Trending']
const GENDER_OPTIONS = ['Men', 'Women', 'Unisex']

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product ? {
    ...EMPTY_FORM,
    name: product.name || '',
    category: product.category || 'T-Shirts',
    gender: product.gender || 'Unisex',
    price: String(product.price || ''),
    originalPrice: String(product.originalPrice || ''),
    stock: String(product.stock || ''),
    status: product.status || 'Active',
    sizes: product.sizes || [],
    colors: product.colors || [],
    description: product.description || '',
    material: product.material || '',
    fit: product.fit || '',
    care: product.care || '',
    badge: product.badge || '',
    images: product.images || [],
  } : EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [uploading, setUploading] = useState(false)
  const [colorInput, setColorInput] = useState({ name: '', hex: '#000000' })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const toggleSize = (size) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
    }))
  }

  const addColor = () => {
    if (!colorInput.name.trim()) return
    setForm(prev => ({ ...prev, colors: [...prev.colors, { ...colorInput }] }))
    setColorInput({ name: '', hex: '#000000' })
  }

  const removeColor = (i) => setForm(prev => ({ ...prev, colors: prev.colors.filter((_, idx) => idx !== i) }))
  const removeImage = (i) => setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))

  const handleImageUpload = async (e) => {
    const files = e.target.files
    if (!files.length) return
    setUploading(true)
    try {
      const urls = await uploadMultipleImages(files)
      setForm(prev => ({ ...prev, images: [...prev.images, ...urls] }))
      toast.success(`${urls.length} image(s) uploaded!`)
    } catch {
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Enter a valid price'
    if (!form.originalPrice || isNaN(form.originalPrice) || Number(form.originalPrice) < Number(form.price)) e.originalPrice = 'Must be >= selling price'
    if (form.stock === '' || isNaN(form.stock) || Number(form.stock) < 0) e.stock = 'Enter valid stock'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave({ ...form, price: Number(form.price), originalPrice: Number(form.originalPrice), stock: Number(form.stock) })
  }

  const isEdit = !!product

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-black text-gray-900 uppercase tracking-widest">{isEdit ? 'Edit Product' : 'Add Product'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {/* Basic fields */}
          {[
            { name: 'name', label: 'Product Name', type: 'text' },
            { name: 'price', label: 'Selling Price (₹)', type: 'number' },
            { name: 'originalPrice', label: 'MRP (₹)', type: 'number' },
            { name: 'stock', label: 'Stock Quantity', type: 'number' },
          ].map(field => (
            <div key={field.name} className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{field.label}</label>
              <input type={field.type} name={field.name} value={form[field.name]} onChange={handleChange}
                className={`border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors ${errors[field.name] ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}`} />
              {errors[field.name] && <p className="text-xs text-red-500">{errors[field.name]}</p>}
            </div>
          ))}

          {/* Dropdowns */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'category', label: 'Category', options: ['T-Shirts', 'Pants', 'Shorts'] },
              { name: 'gender', label: 'Gender', options: GENDER_OPTIONS },
              { name: 'status', label: 'Status', options: ['Active', 'Draft', 'Out of Stock', 'Low Stock'] },
              { name: 'badge', label: 'Badge', options: BADGE_OPTIONS },
            ].map(field => (
              <div key={field.name} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{field.label}</label>
                <select name={field.name} value={form[field.name]} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-900 bg-white">
                  {field.options.map(o => <option key={o} value={o}>{o || 'None'}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Sizes */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Sizes Available</label>
            <div className="flex flex-wrap gap-2">
              {SIZES_OPTIONS.map(size => (
                <button type="button" key={size} onClick={() => toggleSize(size)}
                  className={`w-10 h-10 text-xs font-bold rounded border transition-all ${form.sizes.includes(size) ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900'}`}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Colors</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.colors.map((c, i) => (
                <div key={i} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1 text-xs">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} />
                  {c.name}
                  <button type="button" onClick={() => removeColor(i)} className="text-gray-400 hover:text-red-500 ml-1">×</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Color name (e.g. Black)" value={colorInput.name}
                onChange={e => setColorInput(p => ({ ...p, name: e.target.value }))}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-900" />
              <input type="color" value={colorInput.hex}
                onChange={e => setColorInput(p => ({ ...p, hex: e.target.value }))}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
              <button type="button" onClick={addColor} className="bg-gray-900 text-white text-xs px-3 rounded-lg">Add</button>
            </div>
          </div>

          {/* Images */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Product Images</label>
            <div className="flex flex-wrap gap-2 mb-1">
              {form.images.map((url, i) => (
                <div key={i} className="relative w-16 h-16">
                  <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">×</button>
                </div>
              ))}
            </div>
            <label className={`flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-lg py-3 cursor-pointer hover:border-gray-400 transition-colors ${uploading ? 'opacity-50' : ''}`}>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <span className="text-xs text-gray-500">{uploading ? 'Uploading...' : 'Upload Images'}</span>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-900 resize-none" />
          </div>

          {/* Material / Fit / Care */}
          {[{ name: 'material', label: 'Material' }, { name: 'fit', label: 'Fit Type' }, { name: 'care', label: 'Care Instructions' }].map(f => (
            <div key={f.name} className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{f.label}</label>
              <input type="text" name={f.name} value={form[f.name]} onChange={handleChange}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-900" />
            </div>
          ))}

          <div className="flex gap-3 mt-2">
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 text-sm font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={uploading} className="flex-1 bg-[#111111] text-white text-sm font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50">
              {isEdit ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await getAllProducts()
      setProducts(data)
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'All' || p.status === filterStatus
    return matchSearch && matchStatus
  })

  const handleSave = async (data) => {
    setSaving(true)
    try {
      const { id: _id, ...cleanData } = data
      if (editProduct) {
        await updateProduct(editProduct.id, cleanData)
        toast.success('Product updated!')
      } else {
        await addProduct(cleanData)
        toast.success('Product added!')
      }
      await loadProducts()
      setModalOpen(false)
      setEditProduct(null)
    } catch {
      toast.error('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id)
      toast.success('Product deleted')
      setProducts(prev => prev.filter(p => p.id !== id))
      setDeleteId(null)
    } catch {
      toast.error('Failed to delete product')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>Products</h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} total products</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setEditProduct(null); setModalOpen(true) }}
            className="bg-[#111111] text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
          <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-900 transition-colors" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gray-900 cursor-pointer">
          {['All', 'Active', 'Draft', 'Low Stock', 'Out of Stock'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Product', 'Category', 'Price', 'MRP', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => {
                const s = STATUS_STYLES[product.status] || STATUS_STYLES['Draft']
                return (
                  <tr key={product.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.images?.[0] || product.image} alt={product.name} className="w-10 h-12 object-cover rounded-lg bg-gray-100 shrink-0" />
                        <span className="font-semibold text-gray-900 text-xs">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{product.category}</td>
                    <td className="px-5 py-3 font-bold text-gray-900 text-xs">₹{product.price.toLocaleString()}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs line-through">₹{product.originalPrice.toLocaleString()}</td>
                    <td className="px-5 py-3 text-xs">
                      <span className={`font-bold ${product.stock === 0 ? 'text-red-500' : product.stock <= 10 ? 'text-yellow-600' : 'text-gray-900'}`}>{product.stock}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.text} ${s.bg}`}>{product.status}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditProduct(product); setModalOpen(true) }}
                          className="text-gray-400 hover:text-gray-900 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
                        </button>
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <ProductModal
          product={editProduct}
          onClose={() => { setModalOpen(false); setEditProduct(null) }}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <h3 className="text-base font-black text-gray-900 mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 text-gray-700 text-sm font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500 text-white text-sm font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
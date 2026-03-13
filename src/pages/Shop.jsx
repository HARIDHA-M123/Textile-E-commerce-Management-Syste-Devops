import { useState, useMemo, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getAllProducts } from '../firebase/products'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'

const CATEGORIES = ['All', 'T-Shirts', 'Pants', 'Shorts']
const GENDERS = ['All', 'Men', 'Women', 'Unisex']
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
]

// ─── Product Card ─────────────────────────────────────────────
function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false)
  const { isWishlisted, toggleWishlist } = useWishlist()
  const { addItem } = useCart()
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
  const wishlisted = isWishlisted(product.id)

  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Clickable overlay to product page — sits behind buttons */}
      <Link to={`/product/${product.id}`} className="absolute inset-0 z-0" aria-label={product.name} />
      <div className="relative overflow-hidden aspect-3/4 bg-gray-100">
        <img
          src={(product.images?.[0] || product.image)?.replace('/upload/', '/upload/w_600,q_90,f_auto/')}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-[#111111] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
            -{discount}%
          </span>
        )}
        {/* Wishlist button */}
        <button
          onClick={() => toggleWishlist({
            productId: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.images?.[0] || '',
            sizes: product.sizes || [],
            colors: product.colors || [],
            badge: product.badge || '',
          })}
          className={`absolute top-3 right-3 mt-6 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50 ${wishlisted ? 'opacity-100!' : ''}`}
        >
          <svg className={`w-4 h-4 transition-colors ${wishlisted ? 'text-red-500' : 'text-gray-400'}`} fill={wishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        </button>
        {/* Add to Cart hover */}
        <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${hovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <button
            onClick={() => addItem({
              productId: product.id,
              name: product.name,
              category: product.category,
              price: product.price,
              originalPrice: product.originalPrice,
              image: product.images?.[0] || '',
              size: product.sizes?.[0] || 'M',
              color: product.colors?.[0] || { name: 'Default', hex: '#111111' },
              quantity: 1,
            })}
            className="w-full bg-[#111111] text-white text-sm font-semibold py-3 uppercase tracking-widest hover:bg-gray-800 transition-colors">
            Add to Cart
          </button>
        </div>
      </div>

      <div className="p-3">
        <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">{product.category} · {product.gender}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-900 hover:text-gray-500 transition-colors line-clamp-1">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mt-2">
          {product.colors.map((color, i) => (
            <span key={i} className="w-3 h-3 rounded-full border border-gray-200 cursor-pointer hover:scale-125 transition-transform" style={{ backgroundColor: color }} />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
          <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Filter Sidebar ───────────────────────────────────────────
function FilterSidebar({ filters, setFilters, onClose }) {
  const toggle = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }))
  }

  const clearAll = () => setFilters({ categories: [], genders: [], sizes: [], priceMax: 5000 })

  const totalActive = filters.categories.length + filters.genders.length + filters.sizes.length

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Filters
          {totalActive > 0 && <span className="ml-2 bg-[#111111] text-white text-[10px] px-2 py-0.5 rounded-full">{totalActive}</span>}
        </h3>
        <div className="flex items-center gap-3">
          {totalActive > 0 && (
            <button onClick={clearAll} className="text-xs text-gray-400 hover:text-gray-900 underline transition-colors">Clear all</button>
          )}
          {onClose && (
            <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="mb-6">
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Category</h4>
        <div className="flex flex-col gap-2">
          {CATEGORIES.filter(c => c !== 'All').map(cat => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => toggle('categories', cat)}
                className="w-4 h-4 accent-black rounded"
              />
              <span className="text-sm text-gray-700 group-hover:text-black transition-colors">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div className="mb-6">
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Gender</h4>
        <div className="flex flex-wrap gap-2">
          {GENDERS.filter(g => g !== 'All').map(gender => (
            <button
              key={gender}
              onClick={() => toggle('genders', gender)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                filters.genders.includes(gender)
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900'
              }`}
            >
              {gender}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="mb-6">
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Size</h4>
        <div className="flex flex-wrap gap-2">
          {SIZES.map(size => (
            <button
              key={size}
              onClick={() => toggle('sizes', size)}
              className={`w-10 h-10 text-xs font-bold rounded border transition-all ${
                filters.sizes.includes(size)
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-2">
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
          Max Price: <span className="text-gray-900">₹{filters.priceMax.toLocaleString()}</span>
        </h4>
        <input
          type="range"
          min={299}
          max={5000}
          step={100}
          value={filters.priceMax}
          onChange={e => setFilters(prev => ({ ...prev, priceMax: Number(e.target.value) }))}
          className="w-full accent-black"
        />
        <div className="flex justify-between text-[11px] text-gray-400 mt-1">
          <span>₹299</span>
          <span>₹5,000</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Shop Page ───────────────────────────────────────────
export default function Shop() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [filters, setFilters] = useState({ categories: [], genders: [], sizes: [], priceMax: 5000 })
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    setLoading(true)
    getAllProducts()
      .then(products => setAllProducts(products))
      .catch(err => console.error('Failed to load products:', err))
      .finally(() => setLoading(false))
  }, [location.key])

  const isFiltering = search.trim() || filters.categories.length > 0 || filters.genders.length > 0 || filters.sizes.length > 0 || filters.priceMax < 5000

  const filtered = useMemo(() => {
    let result = [...allProducts]

    if (!isFiltering) return result

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter(p => filters.categories.includes(p.category))
    }

    // Gender filter — always include Unisex when Men or Women is selected
    if (filters.genders.length > 0) {
      result = result.filter(p => filters.genders.includes(p.gender) || p.gender === 'Unisex')
    }

    // Size filter
    if (filters.sizes.length > 0) {
      result = result.filter(p => (p.sizes || []).some(s => filters.sizes.includes(s)))
    }

    // Price filter
    if (filters.priceMax < 5000) {
      result = result.filter(p => p.price <= filters.priceMax)
    }

    // Sort
    switch (sort) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break
      case 'price_desc': result.sort((a, b) => b.price - a.price); break
      default: break
    }

    return result
  }, [search, sort, filters, allProducts, isFiltering])

  const activeFilterCount = filters.categories.length + filters.genders.length + filters.sizes.length

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* Page Header */}
      <div className="bg-[#111111] text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">CoolBros</p>
          <h1 className="text-4xl font-black" style={{ letterSpacing: '-0.03em' }}>All Products</h1>
          <p className="text-gray-400 text-sm mt-2">{allProducts.length} styles available</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Top Bar — Search + Sort + Mobile Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-900 transition-colors"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-900 transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden flex items-center justify-center gap-2 bg-[#111111] text-white text-sm font-semibold px-4 py-2.5 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>

        <div className="flex gap-6">

          {/* Sidebar — Desktop */}
          <div className="hidden md:block w-56 shrink-0">
            <FilterSidebar filters={filters} setFilters={setFilters} />
          </div>

          {/* Mobile Filter Drawer */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#f5f5f5] p-4 overflow-y-auto">
                <FilterSidebar filters={filters} setFilters={setFilters} onClose={() => setMobileFiltersOpen(false)} />
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {/* Results count */}
            <p className="text-sm text-gray-500 mb-4">
              Showing <span className="font-semibold text-gray-900">{filtered.length}</span> of {allProducts.length} products
              {search && <span> for "<span className="font-semibold text-gray-900">{search}</span>"</span>}
            </p>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 text-sm">Loading products...</p>
              </div>
            ) : filtered.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <span className="text-6xl mb-4">🔍</span>
                <h3 className="text-xl font-black text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or search term</p>
                <button
                  onClick={() => { setSearch(''); setFilters({ categories: [], genders: [], sizes: [], priceMax: 5000 }) }}
                  className="bg-[#111111] text-white text-sm font-bold uppercase tracking-widest px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductById, getAllProducts } from '../firebase/products'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

const SIZE_GUIDE = [
  { size: 'XS', chest: '32-34', waist: '26-28', hip: '34-36' },
  { size: 'S',  chest: '34-36', waist: '28-30', hip: '36-38' },
  { size: 'M',  chest: '38-40', waist: '32-34', hip: '40-42' },
  { size: 'L',  chest: '42-44', waist: '36-38', hip: '44-46' },
  { size: 'XL', chest: '46-48', waist: '40-42', hip: '48-50' },
  { size: 'XXL',chest: '50-52', waist: '44-46', hip: '52-54' },
]

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [sizeError, setSizeError] = useState(false)
  const [related, setRelated] = useState([])
  const { addItem } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()



useEffect(() => {
  setPageLoading(true)
  getProductById(id)
    .then(data => {
      setProduct(data)
      return getAllProducts().then(all => {
        const filtered = all
          .filter(p => p.id !== id && p.category === data.category && p.inStock !== false)
          .slice(0, 10)
        setRelated(filtered)  // ← change this line
      })
    })
    .catch(err => console.error('Failed to load product:', err))
    .finally(() => setPageLoading(false))
}, [id])

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center text-center px-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <span className="text-7xl mb-6">😕</span>
        <h1 className="text-3xl font-black text-gray-900 mb-3">Product Not Found</h1>
        <p className="text-gray-500 text-sm mb-8">This product doesn't exist or may have been removed.</p>
        <Link to="/shop" className="bg-[#111111] text-white text-sm font-bold uppercase tracking-widest px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors">
          Back to Shop
        </Link>
      </div>
    )
  }

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  const handleAddToCart = async () => {
    if (!selectedSize) { setSizeError(true); return }
    setSizeError(false)
    await addItem({
      productId: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images?.[0] || '',
      size: selectedSize,
      color: product.colors?.[selectedColor] || { name: 'Default', hex: '#111111' },
      quantity,
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2500)
  }


  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-xs text-gray-400">
          <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-gray-900 transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start">

          {/* ── Left: Image Gallery ──────────────────────────── */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 h-full">
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-[#111111]' : 'border-transparent hover:border-gray-300'}`}>
                  <img src={img?.replace('/upload/', '/upload/w_200,q_90,f_auto/')} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex-1 relative rounded-2xl overflow-hidden bg-gray-100" style={{ aspectRatio: '3/4' }}>
              <img src={product.images[selectedImage]?.replace('/upload/', '/upload/w_1200,q_100,f_auto/')} alt={product.name} className="w-full h-full object-cover" />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-[#111111] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded">{product.badge}</span>
              )}
              {discount > 0 && (
                <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">-{discount}%</span>
              )}
            </div>
          </div>

          {/* ── Right: Product Info ──────────────────────────── */}
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{product.category} · {product.gender}</p>
              <h1 className="text-3xl font-black text-gray-900 leading-tight mb-2" style={{ letterSpacing: '-0.02em' }}>{product.name}</h1>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-gray-900">₹{product.price.toLocaleString()}</span>
              <span className="text-lg text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
              {discount > 0 && <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">{discount}% OFF</span>}
            </div>

            <div className="border-t border-gray-200" />

            {/* Color Selector */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Color: <span className="font-normal text-gray-500">{product.colors?.[selectedColor]?.name}</span>
              </p>
              <div className="flex items-center gap-3">
                {(product.colors || []).map((color, i) => (
                  <button key={i} onClick={() => setSelectedColor(i)} title={color.name}
                    className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${selectedColor === i ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color.hex, boxShadow: color.hex === '#ffffff' ? 'inset 0 0 0 1px #e5e7eb' : 'none' }}
                  />
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-900">
                  Size: {selectedSize && <span className="font-normal text-gray-500">{selectedSize}</span>}
                </p>
                <button onClick={() => setSizeGuideOpen(true)} className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-900 transition-colors">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(product.sizes || []).map(size => (
                  <button key={size} onClick={() => { setSelectedSize(size); setSizeError(false) }}
                    className={`w-12 h-12 text-sm font-bold rounded-lg border-2 transition-all ${
                      selectedSize === size ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-900'
                    }`}>
                    {size}
                  </button>
                ))}
              </div>
              {sizeError && <p className="text-red-500 text-xs mt-1">⚠ Please select a size before adding to cart</p>}
            </div>

            {/* Quantity */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Quantity</p>
              <div className="flex items-center border border-gray-200 rounded-lg w-fit bg-white">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors rounded-l-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                </button>
                <span className="w-12 text-center text-sm font-bold text-gray-900">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(10, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors rounded-r-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <button onClick={handleAddToCart}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest rounded-xl transition-all duration-200 ${
                  addedToCart ? 'bg-green-600 text-white' : 'bg-[#111111] text-white hover:bg-gray-800'
                }`}>
                {addedToCart ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>
              <button
                onClick={() => product && toggleWishlist({
                  productId: product.id, name: product.name, category: product.category,
                  price: product.price, originalPrice: product.originalPrice,
                  image: product.images?.[0] || '', sizes: product.sizes || [],
                  colors: product.colors || [], badge: product.badge || '',
                })}
                className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all ${
                  (product && isWishlisted(product.id)) ? 'border-red-400 bg-red-50 text-red-500' : 'border-gray-200 bg-white text-gray-400 hover:border-gray-900 hover:text-gray-900'
                }`}>
                <svg className="w-5 h-5" fill={(product && isWishlisted(product.id)) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              </button>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-xl p-3 flex flex-col gap-2 border border-gray-100">
              {['Free delivery on orders above ₹999', '7-day easy returns & exchanges', 'Genuine product guarantee'].map(text => (
                <div key={text} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-xl p-3 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2">Product Details</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">{product.description}</p>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: 'Material', value: product.material },
                  { label: 'Fit', value: product.fit },
                  { label: 'Care', value: product.care },
                ].map(item => item.value ? (
                  <div key={item.label} className="flex gap-3 text-sm">
                    <span className="text-gray-400 w-20 shrink-0">{item.label}</span>
                    <span className="text-gray-700">{item.value}</span>
                  </div>
                ) : null)}
              </div>
            </div>
          </div>
        </div>


      </div>

      {/* ── You May Also Like ──────────────────────────────────── */}
      {related.length > 0 && (
        <div className="mt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 mb-1">More from {product.category}</p>
          <h2 className="text-2xl font-black text-gray-900 mb-5" style={{ letterSpacing: '-0.02em' }}>You May Also Like</h2>
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {related.map(item => {
              const disc = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
              return (
                <Link key={item.id} to={`/product/${item.id}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all shrink-0 w-48 sm:w-56">
                  <div className="relative bg-gray-100 w-full" style={{ paddingTop: '133%', overflow: 'hidden' }}>
                    <img
                      src={(item.images?.[0] || item.image)?.replace('/upload/', '/upload/w_600,q_90,f_auto/')}
                      alt={item.name}
                      loading="lazy"
                      className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {disc > 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">-{disc}%</span>
                    )}
                    {item.badge && (
                      <span className="absolute top-2 left-2 bg-[#111111] text-white text-[10px] font-bold px-2 py-0.5 rounded">{item.badge}</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{item.category}</p>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-2">{item.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 line-through">₹{item.originalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Size Guide Modal ───────────────────────────────────── */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSizeGuideOpen(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-gray-900">Size Guide (in inches)</h3>
              <button onClick={() => setSizeGuideOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {['Size', 'Chest', 'Waist', 'Hip'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SIZE_GUIDE.map((row, i) => (
                    <tr key={row.size} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-bold text-gray-900">{row.size}</td>
                      <td className="px-4 py-3 text-gray-600">{row.chest}</td>
                      <td className="px-4 py-3 text-gray-600">{row.waist}</td>
                      <td className="px-4 py-3 text-gray-600">{row.hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-4">* All measurements are in inches. If you're between sizes, we recommend sizing up.</p>
          </div>
        </div>
      )}
    </div>
  )
}
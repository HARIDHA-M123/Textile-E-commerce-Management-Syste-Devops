import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getFeaturedProducts } from '../firebase/products'



const CATEGORIES = [
  {
    name: "Men's",
    description: 'Shop all mens styles',
    path: '/shop?category=men',
    bg: '#111111',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80',
  },
  {
    name: "Women's",
    description: 'Shop all womens styles',
    path: '/shop?category=women',
    bg: '#1a1a2e',
    image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&q=80',
  },
  {
    name: 'New Arrivals',
    description: 'Fresh drops every week',
    path: '/shop?category=new',
    bg: '#1a2e1a',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80',
  },
  {
    name: 'Sale',
    description: 'Up to 50% off',
    path: '/shop?category=sale',
    bg: '#2e1a1a',
    image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&q=80',
  },
]

// ─── Sub Components ───────────────────────────────────────────

function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false)
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-3/4 bg-gray-100">
        <img
          src={(product.images?.[0] || product.image)?.replace('/upload/', '/upload/w_600,q_90,f_auto/')}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-3 left-3 bg-[#111111] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
            {product.badge}
          </span>
        )}

        {/* Discount */}
        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
            -{discount}%
          </span>
        )}

        {/* Hover — Add to Cart */}
        <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${hovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <button className="w-full bg-[#111111] text-white text-sm font-semibold py-3 uppercase tracking-widest hover:bg-gray-800 transition-colors">
            Add to Cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">{product.category}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Colors */}
        <div className="flex items-center gap-1 mt-2">
          {product.colors.map((color, i) => (
            <span
              key={i}
              className="w-3 h-3 rounded-full border border-gray-200 cursor-pointer hover:scale-125 transition-transform"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
          <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Home Page ───────────────────────────────────────────

export default function Home() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [heroLoaded, setHeroLoaded] = useState(false)
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)

  useEffect(() => {
    getFeaturedProducts(8)
      .then(products => setFeaturedProducts(products))
      .catch(err => console.error('Failed to load products:', err))
      .finally(() => setProductsLoading(false))
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ── Hero Section ─────────────────────────────────────── */}
      <section className="relative h-[90vh] min-h-140 overflow-hidden bg-[#111111]">
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=80"
          alt="CoolBros Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent" />

        {/* Content */}
        <div className={`relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center transition-all duration-1000 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="max-w-xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 mb-4 border border-gray-600 px-3 py-1 rounded-full">
              New Collection 2026
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-none mb-6" style={{ letterSpacing: '-0.03em' }}>
              WEAR YOUR<br />
              <span className="text-transparent" style={{ WebkitTextStroke: '2px white' }}>VIBE.</span>
            </h1>
            <p className="text-gray-300 text-base sm:text-lg mb-8 leading-relaxed max-w-md">
              Fresh fits for everyone. Quality clothing that speaks your style — without breaking the bank.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="bg-white text-black text-sm font-bold uppercase tracking-widest px-8 py-4 rounded hover:bg-gray-200 transition-colors duration-200"
              >
                Shop Now
              </Link>
              <Link
                to="/shop?category=new"
                className="border border-white text-white text-sm font-bold uppercase tracking-widest px-8 py-4 rounded hover:bg-white hover:text-black transition-colors duration-200"
              >
                New Arrivals
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-gray-500 text-xs uppercase tracking-widest">Scroll</span>
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 mb-2">Browse by</p>
            <h2 className="text-3xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>Categories</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={cat.path}
              className="group relative overflow-hidden rounded-xl aspect-3/4 bg-gray-900"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-black text-xl" style={{ letterSpacing: '-0.02em' }}>{cat.name}</h3>
                <p className="text-gray-400 text-xs mt-1 group-hover:text-gray-200 transition-colors">{cat.description} →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 mb-2">Handpicked for you</p>
            <h2 className="text-3xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>Featured Products</h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-semibold text-gray-900 underline underline-offset-4 hover:text-gray-500 transition-colors hidden sm:block"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/shop"
            className="inline-block border border-gray-900 text-gray-900 text-sm font-bold uppercase tracking-widest px-8 py-3 rounded hover:bg-gray-900 hover:text-white transition-colors"
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* ── Promo Banner ─────────────────────────────────────── */}
      <section className="bg-[#111111] py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-[0.3em] mb-3">Limited Time Offer</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight" style={{ letterSpacing: '-0.03em' }}>
              FLAT 20% OFF<br />
              <span className="text-gray-400">on orders above ₹999</span>
            </h2>
          </div>
          <div className="flex flex-col items-center lg:items-end gap-4">
            <div className="text-center lg:text-right">
              <p className="text-gray-400 text-sm mb-1">Use code at checkout</p>
              <div className="bg-gray-800 border border-gray-600 border-dashed rounded-lg px-6 py-3">
                <span className="text-white font-black text-2xl tracking-widest">COOLBROS20</span>
              </div>
            </div>
            <Link
              to="/shop"
              className="bg-white text-black text-sm font-bold uppercase tracking-widest px-8 py-4 rounded hover:bg-gray-200 transition-colors"
            >
              Shop & Save
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why CoolBros ─────────────────────────────────────── */}
      {/* ── Why CoolBros ─────────────────────────────────────── */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
    {[
      {
        title: 'Free Shipping',
        desc: 'On all orders above ₹999',
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
          </svg>
        ),
      },
      {
        title: 'Easy Returns',
        desc: '7-day hassle-free returns',
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        ),
      },
      {
        title: 'Quality Assured',
        desc: 'Premium fabrics & stitching',
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
          </svg>
        ),
      },
      {
        title: 'Secure Payments',
        desc: 'Razorpay & UPI supported',
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        ),
      },
    ].map((item) => (
      <div key={item.title} className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-700">
          {item.icon}
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h3>
        <p className="text-xs text-gray-500">{item.desc}</p>
      </div>
    ))}
  </div>
</section>
</div>
  )
}
import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { logOut } from '../firebase/auth'
import toast from 'react-hot-toast'

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
  </svg>
)

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
  </svg>
)

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
)

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
)

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
)

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
)

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/shop' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuth()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const userMenuRef = useRef(null)

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logOut()
      toast.success('Logged out successfully')
      navigate('/')
    } catch {
      toast.error('Logout failed')
    }
  }

  // Detect scroll for shadow effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location])

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-white text-black text-xs text-center py-2 tracking-widest font-medium uppercase border-b border-gray-200">
        Free shipping on orders above ₹999 &nbsp;|&nbsp; Use code <span className="font-bold">COOLBROS10</span> for 10% off
      </div>

      {/* Main Navbar */}
      <nav
        className={`sticky top-0 z-50 bg-[#111111] text-white transition-shadow duration-300 ${
          scrolled ? 'shadow-lg shadow-black/40' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Left — Logo */}
            <Link to="/" className="shrink-0">
              <span
                className="text-2xl font-black tracking-tight text-white"
                style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.03em' }}
              >
                COOL<span className="text-gray-400">BROS</span>
              </span>
            </Link>

            {/* Center — Nav Links (Desktop) */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium tracking-wide uppercase transition-colors duration-200 relative group ${
                    location.pathname === link.path
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.name}
                  {/* Underline indicator */}
                  <span
                    className={`absolute -bottom-1 left-0 h-2px bg-white transition-all duration-200 ${
                      location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </Link>
              ))}
            </div>

            {/* Right — Icons (Desktop) */}
            <div className="hidden md:flex items-center gap-5">

              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Search"
              >
                <SearchIcon />
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="text-gray-400 hover:text-white transition-colors duration-200 relative"
                aria-label="Wishlist"
              >
                <HeartIcon />

              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="text-gray-400 hover:text-white transition-colors duration-200 relative"
                aria-label="Cart"
              >
                <CartIcon />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User / Login */}
              {isLoggedIn ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold uppercase">
                      {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                    </div>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <p className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100 truncate">{user?.email}</p>
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">My Profile</Link>
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">My Orders</Link>
                      <Link to="/wishlist" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Wishlist</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1">Sign Out</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label="Account"
                >
                  <UserIcon />
                </Link>
              )}

            </div>

            {/* Mobile — Right Icons */}
            <div className="flex md:hidden items-center gap-4">
              <Link to="/cart" className="text-gray-400 hover:text-white relative">
                <CartIcon />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Menu"
              >
                {menuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>

          </div>
        </div>

        {/* Search Bar (Expandable) */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            searchOpen ? 'max-h-16 border-t border-gray-700' : 'max-h-0'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-3 bg-[#1e1e1e] rounded-lg px-4 py-2">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search for t-shirts, pants, hoodies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white placeholder-gray-500 text-sm w-full outline-none"
                autoFocus={searchOpen}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-gray-500 hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 border-t border-gray-700 ${
            menuOpen ? 'max-h-96' : 'max-h-0'
          }`}
        >
          <div className="px-4 py-4 flex flex-col gap-1 bg-[#111111]">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`py-3 px-2 text-sm font-medium tracking-wide uppercase border-b border-gray-800 transition-colors duration-200 ${
                  location.pathname === link.path
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile Search */}
            <div className="mt-3 flex items-center gap-3 bg-[#1e1e1e] rounded-lg px-4 py-2">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-white placeholder-gray-500 text-sm w-full outline-none"
              />
            </div>

            {/* Mobile Account Links */}
            <div className="mt-3 flex gap-4">
              {isLoggedIn ? (
                <>
                  <Link to="/profile" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm py-2">
                    <UserIcon /> Profile
                  </Link>
                  <Link to="/orders" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm py-2">
                    Orders
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm py-2">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm py-2">
                    <UserIcon /> Login
                  </Link>
                  <Link to="/signup" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm py-2">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

      </nav>
    </>
  )
}
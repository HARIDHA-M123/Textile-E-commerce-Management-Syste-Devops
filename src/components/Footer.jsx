import { Link } from 'react-router-dom'

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const YoutubeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#111111] text-gray-400 mt-auto">

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1 — Brand */}
          <div className="flex flex-col gap-4">
            <Link to="/">
              <span
                className="text-2xl font-black tracking-tight text-white"
                style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.03em' }}
              >
                COOL<span className="text-gray-400">BROS</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">
              Fresh fits for everyone. Quality clothing that speaks your vibe — without breaking the bank.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-2">
              <a href="#" aria-label="Instagram" className="hover:text-white transition-colors duration-200">
                <InstagramIcon />
              </a>
              <a href="#" aria-label="Twitter / X" className="hover:text-white transition-colors duration-200">
                <TwitterIcon />
              </a>
              <a href="#" aria-label="Facebook" className="hover:text-white transition-colors duration-200">
                <FacebookIcon />
              </a>
              <a href="#" aria-label="YouTube" className="hover:text-white transition-colors duration-200">
                <YoutubeIcon />
              </a>
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-white text-sm font-semibold uppercase tracking-widest mb-1">Shop</h3>
            {[
              { name: 'All Products', path: '/shop' },
              { name: 'T-Shirts', path: '/shop?category=tshirts' },
              { name: 'Pants', path: '/shop?category=pants' },
              { name: 'New Arrivals', path: '/shop?category=new' },
              { name: 'Sale', path: '/shop?category=sale' },
            ].map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-sm hover:text-white transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Column 3 — Help */}
          <div className="flex flex-col gap-3">
            <h3 className="text-white text-sm font-semibold uppercase tracking-widest mb-1">Help</h3>
            {[
              { name: 'My Account', path: '/profile' },
              { name: 'Track My Order', path: '/orders' },
              { name: 'Wishlist', path: '/wishlist' },
              { name: 'Contact Us', path: '/contact' },
              { name: 'About Us', path: '/about' },
            ].map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-sm hover:text-white transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Column 4 — Policies */}
          <div className="flex flex-col gap-3">
            <h3 className="text-white text-sm font-semibold uppercase tracking-widest mb-1">Policies</h3>
            {[
              { name: 'Shipping Policy', path: '#' },
              { name: 'Return & Exchange', path: '#' },
              { name: 'Privacy Policy', path: '#' },
              { name: 'Terms of Service', path: '#' },
              { name: 'FAQ', path: '#' },
            ].map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-sm hover:text-white transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>

        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800" />

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Copyright */}
          <p className="text-xs text-gray-600 text-center sm:text-left">
            © {currentYear} CoolBros. All rights reserved. Made with ❤️ in India.
          </p>

          {/* Payment Methods */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 mr-1">We accept:</span>
            {/* Payment badges using text labels styled as badges */}
            {['Razorpay', 'UPI', 'Visa', 'Mastercard', 'COD'].map((method) => (
              <span
                key={method}
                className="text-[10px] font-semibold bg-gray-800 text-gray-400 px-2 py-1 rounded"
              >
                {method}
              </span>
            ))}
          </div>

        </div>
      </div>

    </footer>
  )
}
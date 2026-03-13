import { useState } from 'react'
import { Link } from 'react-router-dom'
import { resetPassword } from '../firebase/auth'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const validate = () => {
    if (!email.trim()) { setError('Email is required'); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address'); return false }
    return true
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      const msg = err.code === 'auth/user-not-found'
        ? 'No account found with this email'
        : 'Something went wrong. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4 py-12" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link to="/">
            <span className="text-3xl font-black tracking-tight" style={{ letterSpacing: '-0.03em' }}>
              COOL<span className="text-gray-400">BROS</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">

          {!sent ? (
            <>
              {/* Icon */}
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>

              <h1 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-2">Forgot Password</h1>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Enter the email address linked to your CoolBros account and we will send you a password reset link.
              </p>

              <div className="flex flex-col gap-1 mb-4">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="arjun@example.com"
                  className={`border rounded-lg px-3 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors ${error ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}`}
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-3.5 text-sm font-bold uppercase tracking-widest rounded-xl transition-all ${loading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#111111] text-white hover:bg-gray-800'}`}
              >
                {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </button>
            </>
          ) : (
            /* Success State */
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-2">
                We have sent a password reset link to
              </p>
              <p className="text-sm font-bold text-gray-900 mb-6">{email}</p>
              <p className="text-xs text-gray-400 mb-6">
                Did not receive the email? Check your spam folder or try again with a different email address.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="text-sm font-semibold text-gray-500 hover:text-gray-900 underline underline-offset-2 transition-colors"
              >
                Try a different email
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-100">
            <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
              Back to Sign In
            </Link>
            <span className="text-gray-200">|</span>
            <Link to="/signup" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
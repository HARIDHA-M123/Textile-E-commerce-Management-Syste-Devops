import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp, signInWithGoogle } from '../firebase/auth'
import toast from 'react-hot-toast'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email'
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^[6-9]\d{9}$/.test(form.phone)) newErrors.phone = 'Enter a valid 10-digit Indian mobile number'
    if (!form.password) newErrors.password = 'Password is required'
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) newErrors.password = 'Password must include uppercase, lowercase, and a number'
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (!agreed) newErrors.agreed = 'You must agree to the terms to continue'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getPasswordStrength = () => {
    const p = form.password
    if (!p) return null
    if (p.length < 6) return { label: 'Weak', color: 'bg-red-400', width: 'w-1/4' }
    if (p.length < 8 || !/(?=.*[A-Z])/.test(p)) return { label: 'Fair', color: 'bg-yellow-400', width: 'w-2/4' }
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(p)) return { label: 'Strong', color: 'bg-green-500', width: 'w-full' }
    return { label: 'Good', color: 'bg-blue-400', width: 'w-3/4' }
  }

  const strength = getPasswordStrength()

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await signUp(form)
      setVerificationSent(true)
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists'
        : 'Sign up failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const EyeIcon = ({ show }) => show ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
  )

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4 py-12" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="w-full max-w-md">

        {/* ── Email Verification Sent Screen ── */}
        {verificationSent ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-3">Verify Your Email</h2>
            <p className="text-sm text-gray-500 mb-2">We sent a verification link to</p>
            <p className="text-sm font-bold text-gray-900 mb-5">{form.email}</p>
            <p className="text-xs text-gray-400 mb-8">Click the link in the email to activate your account. Check your spam folder if you don't see it.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3.5 text-sm font-bold uppercase tracking-widest rounded-xl bg-[#111111] text-white hover:bg-gray-800 transition-all"
            >
              Go to Login
            </button>
          </div>
        ) : (
        <>
        <div className="text-center mb-8">
          <Link to="/">
            <span className="text-3xl font-black tracking-tight" style={{ letterSpacing: '-0.03em' }}>
              COOL<span className="text-gray-400">BROS</span>
            </span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Create your account and start shopping.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-6">Create Account</h1>

          <div className="flex flex-col gap-4">

            <div className="grid grid-cols-2 gap-3">
              {[['firstName', 'First Name', 'Arjun'], ['lastName', 'Last Name', 'Kumar']].map(([name, label, ph]) => (
                <div key={name} className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
                  <input
                    type="text" name={name} value={form[name]} onChange={handleChange} placeholder={ph}
                    className={`border rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors ${errors[name] ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}`}
                  />
                  {errors[name] && <p className="text-xs text-red-500">{errors[name]}</p>}
                </div>
              ))}
            </div>

            {[['email', 'Email', 'email', 'arjun@example.com'], ['phone', 'Phone Number', 'tel', '9876543210']].map(([name, label, type, ph]) => (
              <div key={name} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
                <input
                  type={type} name={name} value={form[name]} onChange={handleChange} placeholder={ph}
                  className={`border rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors ${errors[name] ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}`}
                />
                {errors[name] && <p className="text-xs text-red-500">{errors[name]}</p>}
              </div>
            ))}

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters"
                  className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors ${errors.password ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}`}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  <EyeIcon show={showPassword} />
                </button>
              </div>
              {form.password && strength && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div className={`h-1 rounded-full transition-all ${strength.color} ${strength.width}`} />
                  </div>
                  <span className={`text-xs font-semibold ${strength.label === 'Strong' ? 'text-green-600' : strength.label === 'Weak' ? 'text-red-500' : 'text-yellow-600'}`}>{strength.label}</span>
                </div>
              )}
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password"
                  className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}`}
                />
                <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  <EyeIcon show={showConfirm} />
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e => { setAgreed(e.target.checked); setErrors(prev => ({ ...prev, agreed: '' })) }} className="w-4 h-4 accent-black mt-0.5 shrink-0" />
                <span className="text-xs text-gray-500 leading-relaxed">
                  I agree to the{' '}
                  <Link to="#" className="font-semibold text-gray-900 hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="#" className="font-semibold text-gray-900 hover:underline">Privacy Policy</Link>
                </span>
              </label>
              {errors.agreed && <p className="text-xs text-red-500 mt-1">{errors.agreed}</p>}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-3.5 text-sm font-bold uppercase tracking-widest rounded-xl transition-all mt-1 ${loading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#111111] text-white hover:bg-gray-800'}`}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-gray-900 hover:underline underline-offset-2">Sign In</Link>
          </p>
        </div>
        </> )} {/* end verificationSent else */}
      </div>
    </div>
  )
}
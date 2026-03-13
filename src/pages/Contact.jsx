import { useState } from 'react'

const FAQS = [
  { q: 'How long does delivery take?', a: 'Standard delivery takes 5-7 business days across India. Express delivery (2-3 days) is available in select cities at checkout.' },
  { q: 'What is your return policy?', a: 'We offer a 7-day return and exchange policy. Items must be unworn, unwashed and in original packaging with tags intact.' },
  { q: 'How do I track my order?', a: 'Once your order ships, you will receive a tracking ID via email and SMS. You can also track your order from the My Orders page in your account.' },
  { q: 'Do you ship outside India?', a: 'Currently we only ship within India. International shipping is on our roadmap and will be available soon.' },
  { q: 'Can I change or cancel my order?', a: 'Orders can be cancelled or modified within 12 hours of placing them. After that, the order enters processing and cannot be changed.' },
  { q: 'How do I apply a coupon code?', a: 'Add items to your cart and enter your coupon code in the cart page before proceeding to checkout.' },
]

const CONTACT_METHODS = [
  {
    label: 'Email Us',
    value: 'support@coolbros.in',
    desc: 'We reply within 24 hours',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    label: 'Call Us',
    value: '+91 98765 43210',
    desc: 'Mon - Sat, 10am to 6pm',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
      </svg>
    ),
  },
  {
    label: 'Live Chat',
    value: 'Chat on WhatsApp',
    desc: 'Typically replies in minutes',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
      </svg>
    ),
  },
]

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="text-sm font-semibold text-gray-900">{faq.q}</span>
        <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <p className="text-sm text-gray-500 leading-relaxed pb-4">{faq.a}</p>
      )}
    </div>
  )
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email'
    if (!form.subject.trim()) newErrors.subject = 'Subject is required'
    if (!form.message.trim()) newErrors.message = 'Message is required'
    else if (form.message.trim().length < 20) newErrors.message = 'Message must be at least 20 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    setLoading(true)
    // TODO: Wire up to Firebase or an email service like EmailJS
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* Page Header */}
      <div className="bg-[#111111] text-white py-16 px-4 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-3">We are here to help</p>
        <h1 className="text-5xl font-black" style={{ letterSpacing: '-0.03em' }}>Contact Us</h1>
        <p className="text-gray-400 text-sm mt-3 max-w-sm mx-auto">Have a question, issue or just want to say hello? We would love to hear from you.</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">

        {/* Contact Methods */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {CONTACT_METHODS.map(method => (
            <div key={method.label} className="bg-white rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-700">
                {method.icon}
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1">{method.label}</p>
              <p className="text-sm text-gray-700 font-semibold mb-1">{method.value}</p>
              <p className="text-xs text-gray-400">{method.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-sm p-7">
            <h2 className="text-base font-black text-gray-900 uppercase tracking-widest mb-6">Send a Message</h2>

            {submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  Thanks for reaching out, {form.name}. We will get back to you at <span className="font-semibold text-gray-700">{form.email}</span> within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                  className="text-sm font-bold text-gray-500 underline underline-offset-2 hover:text-gray-900 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {[
                  { name: 'name', label: 'Your Name', type: 'text', placeholder: 'Arjun Kumar' },
                  { name: 'email', label: 'Email Address', type: 'email', placeholder: 'arjun@example.com' },
                  { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Order issue, return request, etc.' },
                ].map(field => (
                  <div key={field.name} className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      className={`border rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors ${errors[field.name] ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}`}
                    />
                    {errors[field.name] && <p className="text-xs text-red-500">{errors[field.name]}</p>}
                  </div>
                ))}

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Describe your issue or question in detail..."
                    rows={5}
                    className={`border rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors resize-none ${errors.message ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}`}
                  />
                  <div className="flex items-center justify-between">
                    {errors.message ? <p className="text-xs text-red-500">{errors.message}</p> : <span />}
                    <p className="text-xs text-gray-400">{form.message.length} characters</p>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`w-full py-3.5 text-sm font-bold uppercase tracking-widest rounded-xl transition-all mt-1 ${loading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#111111] text-white hover:bg-gray-800'}`}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            )}
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-base font-black text-gray-900 uppercase tracking-widest mb-5">Frequently Asked Questions</h2>
            <div className="bg-white rounded-2xl shadow-sm px-5">
              {FAQS.map(faq => (
                <FAQItem key={faq.q} faq={faq} />
              ))}
            </div>

            {/* Office Address */}
            <div className="bg-white rounded-xl shadow-sm p-5 mt-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Our Office</p>
              <p className="text-sm font-semibold text-gray-900">CoolBros Clothing Pvt. Ltd.</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                123, 2nd Floor, Spencer Plaza,<br />
                Anna Salai, Chennai,<br />
                Tamil Nadu - 600002
              </p>
              <p className="text-xs text-gray-400 mt-2">Mon - Sat: 10:00 AM to 6:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
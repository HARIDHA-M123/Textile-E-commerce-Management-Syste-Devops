import { Link } from 'react-router-dom'

const TEAM = [
  {
    name: 'Rahul Sharma',
    role: 'Co-Founder & CEO',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
  },
  {
    name: 'Priya Nair',
    role: 'Co-Founder & Head of Design',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
  },
  {
    name: 'Karan Mehta',
    role: 'Head of Operations',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
  },
  {
    name: 'Sneha Iyer',
    role: 'Head of Marketing',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80',
  },
]

const VALUES = [
  {
    title: 'Quality First',
    desc: 'Every piece we sell goes through rigorous quality checks. We use only premium fabrics — no compromise, ever.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
      </svg>
    ),
  },
  {
    title: 'Inclusive Sizing',
    desc: 'Fashion is for everyone. We design for all body types, with sizing from XS to XXL across every collection.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
  {
    title: 'Sustainable Practice',
    desc: 'We are actively reducing our carbon footprint — from eco-friendly packaging to responsible sourcing of materials.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 0 1-1.161.886l-.143.048a1.107 1.107 0 0 0-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 0 1-1.652.928l-.679-.906a1.125 1.125 0 0 0-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 0 0-8.862 12.872M12.75 3.031a9 9 0 0 1 6.69 14.036m0 0-.177-.529A2.249 2.249 0 0 0 17.128 15H16.5l-.324-.324a1.453 1.453 0 0 0-2.328.377l-.036.073a1.586 1.586 0 0 1-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643" />
      </svg>
    ),
  },
  {
    title: 'Affordable Fashion',
    desc: 'Looking good should not cost a fortune. We keep our prices mid-range without ever cutting corners on quality.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185ZM9.75 9h.008v.008H9.75V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    ),
  },
]

const STATS = [
  { value: '50,000+', label: 'Happy Customers' },
  { value: '200+', label: 'Styles Available' },
  { value: '4.6 / 5', label: 'Average Rating' },
  { value: '2024', label: 'Founded' },
]

export default function About() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* Hero */}
      <section className="relative bg-[#111111] text-white overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&q=80"
          alt="CoolBros About"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-4">Our Story</p>
          <h1 className="text-5xl sm:text-6xl font-black leading-none mb-6" style={{ letterSpacing: '-0.03em' }}>
            Made in India.<br />
            <span className="text-transparent" style={{ WebkitTextStroke: '2px white' }}>Worn Everywhere.</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            CoolBros was born from one simple idea — everyone deserves to look good without paying too much. We are a homegrown Indian brand built on quality, style and community.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map(stat => (
            <div key={stat.label}>
              <p className="text-3xl font-black text-gray-900 mb-1" style={{ letterSpacing: '-0.02em' }}>{stat.value}</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>


      {/* Values */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 mb-3">What drives us</p>
            <h2 className="text-3xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>Our Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map(val => (
              <div key={val.title} className="flex gap-4 p-5 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-[#111111] flex items-center justify-center text-white shrink-0">
                  {val.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{val.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#111111] py-16 px-4 text-center text-white">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-4">Join the community</p>
        <h2 className="text-4xl font-black mb-4" style={{ letterSpacing: '-0.03em' }}>Ready to Shop?</h2>
        <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">Browse our latest collections and find your next favourite outfit.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/shop" className="bg-white text-black text-sm font-bold uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-gray-200 transition-colors">
            Shop Now
          </Link>
          <Link to="/contact" className="border border-gray-600 text-white text-sm font-bold uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-white hover:text-black transition-colors">
            Contact Us
          </Link>
        </div>
      </section>

    </div>
  )
}
'use client'

import Link from 'next/link'

async function handleCheckout(plan: string) {
  const res = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  })
  const data = await res.json()
  if (data.url) window.location.href = data.url
  else window.location.href = '/api/auth/twitch'
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-500/30 rounded-full px-4 py-2 mb-6 text-sm text-purple-300">
          🔥 Real-time Twitch Chat Analytics
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Feel the Heat<br />of Your Chat
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mb-10">
          AI-powered chat analytics for Twitch streamers. Get real-time hype scores, engagement metrics, and toxicity alerts — directly in OBS.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/register" className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-4 rounded-xl transition-colors">
            Commencer gratuitement →
          </Link>
          <a href="#pricing" className="border border-gray-700 hover:border-gray-500 text-gray-300 font-semibold px-8 py-4 rounded-xl transition-colors">
            Voir les prix
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">Everything you need to understand your chat</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '🔥', title: 'Hype Score', desc: 'AI detects when your chat is going crazy — even with sarcasm and context.' },
            { icon: '🎯', title: 'OBS Widget', desc: 'Drag & drop widget that works in any OBS scene. Your viewers see the heat.' },
            { icon: '🛡️', title: 'Toxicity Alerts', desc: 'Get alerted before things get out of hand. Protect your community.' },
          ].map((f) => (
            <div key={f.title} className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">Simple pricing</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: 'Starter', price: 9, features: ['1 channel', 'Basic analytics', 'OBS widget'], highlight: false },
            { name: 'Pro', price: 19, features: ['5 channels', 'AI analysis', 'Custom widget', 'Discord alerts'], highlight: true },
            { name: 'Agency', price: 49, features: ['Unlimited channels', 'Full API', 'White label', 'Priority support'], highlight: false },
          ].map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-8 border ${plan.highlight ? 'bg-purple-900/20 border-purple-500' : 'bg-gray-900 border-gray-800'}`}>
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold mb-6">${plan.price}<span className="text-lg text-gray-400">/mo</span></div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-gray-300">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(plan.name.toLowerCase())}
                className={`w-full py-3 rounded-xl font-semibold transition-colors ${plan.highlight ? 'bg-purple-600 hover:bg-purple-500' : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                Commencer →
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

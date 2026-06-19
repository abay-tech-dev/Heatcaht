'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [twitchLoading, setTwitchLoading] = useState(false)

  async function handleTwitchLogin() {
    setTwitchLoading(true)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signInWithOAuth({
      provider: 'twitch',
      options: {
        scopes: 'clips:edit user:read:email',
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0e0e10' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold" style={{ color: '#9147ff' }}>🔥 HeatChat</Link>
          <p className="text-gray-400 mt-2">Log in to your account</p>
        </div>

        <div className="rounded-2xl p-8 border space-y-5" style={{ backgroundColor: '#18181b', borderColor: '#2a2a35' }}>

          <button
            onClick={handleTwitchLogin}
            disabled={twitchLoading}
            style={{
              width: '100%', backgroundColor: '#9147ff', color: '#ffffff',
              fontWeight: 700, fontSize: '1rem', padding: '0.875rem',
              borderRadius: '0.75rem', border: 'none',
              cursor: twitchLoading ? 'not-allowed' : 'pointer',
              opacity: twitchLoading ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={e => { if (!twitchLoading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#772ce8' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#9147ff' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
            </svg>
            {twitchLoading ? 'Redirecting...' : 'Sign in with Twitch'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: 1, backgroundColor: '#2a2a35' }} />
            <span style={{ color: '#adadb8', fontSize: '0.8rem' }}>or</span>
            <div style={{ flex: 1, height: 1, backgroundColor: '#2a2a35' }} />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-purple-500"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-purple-500"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm">
            No account yet?{' '}
            <Link href="/register" className="text-purple-400 hover:text-purple-300">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

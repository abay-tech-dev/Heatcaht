'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Register() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twitchUsername, setTwitchUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, twitch_username: twitchUsername }),
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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-purple-400">🔥 HeatChat</Link>
          <p className="text-gray-400 mt-2">Crée ton compte streamer</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-8 border border-gray-800 space-y-5">
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-2">Pseudo Twitch</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500">#</span>
              <input
                type="text"
                value={twitchUsername}
                onChange={e => setTwitchUsername(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-4 py-3 text-white placeholder-gray-500 outline-none focus:border-purple-500"
                placeholder="tonpseudo"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-purple-500"
              placeholder="ton@email.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-purple-500"
              placeholder="8 caractères minimum"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>

          <p className="text-center text-gray-400 text-sm">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Clip {
  id: string
  clip_id: string
  clip_url: string
  thumbnail_url: string | null
  hype_score: number
  created_at: string
}

export default function Rush() {
  const [clips, setClips] = useState<Clip[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/clips')
      .then(r => r.json())
      .then(d => { setClips(d.clips ?? []); setLoading(false) })
  }, [])

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectedClips = clips.filter(c => selected.has(c.id))

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const scoreColor = (s: number) => s >= 70 ? '#ef4444' : s >= 40 ? '#f97316' : '#22c55e'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0e0e10', color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #2a2a35', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#9147ff', textDecoration: 'none' }}>🔥 HeatChat</Link>
          <Link href="/dashboard" style={{ color: '#adadb8', fontSize: '0.875rem', textDecoration: 'none' }}>Dashboard</Link>
          <span style={{ color: '#9147ff', fontSize: '0.875rem', fontWeight: 700 }}>Rush ✂️</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {selected.size > 0 && (
            <button
              onClick={() => {
                selectedClips.forEach(c => window.open(c.clip_url, '_blank'))
              }}
              style={{
                backgroundColor: '#9147ff', color: '#fff', fontWeight: 700,
                padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none',
                cursor: 'pointer', fontSize: '0.875rem',
              }}
            >
              Open {selected.size} clip{selected.size > 1 ? 's' : ''} ↗
            </button>
          )}
          <a href="/api/auth/logout" style={{ color: '#adadb8', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>Log out</a>
        </div>
      </nav>

      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Rush Dashboard ✂️</h1>
          <p style={{ color: '#adadb8', fontSize: '0.95rem' }}>
            All your auto-generated clips from hype moments. Select the best ones to edit.
          </p>
        </div>

        {/* Stats bar */}
        {clips.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total clips', value: clips.length },
              { label: 'Avg hype score', value: Math.round(clips.reduce((a, c) => a + c.hype_score, 0) / clips.length) },
              { label: 'Best hype', value: Math.max(...clips.map(c => c.hype_score)) },
            ].map(({ label, value }) => (
              <div key={label} style={{ backgroundColor: '#18181b', border: '1px solid #2a2a35', borderRadius: '0.75rem', padding: '1.25rem' }}>
                <div style={{ color: '#adadb8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>{label}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#9147ff' }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Clips grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#adadb8' }}>Loading clips...</div>
        ) : clips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', backgroundColor: '#18181b', border: '1px solid #2a2a35', borderRadius: '1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No clips yet</h2>
            <p style={{ color: '#adadb8', marginBottom: '1.5rem' }}>
              Clips are automatically created when your hype score exceeds 75 during a stream.
            </p>
            <Link href="/dashboard" style={{
              backgroundColor: '#9147ff', color: '#fff', fontWeight: 700,
              padding: '0.75rem 1.5rem', borderRadius: '0.75rem', textDecoration: 'none',
            }}>
              Go to Dashboard →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {clips.map(clip => (
              <div
                key={clip.id}
                onClick={() => toggleSelect(clip.id)}
                style={{
                  backgroundColor: '#18181b',
                  border: `2px solid ${selected.has(clip.id) ? '#9147ff' : '#2a2a35'}`,
                  borderRadius: '0.875rem',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, transform 0.1s',
                  transform: selected.has(clip.id) ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: selected.has(clip.id) ? '0 0 20px rgba(145,71,255,0.3)' : 'none',
                }}
              >
                {/* Thumbnail */}
                <div style={{ position: 'relative', aspectRatio: '16/9', backgroundColor: '#0e0e10' }}>
                  {clip.thumbnail_url ? (
                    <img src={clip.thumbnail_url} alt="clip" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🎬</div>
                  )}
                  {/* Hype badge */}
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    backgroundColor: scoreColor(clip.hype_score),
                    color: '#fff', fontWeight: 800, fontSize: '0.75rem',
                    padding: '0.2rem 0.6rem', borderRadius: '9999px',
                  }}>
                    🔥 {clip.hype_score}
                  </div>
                  {/* Selected overlay */}
                  {selected.has(clip.id) && (
                    <div style={{
                      position: 'absolute', inset: 0, backgroundColor: 'rgba(145,71,255,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#9147ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>✓</div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#adadb8', fontSize: '0.75rem' }}>{formatDate(clip.created_at)}</span>
                  </div>
                  <a
                    href={clip.clip_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ color: '#9147ff', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}
                  >
                    Watch on Twitch ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

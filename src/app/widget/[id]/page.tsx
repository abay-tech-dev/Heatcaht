'use client'

import { useState, useEffect, use } from 'react'

export default function Widget({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [hype, setHype] = useState(0)
  const [prevHype, setPrevHype] = useState(0)
  const [emotes, setEmotes] = useState<string[]>([])
  const [flames, setFlames] = useState<{ id: number; x: number }[]>([])

  useEffect(() => {
    if (!id || id === 'undefined' || id === 'demo') return

    async function fetchScore() {
      try {
        const res = await fetch(`/api/widget/score?token=${id}`, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        const newHype = data.hypeScore ?? 0
        setHype((prev) => {
          setPrevHype(prev)
          if (newHype >= 100) {
            setFlames((f) => [
              ...f.slice(-10),
              ...Array.from({ length: 3 }, (_, i) => ({ id: Date.now() + i, x: Math.random() * 90 })),
            ])
          }
          return newHype
        })
        setEmotes(data.topEmotes ?? [])
      } catch {}
    }

    fetchScore()
    const interval = setInterval(fetchScore, 5000)
    return () => clearInterval(interval)
  }, [id])

  useEffect(() => {
    if (flames.length === 0) return
    const t = setTimeout(() => setFlames((f) => f.slice(1)), 1500)
    return () => clearTimeout(t)
  }, [flames])

  // Couleur de la barre : vert → orange → rouge selon le hype
  const barColor =
    hype >= 70 ? '#ef4444' :
    hype >= 40 ? '#f97316' :
    '#22c55e'

  const barGlow =
    hype >= 70 ? 'rgba(239,68,68,0.7)' :
    hype >= 40 ? 'rgba(249,115,22,0.7)' :
    'rgba(34,197,94,0.7)'

  const label =
    hype >= 70 ? '🔥 HOT' :
    hype >= 40 ? '⚡ LIVE' :
    '💀 COLD'

  return (
    <div style={{
      backgroundColor: 'transparent',
      padding: '16px 20px',
      fontFamily: "'Inter', sans-serif",
      minWidth: 320,
      display: 'inline-block',
    }}>
      <div style={{
        position: 'relative',
        background: 'rgba(10,10,15,0.92)',
        border: `1px solid ${barColor}`,
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: `0 0 18px ${barGlow}, 0 0 50px ${barGlow}22`,
        transition: 'border-color 0.6s ease, box-shadow 0.6s ease',
        overflow: 'hidden',
      }}>

        {/* Scanlines */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 10, pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)',
        }} />

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', backgroundColor: '#22c55e',
              boxShadow: '0 0 5px #22c55e', animation: 'blink 2s infinite',
            }} />
            <span style={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' }}>
              Chat Heat
            </span>
          </div>
          <span style={{
            color: barColor, fontSize: 10, fontWeight: 800, letterSpacing: 2,
            textShadow: `0 0 8px ${barColor}`,
            transition: 'color 0.6s, text-shadow 0.6s',
          }}>
            {label}
          </span>
        </div>

        {/* Score + barre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 32, fontWeight: 900, lineHeight: 1, minWidth: 46, textAlign: 'right',
            color: barColor,
            textShadow: `0 0 16px ${barColor}`,
            transition: 'color 0.6s, text-shadow 0.6s',
          }}>
            {hype}
          </span>
          <div style={{ flex: 1 }}>
            {/* Barre principale */}
            <div style={{
              height: 14, backgroundColor: 'rgba(255,255,255,0.07)',
              borderRadius: 7, overflow: 'hidden', position: 'relative',
            }}>
              <div style={{
                height: '100%',
                width: `${hype}%`,
                background: hype >= 70
                  ? 'linear-gradient(90deg, #22c55e, #f97316, #ef4444)'
                  : hype >= 40
                  ? 'linear-gradient(90deg, #22c55e, #f97316)'
                  : '#22c55e',
                borderRadius: 7,
                boxShadow: `0 0 10px ${barGlow}`,
                transition: 'width 1s cubic-bezier(0.4,0,0.2,1), box-shadow 0.6s',
              }} />
            </div>
            {/* Ticks */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
              {[0, 25, 50, 75, 100].map((t) => (
                <span key={t} style={{ color: '#334155', fontSize: 8, fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>
          <span style={{ color: '#334155', fontSize: 10, fontWeight: 600 }}>
            {hype > prevHype ? '▲' : hype < prevHype ? '▼' : '–'}
          </span>
        </div>

        {/* Emotes */}
        {emotes.length > 0 && (
          <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
            {emotes.map((e) => (
              <span key={e} style={{
                backgroundColor: `${barColor}18`,
                border: `1px solid ${barColor}44`,
                color: barColor,
                fontSize: 9, fontWeight: 700,
                padding: '2px 7px', borderRadius: 20,
                letterSpacing: 0.5,
                transition: 'all 0.6s',
              }}>{e}</span>
            ))}
          </div>
        )}

        {/* Flames at 100 */}
        {flames.length > 0 && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, pointerEvents: 'none', height: 60, overflow: 'hidden' }}>
            {flames.map((f) => (
              <span key={f.id} style={{
                position: 'absolute', bottom: 0, left: `${f.x}%`,
                fontSize: 22, animation: 'riseFlame 1.5s ease-out forwards',
              }}>🔥</span>
            ))}
          </div>
        )}

        <style>{`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          @keyframes riseFlame {
            0% { opacity: 1; transform: translateY(0) scale(1); }
            100% { opacity: 0; transform: translateY(-60px) scale(1.8); }
          }
        `}</style>
      </div>
    </div>
  )
}

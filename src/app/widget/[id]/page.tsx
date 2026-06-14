'use client'

import { useState, useEffect } from 'react'

export default function Widget({ params }: { params: { id: string } }) {
  const [hype, setHype] = useState(0)
  const [prevHype, setPrevHype] = useState(0)
  const [emotes, setEmotes] = useState<string[]>([])
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([])
  const [pulse, setPulse] = useState(false)
  const [ready, setReady] = useState(false)

  // Récupère les vrais scores depuis Supabase toutes les 10 secondes
  useEffect(() => {
    async function fetchScore() {
      try {
        const res = await fetch(`/api/widget/score?token=${params.id}`)
        if (!res.ok) return
        const data = await res.json()
        const newHype = data.hypeScore ?? 0
        setPrevHype((prev) => {
          if (newHype > prev + 3) {
            setPulse(true)
            setTimeout(() => setPulse(false), 600)
            setParticles((p) => [
              ...p.slice(-6),
              { id: Date.now(), x: Math.random() * 180, y: Math.random() * 40 },
            ])
          }
          return prev
        })
        setHype(newHype)
        setEmotes(data.topEmotes ?? [])
        setReady(true)
      } catch {}
    }
    fetchScore()
    const interval = setInterval(fetchScore, 10000)
    return () => clearInterval(interval)
  }, [params.id])

  useEffect(() => {
    if (particles.length === 0) return
    const t = setTimeout(() => setParticles((p) => p.slice(1)), 1200)
    return () => clearTimeout(t)
  }, [particles])

  const isHot = hype >= 70
  const isMid = hype >= 40 && hype < 70
  const neonColor = isHot ? '#a855f7' : isMid ? '#eab308' : '#ef4444'
  const glowColor = isHot ? 'rgba(168,85,247,0.6)' : isMid ? 'rgba(234,179,8,0.6)' : 'rgba(239,68,68,0.6)'
  const label = isHot ? '🔥 HYPE' : isMid ? '⚡ LIVE' : '💀 DEAD'

  return (
    <div style={{ backgroundColor: 'transparent', minHeight: '100vh', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', padding: 20, fontFamily: "'Inter', sans-serif" }}>
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(10,10,15,0.95) 0%, rgba(20,10,35,0.95) 100%)',
        border: `1px solid ${neonColor}`,
        borderRadius: 12,
        padding: '14px 18px',
        minWidth: 220,
        boxShadow: `0 0 20px ${glowColor}, 0 0 60px ${glowColor}30, inset 0 1px 0 rgba(255,255,255,0.05)`,
        transition: 'box-shadow 0.5s ease, border-color 0.5s ease',
        overflow: 'hidden',
      }}>

        {/* Scan line effect */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)',
          pointerEvents: 'none', borderRadius: 12,
        }} />

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e',
              boxShadow: '0 0 6px #22c55e',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
              Chat Heat
            </span>
          </div>
          <span style={{
            color: neonColor, fontSize: 11, fontWeight: 800, letterSpacing: 2,
            textShadow: `0 0 10px ${neonColor}`,
            transition: 'color 0.5s ease',
          }}>
            {label}
          </span>
        </div>

        {/* Score */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 10 }}>
          <div style={{
            fontSize: 52, fontWeight: 900, lineHeight: 1,
            color: neonColor,
            textShadow: `0 0 20px ${neonColor}, 0 0 40px ${glowColor}`,
            transition: 'color 0.5s ease, text-shadow 0.5s ease',
            transform: pulse ? 'scale(1.1)' : 'scale(1)',
            transformOrigin: 'left bottom',
            transitionProperty: 'color, text-shadow, transform',
            transitionDuration: pulse ? '0.1s' : '0.3s',
          }}>
            {hype}
          </div>
          <div style={{ paddingBottom: 8 }}>
            <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>/100</div>
            <div style={{
              color: hype > prevHype ? '#22c55e' : '#ef4444',
              fontSize: 11, fontWeight: 700,
              transition: 'color 0.3s',
            }}>
              {hype > prevHype ? '▲' : '▼'} {Math.abs(hype - prevHype)}
            </div>
          </div>

          {/* Particles */}
          <div style={{ position: 'absolute', top: 40, left: 18, pointerEvents: 'none' }}>
            {particles.map((p) => (
              <div key={p.id} style={{
                position: 'absolute', left: p.x, top: p.y,
                fontSize: 14, animation: 'floatUp 1.2s ease-out forwards',
              }}>✨</div>
            ))}
          </div>
        </div>

        {/* Bar */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${hype}%`,
              background: `linear-gradient(90deg, ${neonColor}88, ${neonColor})`,
              borderRadius: 3,
              boxShadow: `0 0 10px ${neonColor}`,
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1), background 0.5s ease, box-shadow 0.5s ease',
            }} />
          </div>
        </div>

        {/* Emotes */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {emotes.map((e, i) => (
            <span key={e} style={{
              backgroundColor: `${neonColor}18`,
              border: `1px solid ${neonColor}44`,
              color: neonColor,
              fontSize: 10, fontWeight: 700,
              padding: '2px 8px', borderRadius: 20,
              letterSpacing: 0.5,
              boxShadow: `0 0 6px ${neonColor}30`,
              transition: 'all 0.5s ease',
            }}>{e}</span>
          ))}
        </div>

        <style>{`
          @keyframes floatUp {
            0% { opacity: 1; transform: translateY(0) scale(1); }
            100% { opacity: 0; transform: translateY(-40px) scale(1.5); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </div>
    </div>
  )
}

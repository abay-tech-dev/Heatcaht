'use client'

import { useState, useEffect } from 'react'

export default function Widget() {
  const [hype, setHype] = useState(72)
  const [emotes] = useState(['POGGERS', 'W', 'LUL'])

  useEffect(() => {
    const interval = setInterval(() => {
      setHype((prev) => Math.min(100, Math.max(0, prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5))))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const barColor = hype >= 70 ? '#a855f7' : hype >= 40 ? '#eab308' : '#ef4444'

  return (
    <div style={{ backgroundColor: 'transparent', minHeight: '100vh', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', padding: 16 }}>
      <div style={{
        backgroundColor: 'rgba(15, 15, 20, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        borderRadius: 16,
        padding: '16px 20px',
        minWidth: 200,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 20 }}>🔥</span>
          <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14, fontFamily: 'sans-serif' }}>Chat Heat</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ flex: 1, height: 8, backgroundColor: '#1f2937', borderRadius: 4 }}>
            <div style={{ width: `${hype}%`, height: 8, backgroundColor: barColor, borderRadius: 4, transition: 'all 1s ease' }} />
          </div>
          <span style={{ color: barColor, fontWeight: 800, fontSize: 18, fontFamily: 'sans-serif', minWidth: 36 }}>{hype}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {emotes.map((e) => (
            <span key={e} style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', fontSize: 11, padding: '2px 8px', borderRadius: 12, fontFamily: 'sans-serif' }}>{e}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'

const CHAT_SEQUENCE = [
  { user: 'Faker_Fan99',    text: 'let him cook...',               delay: 0,    hype: 8  },
  { user: 'LolViewer22',   text: 'this game is so boring lol',    delay: 1200, hype: 6  },
  { user: 'xX_ADC_Xx',    text: 'bro is 0/3 already lmao',       delay: 2200, hype: 5  },
  { user: 'StreamLurker',  text: 'WAIT',                          delay: 3100, hype: 12 },
  { user: 'PogChamp2024',  text: 'he found the angle',            delay: 3600, hype: 18 },
  { user: 'ChatGoat',      text: 'PENTAKILL INCOMING??',          delay: 4000, hype: 28 },
  { user: 'HypeTrainer',   text: 'LETS GOOOOO',                   delay: 4300, hype: 42 },
  { user: 'RegularViewer', text: 'POGGERS POGGERS POGGERS',       delay: 4600, hype: 55 },
  { user: 'TwitchFan',     text: 'W W W W W W W W W',            delay: 4900, hype: 64 },
  { user: 'xX_ADC_Xx',    text: 'CRACKED BRO ABSOLUTELY CRACKED',delay: 5100, hype: 73 },
  { user: 'StreamLurker',  text: 'KEKW KEKW KEKW',               delay: 5300, hype: 79 },
  { user: 'Faker_Fan99',   text: 'GOAT GOAT GOAT GOAT',          delay: 5500, hype: 85 },
  { user: 'LolViewer22',   text: 'INSANE PLAY OMG OMG',          delay: 5700, hype: 91 },
  { user: 'ChatGoat',      text: 'PENTAKILL !!!!!!!',             delay: 5900, hype: 97 },
  { user: 'PogChamp2024',  text: '🔥🔥🔥🔥🔥🔥🔥🔥🔥',           delay: 6100, hype: 100},
  { user: 'HypeTrainer',   text: 'BEST PLAY OF THE YEAR',        delay: 6300, hype: 100},
  { user: 'RegularViewer', text: 'clip that clip that!!',         delay: 6600, hype: 98 },
]

const USER_COLORS = ['#9147ff','#bf94ff','#ff6b6b','#4ecdc4','#ffd93d','#a8e6cf','#ff8b94']

export default function LiveDemo() {
  const [messages, setMessages] = useState<{ user: string; text: string; color: string }[]>([])
  const [hype, setHype] = useState(0)
  const [flames, setFlames] = useState<{ id: number; x: number }[]>([])
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const feedRef = useRef<HTMLDivElement>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  function startDemo() {
    setMessages([])
    setHype(0)
    setFlames([])
    setDone(false)
    setRunning(true)
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    CHAT_SEQUENCE.forEach((msg, i) => {
      const color = USER_COLORS[i % USER_COLORS.length]
      const t = setTimeout(() => {
        setMessages((prev) => [...prev.slice(-30), { user: msg.user, text: msg.text, color }])
        setHype(msg.hype)
        if (msg.hype >= 100) {
          setFlames((f) => [
            ...f.slice(-8),
            ...Array.from({ length: 4 }, (_, j) => ({ id: Date.now() + j, x: Math.random() * 85 })),
          ])
        }
        if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight
        if (i === CHAT_SEQUENCE.length - 1) {
          setTimeout(() => setDone(true), 800)
          setTimeout(() => { setRunning(false) }, 800)
        }
      }, msg.delay)
      timersRef.current.push(t)
    })
  }

  useEffect(() => () => timersRef.current.forEach(clearTimeout), [])

  useEffect(() => {
    if (flames.length === 0) return
    const t = setTimeout(() => setFlames((f) => f.slice(1)), 1600)
    return () => clearTimeout(t)
  }, [flames])

  const barColor = hype >= 70 ? '#ef4444' : hype >= 40 ? '#f97316' : hype >= 10 ? '#22c55e' : '#334155'
  const barGlow  = hype >= 70 ? 'rgba(239,68,68,0.6)' : hype >= 40 ? 'rgba(249,115,22,0.6)' : 'rgba(34,197,94,0.4)'
  const label    = hype >= 70 ? '🔥 HOT' : hype >= 40 ? '⚡ LIVE' : hype >= 10 ? '✅ ACTIVE' : '💀 COLD'

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem',
      background: '#0e0e10',
    }}>
      {/* Chat panel */}
      <div style={{
        backgroundColor: '#18181b', border: '1px solid #2a2a35',
        borderRadius: '0.875rem', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        minHeight: 380,
      }}>
        {/* Header */}
        <div style={{
          padding: '0.75rem 1rem', borderBottom: '1px solid #2a2a35',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f97316' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }} />
          <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#adadb8', fontWeight: 600 }}>
            #faker_stream — League of Legends
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 4px #ef4444' }} />
            <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700 }}>LIVE</span>
          </div>
        </div>

        {/* Messages */}
        <div ref={feedRef} style={{
          flex: 1, overflowY: 'auto', padding: '0.75rem 1rem',
          display: 'flex', flexDirection: 'column', gap: '0.4rem',
        }}>
          {messages.length === 0 && (
            <p style={{ color: '#3a3a4a', fontSize: '0.8rem', textAlign: 'center', marginTop: '4rem' }}>
              Press "Launch demo" to see the magic ✨
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ fontSize: '0.825rem', lineHeight: 1.5 }}>
              <span style={{ color: m.color, fontWeight: 700 }}>{m.user}: </span>
              <span style={{ color: '#efeff1' }}>{m.text}</span>
            </div>
          ))}
        </div>

        {/* Launch button */}
        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #2a2a35' }}>
          <button
            onClick={startDemo}
            disabled={running}
            style={{
              width: '100%', padding: '0.6rem', borderRadius: '0.5rem',
              backgroundColor: running ? '#2a2a35' : '#9147ff',
              color: running ? '#6a6a7a' : '#ffffff',
              fontWeight: 700, fontSize: '0.875rem', border: 'none',
              cursor: running ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s',
            }}
          >
            {running ? '⚡ Analyzing chat...' : done ? '🔄 Replay' : '▶ Launch demo'}
          </button>
        </div>
      </div>

      {/* Widget panel */}
      <div style={{
        backgroundColor: '#18181b', border: '1px solid #2a2a35',
        borderRadius: '0.875rem', padding: '1.5rem',
        display: 'flex', flexDirection: 'column', gap: '1.25rem',
      }}>
        <div style={{ fontSize: '0.75rem', color: '#adadb8', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          OBS Widget Preview
        </div>

        {/* Widget card */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(10,10,15,0.98) 0%, rgba(20,10,35,0.98) 100%)',
          border: `1px solid ${hype > 0 ? barColor : '#2a2a35'}`,
          borderRadius: '0.75rem', padding: '1rem 1.25rem',
          boxShadow: hype > 0 ? `0 0 20px ${barGlow}, 0 0 50px ${barGlow}30` : 'none',
          transition: 'border-color 0.5s, box-shadow 0.5s',
          overflow: 'hidden',
          minHeight: 120,
        }}>
          {/* Scanlines */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '0.75rem', pointerEvents: 'none',
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)',
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 5px #22c55e' }} />
              <span style={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' }}>Chat Heat</span>
            </div>
            <span style={{ color: hype > 0 ? barColor : '#334155', fontSize: 10, fontWeight: 800, letterSpacing: 2, textShadow: hype > 0 ? `0 0 8px ${barColor}` : 'none', transition: 'all 0.5s' }}>
              {label}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: 30, fontWeight: 900, minWidth: 42, textAlign: 'right',
              color: hype > 0 ? barColor : '#334155',
              textShadow: hype > 0 ? `0 0 16px ${barColor}` : 'none',
              transition: 'all 0.5s',
            }}>{hype}</span>
            <div style={{ flex: 1 }}>
              <div style={{ height: 12, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${hype}%`,
                  background: hype >= 70
                    ? 'linear-gradient(90deg, #22c55e, #f97316, #ef4444)'
                    : hype >= 40 ? 'linear-gradient(90deg, #22c55e, #f97316)'
                    : '#22c55e',
                  borderRadius: 6,
                  boxShadow: hype > 0 ? `0 0 10px ${barGlow}` : 'none',
                  transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1), box-shadow 0.5s',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                {[0,25,50,75,100].map(t => (
                  <span key={t} style={{ color: '#2a2a35', fontSize: 8, fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Flames */}
          {flames.length > 0 && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, pointerEvents: 'none', overflow: 'hidden' }}>
              {flames.map((f) => (
                <span key={f.id} style={{
                  position: 'absolute', bottom: 0, left: `${f.x}%`,
                  fontSize: 18, animation: 'riseFlame 1.6s ease-out forwards',
                }}>🔥</span>
              ))}
            </div>
          )}
        </div>

        {/* Score breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            { label: '🔥 Hype',       value: hype,                       color: '#9147ff' },
            { label: '🎯 Engagement', value: Math.min(100, Math.round(hype * 0.85)), color: '#4ecdc4' },
            { label: '☠️ Toxicity',   value: Math.max(0, Math.round((100 - hype) * 0.08)), color: '#ef4444' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.75rem', color: '#adadb8', fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: '0.75rem', color, fontWeight: 700 }}>{value}</span>
              </div>
              <div style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${value}%`,
                  backgroundColor: color, borderRadius: 2,
                  transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes riseFlame {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-55px) scale(1.8); }
        }
      `}</style>
    </div>
  )
}

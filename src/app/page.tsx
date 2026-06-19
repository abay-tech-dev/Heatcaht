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
    <main style={{ backgroundColor: '#0e0e10', minHeight: '100vh', color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>

      {/* Hero */}
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '0 1rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          backgroundColor: 'rgba(145, 71, 255, 0.15)',
          border: '1px solid rgba(145, 71, 255, 0.4)',
          borderRadius: '9999px', padding: '0.4rem 1rem',
          marginBottom: '1.5rem', fontSize: '0.875rem', color: '#bf94ff',
          fontWeight: 600, letterSpacing: '0.02em'
        }}>
          🔥 Accès Bêta Limité
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 7vw, 5rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #9147ff 0%, #ff4ecd 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em'
        }}>
          Feel the Heat<br />of Your Chat
        </h1>

        <p style={{ fontSize: '1.125rem', color: '#adadb8', maxWidth: '38rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
          Analytics IA en temps réel pour streamers Twitch. Score de hype, engagement, toxicité — directement dans OBS.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/register" style={{
            backgroundColor: '#9147ff',
            color: '#ffffff',
            fontWeight: 700,
            padding: '0.875rem 2rem',
            borderRadius: '0.75rem',
            textDecoration: 'none',
            fontSize: '1rem',
            transition: 'background-color 0.15s ease',
            display: 'inline-block',
          }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#772ce8')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#9147ff')}
          >
            Essayer gratuitement →
          </Link>
          <a href="#pricing" style={{
            border: '1px solid #2a2a35',
            color: '#adadb8',
            fontWeight: 600,
            padding: '0.875rem 2rem',
            borderRadius: '0.75rem',
            textDecoration: 'none',
            fontSize: '1rem',
            transition: 'border-color 0.15s ease, color 0.15s ease',
            display: 'inline-block',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#9147ff'; e.currentTarget.style.color = '#ffffff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a35'; e.currentTarget.style.color = '#adadb8' }}
          >
            Voir l&apos;offre
          </a>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '6rem 1rem', maxWidth: '72rem', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 700, textAlign: 'center', marginBottom: '4rem', color: '#ffffff' }}>
          Tout ce qu&apos;il vous faut pour comprendre votre chat
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: '🔥', title: 'Hype Score', desc: "L'IA détecte quand votre chat s'emballe — même avec le sarcasme et le contexte." },
            { icon: '🎯', title: 'Widget OBS', desc: "Widget drag & drop qui fonctionne dans n'importe quelle scène OBS. Vos viewers voient la chaleur." },
            { icon: '🛡️', title: 'Alertes Toxicité', desc: 'Soyez alerté avant que les choses dégénèrent. Protégez votre communauté.' },
          ].map((f) => (
            <div key={f.title} style={{
              backgroundColor: '#18181b',
              borderRadius: '1rem',
              padding: '2rem',
              border: '1px solid #2a2a35',
              transition: 'border-color 0.15s ease',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#9147ff')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a35')}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>{f.title}</h3>
              <p style={{ color: '#adadb8', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '6rem 1rem', maxWidth: '36rem', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.75rem', color: '#ffffff' }}>
          Une offre simple
        </h2>
        <p style={{ color: '#adadb8', marginBottom: '3rem', fontSize: '1rem' }}>
          Accès complet, une seule fois, pour toujours.
        </p>

        <div style={{
          backgroundColor: '#18181b',
          border: '2px solid #9147ff',
          borderRadius: '1.25rem',
          padding: '2.5rem',
          boxShadow: '0 0 40px rgba(145, 71, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Purple glow accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg, #9147ff, #ff4ecd)',
          }} />

          <div style={{
            display: 'inline-block',
            backgroundColor: 'rgba(145, 71, 255, 0.2)',
            color: '#bf94ff',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            border: '1px solid rgba(145, 71, 255, 0.4)',
            marginBottom: '1.5rem',
          }}>
            Offre limitée
          </div>

          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            Accès Bêta
          </h3>

          <div style={{ margin: '1.5rem 0', lineHeight: 1 }}>
            <span style={{ fontSize: '3.5rem', fontWeight: 800, color: '#ffffff' }}>$4</span>
            <span style={{ color: '#adadb8', fontSize: '1rem', marginLeft: '0.4rem' }}>paiement unique</span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', textAlign: 'left' }}>
            {[
              'Widget OBS temps réel',
              'Score de hype IA',
              'Détection de toxicité',
              'Accès à vie au prix bêta',
            ].map((feature) => (
              <li key={feature} style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                color: '#efeff1', padding: '0.5rem 0',
                borderBottom: '1px solid #2a2a35',
                fontSize: '0.95rem',
              }}>
                <span style={{ color: '#9147ff', fontWeight: 700, fontSize: '1rem' }}>✓</span>
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleCheckout('beta')}
            style={{
              width: '100%',
              backgroundColor: '#9147ff',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1rem',
              padding: '1rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease, transform 0.1s ease',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#772ce8'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#9147ff'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}
          >
            Obtenir l&apos;accès bêta →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '2rem 1rem 3rem', color: '#adadb8', fontSize: '0.875rem' }}>
        © 2024 HeatChat
      </footer>
    </main>
  )
}

'use client'

export default function Contact() {
  return (
    <main style={{ backgroundColor: '#0e0e10', minHeight: '100vh', color: '#ffffff', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{
        backgroundColor: '#18181b',
        border: '1px solid #2a2a35',
        borderRadius: '1.25rem',
        padding: '3rem 2.5rem',
        maxWidth: '32rem',
        width: '100%',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💬</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: '#ffffff' }}>
          Contact us
        </h1>
        <p style={{ color: '#adadb8', lineHeight: 1.7, marginBottom: '2rem' }}>
          An issue with the widget, your account, or your payment? Write to us directly, we respond quickly.
        </p>

        <a
          href="mailto:anthonybay.perso@gmail.com"
          style={{
            display: 'inline-block',
            backgroundColor: '#9147ff',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '1rem',
            padding: '0.875rem 2rem',
            borderRadius: '0.75rem',
            textDecoration: 'none',
            transition: 'background-color 0.15s ease',
            marginBottom: '1.5rem',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#772ce8')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#9147ff')}
        >
          anthonybay.perso@gmail.com
        </a>

        <div style={{ borderTop: '1px solid #2a2a35', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
          <p style={{ color: '#adadb8', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Usual response time: <strong style={{ color: '#efeff1' }}>under 24h</strong>
          </p>
        </div>
      </div>

      <a href="/" style={{ marginTop: '1.5rem', color: '#adadb8', fontSize: '0.875rem', textDecoration: 'none' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
        onMouseLeave={e => (e.currentTarget.style.color = '#adadb8')}
      >
        ← Back to home
      </a>
    </main>
  )
}

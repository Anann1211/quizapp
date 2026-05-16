import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    let error
    if (mode === 'login') {
      ({ error } = await supabase.auth.signInWithPassword({ email, password }))
    } else {
      ({ error } = await supabase.auth.signUp({ email, password }))
      if (!error) setMsg('Kiểm tra email để xác nhận tài khoản!')
    }
    if (error) setMsg(error.message)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 600, height: 600,
        background: 'radial-gradient(ellipse, rgba(74,158,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="animate-fade-up" style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            marginBottom: 32
          }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, rgba(74,158,255,0.3), rgba(139,92,246,0.3))',
              border: '1px solid rgba(74,158,255,0.3)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16
            }}>✦</div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', fontWeight: 500, letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.9)' }}>
              bloom academy
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 600, marginBottom: 8, letterSpacing: '-0.03em' }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif" }}>
            {mode === 'login' ? 'Sign in to continue learning' : 'Start your learning journey'}
          </p>
        </div>

        {/* Form panel */}
        <div className="glass-strong" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginBottom: 8, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Email
              </label>
              <input
                type="email" required placeholder="your@email.com"
                value={email} onChange={e => setEmail(e.target.value)}
                className="input-glass"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginBottom: 8, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Password
              </label>
              <input
                type="password" required placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                className="input-glass"
              />
            </div>

            {msg && (
              <div style={{
                padding: '10px 14px',
                background: msg.includes('email') ? 'rgba(74,158,255,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${msg.includes('email') ? 'rgba(74,158,255,0.2)' : 'rgba(239,68,68,0.2)'}`,
                borderRadius: 10,
                fontSize: '0.85rem',
                color: msg.includes('email') ? 'rgba(147,210,255,0.9)' : 'rgba(252,165,165,0.9)'
              }}>
                {msg}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                marginTop: 8,
                padding: '13px',
                background: loading ? 'rgba(74,158,255,0.1)' : 'rgba(74,158,255,0.15)',
                border: '1px solid rgba(74,158,255,0.3)',
                borderRadius: 100,
                color: 'rgba(255,255,255,0.9)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.95rem',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => !loading && (e.target.style.background = 'rgba(74,158,255,0.22)')}
              onMouseLeave={e => !loading && (e.target.style.background = 'rgba(74,158,255,0.15)')}
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 24, paddingTop: 24, textAlign: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMsg('') }}
              style={{
                fontSize: '0.875rem',
                color: 'rgba(74,158,255,0.85)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500
              }}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

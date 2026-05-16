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
      ({ error } = await supabase.auth.signInWithPassword({
        email,
        password
      }))
    } else {
      ({ error } = await supabase.auth.signUp({
        email,
        password
      }))

      if (!error) {
        setMsg('Kiểm tra email để xác nhận tài khoản!')
      }
    }

    if (error) setMsg(error.message)

    setLoading(false)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        zIndex: 1
      }}
    >

      {/* AMBIENT GLOW */}
      <div
        style={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700,
          height: 700,
          background:
            'radial-gradient(circle, rgba(91,140,255,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* FLOATING STARS */}
      <div className="stars"></div>

      {/* MAIN PANEL */}
      <div
        className="animate-fade-up"
        style={{
          width: '100%',
          maxWidth: 420,
          position: 'relative',
          zIndex: 2
        }}
      >

        {/* LOGO */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 40
          }}
        >

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 32
            }}
          >

            <div
              style={{
                width: 42,
                height: 42,
                background:
                  'linear-gradient(135deg, rgba(91,140,255,0.35), rgba(123,92,255,0.35))',
                border: '1px solid rgba(91,140,255,0.35)',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                boxShadow: '0 0 25px rgba(91,140,255,0.25)'
              }}
            >
              ✦
            </div>

            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1rem',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: 'rgba(255,255,255,0.92)'
              }}
            >
              bloom academy
            </span>

          </div>

          <h1
            style={{
              fontSize: '1.8rem',
              fontWeight: 700,
              marginBottom: 10,
              letterSpacing: '-0.03em',
              color: '#fff'
            }}
          >
            {mode === 'login'
              ? 'Welcome back'
              : 'Create account'}
          </h1>

          <p
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.92rem',
              fontFamily: "'DM Sans', sans-serif"
            }}
          >
            {mode === 'login'
              ? 'Sign in to continue learning'
              : 'Start your learning journey'}
          </p>

        </div>

        {/* FORM PANEL */}
        <div
          className="glass-strong ai-panel"
          style={{
            padding: '34px'
          }}
        >

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 18
            }}
          >

            {/* EMAIL */}
            <div>

              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  color: 'rgba(255,255,255,0.45)',
                  marginBottom: 8,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
              >
                Email
              </label>

              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-glass ai-input"
              />

            </div>

            {/* PASSWORD */}
            <div>

              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  color: 'rgba(255,255,255,0.45)',
                  marginBottom: 8,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
              >
                Password
              </label>

              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-glass ai-input"
              />

            </div>

            {/* MESSAGE */}
            {msg && (
              <div
                style={{
                  padding: '12px 14px',
                  background: msg.includes('email')
                    ? 'rgba(91,140,255,0.08)'
                    : 'rgba(239,68,68,0.08)',

                  border: `1px solid ${
                    msg.includes('email')
                      ? 'rgba(91,140,255,0.25)'
                      : 'rgba(239,68,68,0.25)'
                  }`,

                  borderRadius: 12,

                  fontSize: '0.85rem',

                  color: msg.includes('email')
                    ? 'rgba(180,220,255,0.95)'
                    : 'rgba(255,170,170,0.95)'
                }}
              >
                {msg}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="ai-button"
              style={{
                marginTop: 8,
                padding: '14px',
                background:
                  'linear-gradient(135deg,#5b8cff,#7b5cff)',

                border:
                  '1px solid rgba(91,140,255,0.35)',

                borderRadius: 100,

                color: '#fff',

                fontFamily:
                  "'DM Sans', sans-serif",

                fontSize: '0.96rem',

                fontWeight: 600,

                cursor: loading
                  ? 'not-allowed'
                  : 'pointer',

                transition: '0.3s ease',

                position: 'relative',

                overflow: 'hidden'
              }}
            >
              {loading
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
            </button>

          </form>

          {/* SWITCH MODE */}
          <div
            style={{
              borderTop:
                '1px solid rgba(255,255,255,0.06)',

              marginTop: 28,

              paddingTop: 24,

              textAlign: 'center'
            }}
          >

            <span
              style={{
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.35)'
              }}
            >
              {mode === 'login'
                ? "Don't have an account? "
                : 'Already have an account? '}
            </span>

            <button
              onClick={() => {
                setMode(
                  mode === 'login'
                    ? 'signup'
                    : 'login'
                )

                setMsg('')
              }}
              style={{
                fontSize: '0.875rem',

                color:
                  'rgba(91,140,255,0.95)',

                background: 'none',

                border: 'none',

                cursor: 'pointer',

                fontFamily:
                  "'DM Sans', sans-serif",

                fontWeight: 600
              }}
            >
              {mode === 'login'
                ? 'Sign up'
                : 'Sign in'}
            </button>

          </div>

        </div>

      </div>

      {/* FLOATING ASTRONAUT */}
      <img
        src="/assets/astronaut.png"
        alt="astronaut"
        className="astronaut"
      />

    </div>
  )
}

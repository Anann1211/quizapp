import { useState } from 'react'

export default function Flashcard({ questions, onFinish }) {
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState([])

  const q = questions[current]

  function mark(isKnown) {
    const newKnown = [...known, isKnown]
    if (current + 1 < questions.length) {
      setKnown(newKnown)
      setCurrent(current + 1)
      setFlipped(false)
    } else {
      onFinish({ correct: newKnown.filter(Boolean).length, total: questions.length, answered: newKnown })
    }
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px', position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)' }}>
          {current + 1} <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span> {questions.length}
        </span>
        <span style={{
          padding: '3px 12px', borderRadius: 100,
          background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
          fontSize: '0.775rem', color: 'rgba(253,230,138,0.8)'
        }}>Flashcard</span>
      </div>

      <div className="progress-track" style={{ marginBottom: 40 }}>
        <div className="progress-fill" style={{ width: `${(current / questions.length) * 100}%` }} />
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        style={{
          cursor: 'pointer',
          minHeight: 220,
          padding: '48px 40px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
          borderRadius: 24,
          border: `1px solid ${flipped ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
          background: flipped ? 'rgba(74,158,255,0.06)' : 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          transition: 'all 0.3s ease',
          marginBottom: 24
        }}
      >
        <span style={{
          fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20
        }}>
          {flipped ? 'Answer' : 'Question — Tap to reveal'}
        </span>
        <p style={{
          fontFamily: flipped ? "'DM Sans', sans-serif" : "'Space Grotesk', sans-serif",
          fontSize: '1.2rem', fontWeight: flipped ? 400 : 500,
          color: flipped ? 'rgba(147,210,255,0.9)' : 'rgba(255,255,255,0.9)',
          lineHeight: 1.5
        }}>
          {flipped ? q.back : q.front}
        </p>
        {!flipped && (
          <div style={{ marginTop: 20, opacity: 0.2, fontSize: '1.5rem' }}>⊕</div>
        )}
      </div>

      {flipped ? (
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => mark(false)} style={{
            flex: 1, padding: '13px',
            borderRadius: 100,
            border: '1px solid rgba(239,68,68,0.25)',
            background: 'rgba(239,68,68,0.07)',
            color: 'rgba(252,165,165,0.85)',
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', fontWeight: 500,
            cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; e.currentTarget.style.transform = 'none' }}
          >Still learning</button>
          <button onClick={() => mark(true)} style={{
            flex: 1, padding: '13px',
            borderRadius: 100,
            border: '1px solid rgba(16,185,129,0.25)',
            background: 'rgba(16,185,129,0.07)',
            color: 'rgba(110,231,183,0.85)',
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', fontWeight: 500,
            cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.07)'; e.currentTarget.style.transform = 'none' }}
          >Got it ✓</button>
        </div>
      ) : (
        <p style={{ textAlign: 'center', fontSize: '0.825rem', color: 'rgba(255,255,255,0.2)' }}>
          Tap the card to see the answer
        </p>
      )}
    </div>
  )
}

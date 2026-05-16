import { useState } from 'react'

export default function Essay({ questions, onFinish }) {
  const [current, setCurrent] = useState(0)
  const [answer, setAnswer] = useState('')
  const [showSample, setShowSample] = useState(false)
  const [done, setDone] = useState([])

  const q = questions[current]

  function next() {
    const newDone = [...done, { id: q.id, answer }]
    if (current + 1 < questions.length) {
      setDone(newDone)
      setCurrent(current + 1)
      setAnswer('')
      setShowSample(false)
    } else {
      onFinish({ correct: newDone.length, total: questions.length, answered: newDone })
    }
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px', position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)' }}>
          {current + 1} <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span> {questions.length}
        </span>
        <span style={{
          padding: '3px 12px', borderRadius: 100,
          background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
          fontSize: '0.775rem', color: 'rgba(196,181,253,0.8)'
        }}>Essay</span>
      </div>

      <div className="progress-track" style={{ marginBottom: 32 }}>
        <div className="progress-fill" style={{ width: `${(current / questions.length) * 100}%` }} />
      </div>

      <div className="glass" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Question {current + 1}</div>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.05rem', fontWeight: 500, lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>{q.question}</h3>
      </div>

      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        placeholder="Write your answer here..."
        rows={6}
        className="input-glass"
        style={{ marginBottom: 16, padding: '16px' }}
      />

      <button
        onClick={() => setShowSample(!showSample)}
        style={{
          background: 'none', border: 'none',
          color: 'rgba(147,210,255,0.6)', fontSize: '0.875rem',
          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          marginBottom: 16, display: 'block',
          transition: 'color 0.2s'
        }}
        onMouseEnter={e => e.target.style.color = 'rgba(147,210,255,0.9)'}
        onMouseLeave={e => e.target.style.color = 'rgba(147,210,255,0.6)'}
      >
        {showSample ? '↑ Hide hint' : '💡 Show sample answer'}
      </button>

      {showSample && (
        <div style={{
          padding: '16px 20px', borderRadius: 14, marginBottom: 20,
          background: 'rgba(74,158,255,0.06)',
          border: '1px solid rgba(74,158,255,0.15)'
        }}>
          <p style={{ fontSize: '0.775rem', fontWeight: 600, color: 'rgba(147,210,255,0.8)', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Sample Answer</p>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>{q.sample_answer}</p>
        </div>
      )}

      <button
        onClick={next}
        style={{
          width: '100%', padding: '13px',
          background: 'rgba(74,158,255,0.12)',
          border: '1px solid rgba(74,158,255,0.25)',
          borderRadius: 100,
          color: 'rgba(255,255,255,0.9)',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.95rem', fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,158,255,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,158,255,0.12)'; e.currentTarget.style.transform = 'none' }}
      >
        {current + 1 < questions.length ? 'Next Question →' : 'Complete ✦'}
      </button>
    </div>
  )
}

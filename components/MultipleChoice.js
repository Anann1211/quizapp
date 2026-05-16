import { useState } from 'react'

export default function MultipleChoice({ questions, onFinish, onPause }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState([])
  const [showPauseConfirm, setShowPauseConfirm] = useState(false)

  const q = questions[current]
  const isAnswered = selected !== null

  function choose(idx) {
    if (isAnswered) return
    setSelected(idx)
    setAnswered(prev => [...prev, { id: q.id, correct: idx === q.correct }])
  }

  function next() {
    if (current + 1 < questions.length) {
      setCurrent(current + 1)
      setSelected(null)
    } else {
      const correct = answered.filter(a => a.correct).length
      onFinish({ correct, total: questions.length, answered })
    }
  }

  function handlePause() {
    const correct = answered.filter(a => a.correct).length
    onPause({ correct, total: questions.length, answered, current_index: current, answered_count: answered.length })
  }

  function getBtnClass(idx) {
    if (!isAnswered) return 'answer-btn'
    if (idx === q.correct) return 'answer-btn answer-correct'
    if (idx === selected && selected !== q.correct) return 'answer-btn answer-wrong'
    return 'answer-btn'
  }

  const progress = ((current) / questions.length) * 100

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px', position: 'relative', zIndex: 1 }}>
      {/* Pause dialog */}
      {showPauseConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          backdropFilter: 'blur(8px)'
        }}>
          <div className="glass-strong" style={{ width: '100%', maxWidth: 380, padding: 32 }}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Pause session?</h3>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', marginBottom: 28, lineHeight: 1.6 }}>Your progress will be saved to History. You can resume later.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowPauseConfirm(false)} style={{
                flex: 1, padding: '11px', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
              }}>Keep Going</button>
              <button onClick={handlePause} style={{
                flex: 1, padding: '11px', borderRadius: 12,
                border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)',
                color: 'rgba(252,165,165,0.9)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
              }}>Save & Exit</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>
            {current + 1} <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span> {questions.length}
          </span>
          <span style={{
            padding: '3px 10px', borderRadius: 100,
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)',
            fontSize: '0.775rem', color: 'rgba(110,231,183,0.85)'
          }}>
            ✓ {answered.filter(a => a.correct).length} correct
          </span>
        </div>
        <button
          onClick={() => setShowPauseConfirm(true)}
          style={{
            padding: '6px 14px', borderRadius: 100,
            border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
            color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = 'rgba(252,165,165,0.8)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
        >⏸ Pause</button>
      </div>

      {/* Progress */}
      <div className="progress-track" style={{ marginBottom: 32 }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div className="glass" style={{ padding: 28, marginBottom: 16 }}>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Question {current + 1}</div>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.05rem', fontWeight: 500, lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>{q.question}</h3>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {q.options.map((opt, idx) => (
          <button key={idx} onClick={() => choose(idx)} className={getBtnClass(idx)}
            style={{ opacity: isAnswered && idx !== q.correct && idx !== selected ? 0.4 : 1 }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 600,
                background: !isAnswered ? 'rgba(255,255,255,0.06)'
                  : idx === q.correct ? 'rgba(16,185,129,0.2)'
                  : idx === selected ? 'rgba(239,68,68,0.2)'
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${!isAnswered ? 'rgba(255,255,255,0.08)'
                  : idx === q.correct ? 'rgba(16,185,129,0.3)'
                  : idx === selected ? 'rgba(239,68,68,0.3)'
                  : 'rgba(255,255,255,0.06)'}`,
                color: !isAnswered ? 'rgba(255,255,255,0.4)'
                  : idx === q.correct ? 'rgba(110,231,183,0.9)'
                  : idx === selected ? 'rgba(252,165,165,0.9)'
                  : 'rgba(255,255,255,0.2)'
              }}>
                {['A','B','C','D'][idx]}
              </span>
              <span>{opt.replace(/^[A-D]\.\s*/, '')}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Feedback */}
      {isAnswered && (
        <div style={{
          padding: '16px 20px', borderRadius: 14, marginBottom: 16,
          background: selected === q.correct ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
          border: `1px solid ${selected === q.correct ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
        }}>
          <p style={{
            fontWeight: 500, marginBottom: 6, fontSize: '0.9rem',
            color: selected === q.correct ? 'rgba(110,231,183,0.9)' : 'rgba(252,165,165,0.9)'
          }}>
            {selected === q.correct ? '✓ Correct!' : '✗ Not quite'}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
            {selected === q.correct ? q.explanation_correct : q.explanation_wrong}
          </p>
          {selected !== q.correct && (
            <p style={{ fontSize: '0.85rem', color: 'rgba(110,231,183,0.75)', marginTop: 8, lineHeight: 1.5 }}>
              ✓ Correct: {q.options[q.correct]?.replace(/^[A-D]\.\s*/, '')} — {q.explanation_correct}
            </p>
          )}
        </div>
      )}

      {isAnswered && (
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
          {current + 1 < questions.length ? 'Next Question →' : 'View Results ✦'}
        </button>
      )}
    </div>
  )
}

import { useState } from 'react'

export default function ResultScreen({ result, fileConfig, onContinue, onExport, onHome }) {
  const { correct, total } = result
  const score = Math.round((correct / total) * 100)
  const [nextType, setNextType] = useState('multiple_choice')
  const [showOptions, setShowOptions] = useState(false)

  const grade = score >= 80
    ? { label: 'Outstanding', icon: '✦', color: 'rgba(110,231,183,0.9)' }
    : score >= 60
    ? { label: 'Well done', icon: '◉', color: 'rgba(147,210,255,0.9)' }
    : { label: 'Keep practicing', icon: '⊕', color: 'rgba(253,230,138,0.9)' }

  const types = [
    { id: 'multiple_choice', label: 'New Multiple Choice' },
    { id: 'essay', label: 'Essay Questions' },
    { id: 'flashcard', label: 'Flashcard Deck' },
  ]

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '48px 24px', position: 'relative', zIndex: 1 }}>
      {/* Score card */}
      <div className="glass-strong" style={{ padding: '40px 32px', marginBottom: 20, textAlign: 'center' }}>
        <div style={{
          width: 96, height: 96, borderRadius: '50%', margin: '0 auto 24px',
          background: 'rgba(74,158,255,0.08)',
          border: '1px solid rgba(74,158,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.6rem', fontWeight: 700, color: 'rgba(147,210,255,0.95)' }}>{score}%</span>
        </div>
        <div style={{ fontSize: '1.2rem', marginBottom: 4, color: grade.color, fontWeight: 500 }}>
          {grade.icon} {grade.label}
        </div>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>
          You answered <strong style={{ color: 'rgba(255,255,255,0.75)' }}>{correct} of {total}</strong> questions correctly
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { label: 'Total', value: total, color: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.06)', textColor: 'rgba(255,255,255,0.7)' },
            { label: 'Correct', value: correct, color: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.15)', textColor: 'rgba(110,231,183,0.9)' },
            { label: 'Wrong', value: total - correct, color: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.15)', textColor: 'rgba(252,165,165,0.9)' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '16px 8px', borderRadius: 14,
              background: s.color, border: `1px solid ${s.border}`,
              textAlign: 'center'
            }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: s.textColor, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: '0.725rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={() => setShowOptions(!showOptions)}
          style={{
            width: '100%', padding: '13px',
            background: 'rgba(74,158,255,0.12)',
            border: '1px solid rgba(74,158,255,0.25)',
            borderRadius: 100,
            color: 'rgba(255,255,255,0.9)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.95rem', fontWeight: 500,
            cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,158,255,0.2)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,158,255,0.12)' }}
        >↺ Continue Practicing</button>

        {showOptions && (
          <div className="glass" style={{ padding: 20 }}>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 14, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Choose format</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {types.map(t => (
                <label key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  cursor: 'pointer', padding: '10px 12px', borderRadius: 10,
                  background: nextType === t.id ? 'rgba(74,158,255,0.07)' : 'transparent',
                  border: `1px solid ${nextType === t.id ? 'rgba(74,158,255,0.2)' : 'transparent'}`,
                  transition: 'all 0.2s'
                }}>
                  <input type="radio" name="type" value={t.id} checked={nextType === t.id} onChange={() => setNextType(t.id)} />
                  <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', fontFamily: "'DM Sans', sans-serif" }}>{t.label}</span>
                </label>
              ))}
            </div>
            <button onClick={() => onContinue(nextType)} style={{
              width: '100%', padding: '11px',
              background: 'rgba(74,158,255,0.15)', border: '1px solid rgba(74,158,255,0.25)',
              borderRadius: 100, color: 'rgba(255,255,255,0.85)',
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.2s'
            }}>Start →</button>
          </div>
        )}

        <button onClick={onExport} style={{
          width: '100%', padding: '13px',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 100, color: 'rgba(255,255,255,0.55)',
          fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', fontWeight: 400,
          cursor: 'pointer', transition: 'all 0.2s'
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
        >↓ Export Questions (JSON)</button>

        <button onClick={onHome} style={{
          width: '100%', padding: '11px',
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.2)', fontSize: '0.875rem',
          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'color 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
        >Upload new document</button>
      </div>
    </div>
  )
}

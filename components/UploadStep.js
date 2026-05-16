import { useState, useRef } from 'react'

const ACCEPTED = '.pdf,.docx,.txt,.pptx,.png,.jpg,.jpeg,.webp'
const MAX_MB = 20

export default function UploadStep({ onReady }) {
  const [file, setFile] = useState(null)
  const [count, setCount] = useState(10)
  const [type, setType] = useState('multiple_choice')
  const [topic, setTopic] = useState('')
  const [drag, setDrag] = useState(false)
  const inputRef = useRef()

  function pickFile(f) {
    if (!f) return
    if (f.size > MAX_MB * 1024 * 1024) return alert(`File too large! Max ${MAX_MB}MB`)
    setFile(f)
  }

  function handleDrop(e) {
    e.preventDefault(); setDrag(false)
    pickFile(e.dataTransfer.files[0])
  }

  async function handleStart() {
    if (!file) return alert('Please select a document file')
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      onReady({ fileData: base64, fileName: file.name, fileMime: file.type, count, type, topic: topic.trim() })
    }
    reader.readAsDataURL(file)
  }

  const types = [
    { id: 'multiple_choice', label: 'Multiple Choice', icon: '◉', desc: '4 options with explanation' },
    { id: 'essay', label: 'Essay', icon: '✏', desc: 'Open questions, sample answers' },
    { id: 'flashcard', label: 'Flashcard', icon: '⬡', desc: 'Fast Q&A practice' },
  ]

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px', position: 'relative', zIndex: 1 }}>
      {/* Hero section */}
      <div style={{ marginBottom: 56 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {['Interactive Lessons', 'AI Study Assistant', 'Smart Practice'].map(pill => (
            <span key={pill} className="glass-pill">{pill}</span>
          ))}
        </div>
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.04em',
          marginBottom: 24
        }}>
          Transforming the{' '}
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontWeight: 300,
            opacity: 0.7
          }}>future of learning AI</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', maxWidth: 480, lineHeight: 1.7, marginBottom: 28 }}>
          Upload your documents and let AI generate personalized quizzes, flashcards, and study materials in seconds.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => inputRef.current && inputRef.current.click()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '12px 24px',
              background: 'rgba(74,158,255,0.15)',
              border: '1px solid rgba(74,158,255,0.3)',
              borderRadius: 100,
              color: 'rgba(255,255,255,0.9)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.9rem', fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              backdropFilter: 'blur(20px)'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,158,255,0.22)'; e.currentTarget.style.transform = 'scale(1.02) translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(74,158,255,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,158,255,0.15)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
          >
            Start Learning
            <span style={{
              width: 26, height: 26,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12
            }}>↓</span>
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Upload zone */}
          <div
            onClick={() => inputRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            style={{
              background: drag
                ? 'rgba(74,158,255,0.07)'
                : file ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.03)',
              border: `1px dashed ${drag ? 'rgba(74,158,255,0.4)' : file ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 20,
              padding: '40px 32px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(12px)'
            }}
          >
            <input ref={inputRef} type="file" accept={ACCEPTED} style={{ display: 'none' }} onChange={e => pickFile(e.target.files[0])} />
            {file ? (
              <div>
                <div style={{ fontSize: 32, marginBottom: 10 }}>✓</div>
                <p style={{ fontWeight: 500, color: 'rgba(110,231,183,0.9)', marginBottom: 4 }}>{file.name}</p>
                <p style={{ fontSize: '0.825rem', color: 'rgba(110,231,183,0.6)', marginBottom: 12 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button
                  onClick={e => { e.stopPropagation(); setFile(null) }}
                  style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                >Remove file</button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>⬡</div>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.925rem', marginBottom: 6 }}>Drop your document here or click to browse</p>
                <p style={{ fontSize: '0.775rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em' }}>PDF · DOCX · PPTX · TXT · PNG · JPG · WEBP</p>
              </div>
            )}
          </div>

          {/* Topic input */}
          <div className="glass" style={{ padding: 24 }}>
            <label style={{ display: 'block', fontSize: '0.775rem', color: 'rgba(255,255,255,0.4)', marginBottom: 10, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Focus Topic
              <span style={{ marginLeft: 8, fontWeight: 400, letterSpacing: 0, textTransform: 'none', color: 'rgba(255,255,255,0.25)' }}>(optional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: 12, fontSize: '1rem', opacity: 0.4 }}>⊕</span>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Chapter 3 — Photosynthesis, World War II, Quadratic functions..."
                className="input-glass"
                style={{ paddingLeft: 40, paddingRight: topic ? 36 : 16 }}
              />
              {topic && (
                <button onClick={() => setTopic('')} style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1rem' }}>×</button>
              )}
            </div>
            {topic && (
              <p style={{ fontSize: '0.775rem', color: 'rgba(147,210,255,0.7)', marginTop: 8 }}>✦ AI will focus on: <strong>{topic}</strong></p>
            )}
          </div>

          {/* Question count */}
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <label style={{ fontSize: '0.775rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Question Count
              </label>
              <span style={{
                background: 'rgba(74,158,255,0.12)',
                border: '1px solid rgba(74,158,255,0.2)',
                borderRadius: 8,
                padding: '3px 12px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'rgba(147,210,255,0.9)'
              }}>{count}</span>
            </div>
            <input type="range" min={5} max={50} step={5} value={count} onChange={e => setCount(parseInt(e.target.value))} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              {[5, 15, 25, 35, 50].map(n => (
                <span key={n} style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>{n}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right floating panel */}
        <div className="animate-float" style={{ position: 'sticky', top: 80 }}>
          <div className="glass-strong" style={{ padding: 28 }}>
            <p style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.03em',
              marginBottom: 12, lineHeight: 1.3
            }}>Join the learning ecosystem</p>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, marginBottom: 24 }}>
              Explore immersive AI-powered lessons, collaborative study tools, and personalized educational journeys.
            </p>

            {/* Quiz type cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {types.map(t => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 14,
                    border: `1px solid ${type === t.id ? 'rgba(74,158,255,0.35)' : 'rgba(255,255,255,0.06)'}`,
                    background: type === t.id ? 'rgba(74,158,255,0.1)' : 'rgba(255,255,255,0.03)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'flex-start', gap: 12
                  }}
                  onMouseEnter={e => { if (type !== t.id) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' } }}
                  onMouseLeave={e => { if (type !== t.id) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' } }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: type === t.id ? 'rgba(74,158,255,0.15)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${type === t.id ? 'rgba(74,158,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, flexShrink: 0,
                    color: type === t.id ? 'rgba(147,210,255,0.9)' : 'rgba(255,255,255,0.4)'
                  }}>{t.icon}</div>
                  <div>
                    <div style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.875rem', fontWeight: 500,
                      color: type === t.id ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.65)',
                      marginBottom: 2
                    }}>
                      {t.id === 'multiple_choice' ? 'Smart Learning' : t.id === 'essay' ? 'Knowledge Archive' : t.label}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.4 }}>
                      {t.id === 'multiple_choice' ? 'AI-assisted lessons designed to improve focus and understanding.' : t.id === 'essay' ? 'Organize notes, resources, and study materials in one intelligent hub.' : t.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Bottom feature card */}
            <div style={{
              padding: '16px',
              background: 'rgba(74,158,255,0.06)',
              border: '1px solid rgba(74,158,255,0.12)',
              borderRadius: 14,
              marginBottom: 20
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(147,210,255,0.85)', marginBottom: 4 }}>Advanced Study Experience</div>
              <div style={{ fontSize: '0.775rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>Enhance productivity with adaptive learning systems and interactive content.</div>
            </div>

            <button
              onClick={handleStart}
              style={{
                width: '100%', padding: '14px',
                background: 'linear-gradient(135deg, rgba(74,158,255,0.2), rgba(139,92,246,0.15))',
                border: '1px solid rgba(74,158,255,0.25)',
                borderRadius: 100,
                color: 'rgba(255,255,255,0.95)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.95rem', fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                letterSpacing: '-0.01em'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(74,158,255,0.3), rgba(139,92,246,0.25))'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(74,158,255,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(74,158,255,0.2), rgba(139,92,246,0.15))'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              Generate with AI ✦
            </button>
          </div>

          {/* Quote section */}
          <div style={{ padding: '20px 4px', marginTop: 8 }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Educational Vision</div>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>
              "Learning becomes limitless through{' '}
              <em style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 400 }}>intelligence.</em>"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em' }}>BLOOM EDUCATION</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Responsive fix */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

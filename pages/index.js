import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Auth from '../components/Auth'
import UploadStep from '../components/UploadStep'
import MultipleChoice from '../components/MultipleChoice'
import Essay from '../components/Essay'
import Flashcard from '../components/Flashcard'
import ResultScreen from '../components/ResultScreen'

export default function Home({ user }) {
  const router = useRouter()
  const [step, setStep] = useState('upload')
  const [fileConfig, setFileConfig] = useState(null)
  const [questions, setQuestions] = useState([])
  const [quizType, setQuizType] = useState('multiple_choice')
  const [resumeStartIndex, setResumeStartIndex] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [allPrevQuestions, setAllPrevQuestions] = useState([])
  const isSaving = useRef(false)

  useEffect(() => {
    if (!router.isReady || !user) return
    if (router.query.resume !== '1') return
    try {
      const raw = sessionStorage.getItem('resume_session')
      if (!raw) { router.replace('/'); return }
      const session = JSON.parse(raw)
      sessionStorage.removeItem('resume_session')
      const qs = session.questions || []
      if (!qs.length) { router.replace('/'); return }
      const fc = session.file_config || { fileName: 'Tài liệu đã lưu' }
      setQuestions(qs)
      setQuizType(session.quiz_type || 'multiple_choice')
      setFileConfig({ ...fc, type: session.quiz_type || 'multiple_choice' })
      setResumeStartIndex(parseInt(session.current_index) || 0)
      isSaving.current = false
      setStep('quiz')
      router.replace('/', undefined, { shallow: true })
    } catch (e) {
      console.error('Resume error:', e)
      router.replace('/')
    }
  }, [router.isReady, router.query.resume, user])

  if (!user) return <Auth />

  async function doGenerate(config, previousQuestions = []) {
    setStep('loading')
    setError('')
    isSaving.current = false
    setResumeStartIndex(0)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, previousQuestions, topic: config.topic || '' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error generating questions')
      if (!data.questions?.length) throw new Error('AI could not generate questions, please try again')
      setQuestions(data.questions)
      setQuizType(config.type)
      setStep('quiz')
    } catch (e) {
      setError(e.message)
      setStep('upload')
    }
  }

  function handleReady(config) {
    setFileConfig(config)
    setAllPrevQuestions([])
    doGenerate(config, [])
  }

  async function saveSession({ correct, total, completed, current_index, answered_count, answeredMap }) {
    if (isSaving.current) return
    isSaving.current = true
    try {
      const res = await fetch('/api/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          file_name: fileConfig?.fileName || 'Document',
          quiz_type: quizType,
          total,
          correct: correct ?? 0,
          questions,
          completed: completed ?? true,
          current_index: current_index ?? 0,
          answered_count: answered_count ?? total,
          file_config: fileConfig,
          answered_map: answeredMap ?? null
        })
      })
      if (!res.ok) console.error('Save failed:', await res.text())
    } catch(e) {
      console.error('saveSession error:', e)
    } finally {
      isSaving.current = false
    }
  }

  async function handleFinish(res) {
    setResult(res)
    setAllPrevQuestions(prev => [...prev, ...questions.map(q => q.question || q.front)])
    setStep('result')
    await saveSession({ ...res, completed: true })
  }

  async function handlePause(pauseState) {
    isSaving.current = false
    await saveSession({
      correct: pauseState.correct,
      total: pauseState.total,
      completed: false,
      current_index: pauseState.current_index,
      answered_count: pauseState.answered_count,
      answeredMap: pauseState.answeredMap
    })
    setStep('upload')
  }

  function handleContinue(newType) {
    setResumeStartIndex(0)
    doGenerate({ ...fileConfig, type: newType }, allPrevQuestions)
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify({ questions, type: quizType, file: fileConfig?.fileName }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quiz_${fileConfig?.fileName}_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* Navbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(5,8,16,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28,
              background: 'linear-gradient(135deg, rgba(74,158,255,0.3), rgba(139,92,246,0.3))',
              border: '1px solid rgba(74,158,255,0.25)',
              borderRadius: 7,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, color: 'rgba(147,210,255,0.9)'
            }}>✦</div>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.9rem', fontWeight: 500,
              letterSpacing: '-0.01em',
              color: 'rgba(255,255,255,0.85)'
            }}>bloom academy</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => router.push('/history')}
              style={{
                padding: '6px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 100,
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.target.style.color = 'rgba(255,255,255,0.85)'; e.target.style.borderColor = 'rgba(255,255,255,0.12)' }}
              onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.5)'; e.target.style.borderColor = 'rgba(255,255,255,0.07)' }}
            >History</button>
            <button
              onClick={() => supabase.auth.signOut()}
              style={{
                padding: '6px 14px',
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.3)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'color 0.2s'
              }}
              onMouseEnter={e => e.target.style.color = 'rgba(252,165,165,0.8)'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.3)'}
            >Sign out</button>
          </div>
        </div>
      </header>

      {/* Error banner */}
      {error && step === 'upload' && (
        <div style={{ maxWidth: 960, margin: '16px auto', padding: '0 24px' }}>
          <div style={{
            padding: '12px 16px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: '0.875rem',
            color: 'rgba(252,165,165,0.9)'
          }}>
            <span>⚠ {error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'rgba(252,165,165,0.6)', cursor: 'pointer', fontSize: '1rem', marginLeft: 12 }}>✕</button>
          </div>
        </div>
      )}

      {step === 'upload' && <UploadStep onReady={handleReady} />}

      {step === 'loading' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: 'calc(100vh - 60px)', gap: 20
        }}>
          <div style={{
            width: 48, height: 48,
            border: '2px solid rgba(255,255,255,0.06)',
            borderTop: '2px solid rgba(74,158,255,0.6)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', fontWeight: 400 }}>AI is generating questions...</p>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.825rem' }}>Usually takes 10–20 seconds</p>
        </div>
      )}

      {step === 'quiz' && quizType === 'multiple_choice' && (
        <MultipleChoice questions={questions} startIndex={resumeStartIndex} onFinish={handleFinish} onPause={handlePause} />
      )}
      {step === 'quiz' && quizType === 'essay' && (
        <Essay questions={questions} startIndex={resumeStartIndex} onFinish={handleFinish} onPause={handlePause} />
      )}
      {step === 'quiz' && quizType === 'flashcard' && (
        <Flashcard questions={questions} startIndex={resumeStartIndex} onFinish={handleFinish} onPause={handlePause} />
      )}

      {step === 'result' && (
        <ResultScreen
          result={result}
          fileConfig={fileConfig}
          onContinue={handleContinue}
          onExport={handleExport}
          onHome={() => { setStep('upload'); setAllPrevQuestions([]); setResumeStartIndex(0) }}
        />
      )}
    </div>
  )
}

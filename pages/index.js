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
      console.error('Resume lỗi:', e)
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
      if (!res.ok) throw new Error(data.error || 'Lỗi tạo câu hỏi')
      if (!data.questions?.length) throw new Error('AI không tạo được câu hỏi, thử lại')
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
          file_name: fileConfig?.fileName || 'Tài liệu',
          quiz_type: quizType,
          total,
          correct: correct ?? 0,
          questions,
          completed: completed ?? true,
          current_index: current_index ?? 0,
          answered_count: answered_count ?? total,
          file_config: fileConfig,
          answered_map: answeredMap ?? null  // lưu progress chi tiết
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
    // isSaving đã được reset bởi caller nếu cần, ta cũng reset ở đây
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">Q</span>
            </div>
            <span className="font-bold text-gray-800">QuizAI</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/history')} className="text-sm text-gray-500 hover:text-indigo-600 transition">Lịch sử</button>
            <button onClick={() => supabase.auth.signOut()} className="text-sm text-gray-400 hover:text-red-500 transition">Đăng xuất</button>
          </div>
        </div>
      </header>

      {step === 'upload' && (
        <>
          {error && (
            <div className="max-w-2xl mx-auto px-4 pt-4">
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex justify-between items-center">
                <span>⚠️ {error}</span>
                <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-3">✕</button>
              </div>
            </div>
          )}
          <UploadStep onReady={handleReady} />
        </>
      )}

      {step === 'loading' && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">AI đang tạo câu hỏi...</p>
          <p className="text-sm text-gray-400">Thường mất 10–20 giây</p>
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

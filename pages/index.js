import { useState } from 'react'
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
  const [step, setStep] = useState('upload') // upload | loading | quiz | result
  const [fileConfig, setFileConfig] = useState(null)
  const [questions, setQuestions] = useState([])
  const [quizType, setQuizType] = useState('multiple_choice')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [allPrevQuestions, setAllPrevQuestions] = useState([])

  if (!user) return <Auth />

  async function generateQuestions(config, previousQuestions = []) {
    setStep('loading')
    setError('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, previousQuestions })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Lỗi tạo câu hỏi')
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
    generateQuestions(config, [])
  }

  async function handleFinish(res) {
    setResult(res)
    setAllPrevQuestions(prev => [...prev, ...questions.map(q => q.question || q.front)])
    setStep('result')

    if (user) {
      await fetch('/api/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          file_name: fileConfig.fileName,
          quiz_type: quizType,
          total: res.total,
          correct: res.correct,
          questions
        })
      })
    }
  }

  function handleContinue(newType) {
    generateQuestions({ ...fileConfig, type: newType }, allPrevQuestions)
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify({ questions, type: quizType, file: fileConfig.fileName }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quiz_${fileConfig.fileName}_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">Q</span>
            </div>
            <span className="font-bold text-gray-800">QuizAI</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/history')}
              className="text-sm text-gray-500 hover:text-indigo-600 transition">
              Lịch sử
            </button>
            <button onClick={() => supabase.auth.signOut()}
              className="text-sm text-gray-400 hover:text-red-500 transition">
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Steps */}
      {step === 'upload' && (
        <>
          {error && (
            <div className="max-w-2xl mx-auto px-4 pt-4">
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                ⚠️ {error}
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
          <p className="text-sm text-gray-400">Có thể mất 10–30 giây</p>
        </div>
      )}

      {step === 'quiz' && quizType === 'multiple_choice' && (
        <MultipleChoice questions={questions} onFinish={handleFinish} />
      )}
      {step === 'quiz' && quizType === 'essay' && (
        <Essay questions={questions} onFinish={handleFinish} />
      )}
      {step === 'quiz' && quizType === 'flashcard' && (
        <Flashcard questions={questions} onFinish={handleFinish} />
      )}

      {step === 'result' && (
        <ResultScreen
          result={result}
          fileConfig={fileConfig}
          onContinue={handleContinue}
          onExport={handleExport}
          onHome={() => { setStep('upload'); setAllPrevQuestions([]) }}
        />
      )}
    </div>
  )
}

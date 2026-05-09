import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Auth from '../components/Auth'
import UploadStep from '../components/UploadStep'
import MultipleChoice from '../components/MultipleChoice'
import Essay from '../components/Essay'
import Flashcard from '../components/Flashcard'
import ResultScreen from '../components/ResultScreen'

export default function Home() {
  const router = useRouter()
  const { resumeId } = router.query

  const [user, setUser] = useState(null)
  const [step, setStep] = useState('upload') // upload, quiz, result
  const [questions, setQuestions] = useState([])
  const [quizType, setQuizType] = useState('multiple_choice')
  const [result, setResult] = useState(null)
  const [fileConfig, setFileConfig] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // Lưu thông tin bài đang làm dở
  const [resumeData, setResumeData] = useState(null)

  useEffect(() => {
    const session = supabase.auth.getSession()
    session.then(({ data }) => setUser(data.session?.user || null))

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => authListener.subscription.unsubscribe()
  }, [])

  // Xử lý khi có resumeId từ trang Lịch sử
  useEffect(() => {
    if (resumeId && user) {
      handleResume(resumeId)
    }
  }, [resumeId, user])

  async function handleResume(id) {
    setLoading(true)
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      setQuestions(data.questions_json)
      setQuizType(data.quiz_type)
      setFileConfig({ fileName: data.file_name })
      setResumeData({
        id: data.id,
        current_index: data.current_index,
        user_answers: data.user_answers
      })
      setStep('quiz')
    }
    setLoading(false)
  }

  // Hàm lưu tiến độ (Khi bấm Tạm dừng)
  async function handleSaveProgress(progress) {
    try {
      const payload = {
        id: resumeData?.id, // Nếu là bài đang làm tiếp thì truyền ID để Update
        user_id: user.id,
        file_name: fileConfig.fileName,
        quiz_type: quizType,
        total: progress.total,
        correct: progress.correct,
        questions: questions,
        is_finished: false,
        current_index: progress.current_index,
        user_answers: progress.answered
      }

      const res = await fetch('/api/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        router.push('/history')
      }
    } catch (error) {
      alert('Không thể lưu tiến độ: ' + error.message)
    }
  }

  // Hàm hoàn thành bài (Kết thúc bài làm)
  async function handleFinish(finalResult) {
    setResult(finalResult)
    setStep('result')

    try {
      await fetch('/api/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resumeData?.id,
          user_id: user.id,
          file_name: fileConfig.fileName,
          quiz_type: quizType,
          total: finalResult.total,
          correct: finalResult.correct,
          questions: questions,
          is_finished: true,
          current_index: 0,
          user_answers: finalResult.answered
        })
      })
    } catch (error) {
      console.error('Lỗi lưu kết quả:', error)
    }
  }

  if (!user) return <Auth />

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-100 py-4 px-6 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-indigo-600 cursor-pointer" onClick={() => router.push('/')}>
          🚀 QuizAI
        </h1>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/history')} className="text-sm font-medium text-gray-600 hover:text-indigo-600">
            📜 Lịch sử
          </button>
          <button onClick={() => supabase.auth.signOut()} className="text-sm text-red-500">Đăng xuất</button>
        </div>
      </nav>

      <main className="container mx-auto py-10">
        {loading ? (
          <div className="text-center py-20">Đang tải dữ liệu...</div>
        ) : (
          <>
            {step === 'upload' && (
              <UploadStep 
                onSuccess={(data, config) => {
                  setQuestions(data.questions)
                  setFileConfig(config)
                  setQuizType(config.type)
                  setStep('quiz')
                  setResumeData(null) // Bài mới hoàn toàn
                }} 
              />
            )}

            {step === 'quiz' && (
              <>
                {quizType === 'multiple_choice' && (
                  <MultipleChoice 
                    questions={questions} 
                    initialData={resumeData}
                    onSaveProgress={handleSaveProgress}
                    onFinish={handleFinish} 
                  />
                )}
                {quizType === 'essay' && (
                  <Essay 
                    questions={questions} 
                    onFinish={handleFinish} 
                  />
                )}
                {quizType === 'flashcard' && (
                  <Flashcard 
                    questions={questions} 
                    onFinish={handleFinish} 
                  />
                )}
              </>
            )}

            {step === 'result' && (
              <ResultScreen 
                result={result} 
                onHome={() => {
                  setStep('upload')
                  router.push('/')
                }}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}

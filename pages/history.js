import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

const typeLabel = { multiple_choice: 'Trắc nghiệm', essay: 'Tự luận', flashcard: 'Flashcard' }

function QuestionReview({ questions, type }) {
  if (!questions?.length) return <p className="text-sm text-gray-400 py-4 text-center">Không có dữ liệu câu hỏi</p>

  return (
    <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
      {questions.map((q, idx) => (
        <div key={idx} className="bg-gray-50 rounded-xl p-4">
          <p className="font-medium text-gray-800 text-sm mb-3">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold mr-2">{idx + 1}</span>
            {q.question || q.front}
          </p>

          {type === 'multiple_choice' && q.options && (
            <div className="space-y-1.5 mb-3">
              {q.options.map((opt, i) => (
                <div key={i} className={`text-sm px-3 py-2 rounded-lg flex items-center gap-2
                  ${i === q.correct ? 'bg-green-100 text-green-800 font-medium' : 'bg-white text-gray-600 border border-gray-200'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${i === q.correct ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {['A','B','C','D'][i]}
                  </span>
                  {opt.replace(/^[A-D]\.\s*/, '')}
                  {i === q.correct && <span className="ml-auto">✅</span>}
                </div>
              ))}
            </div>
          )}

          {type === 'multiple_choice' && q.explanation_correct && (
            <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 border border-green-200">
              💡 {q.explanation_correct}
            </p>
          )}

          {type === 'essay' && q.sample_answer && (
            <div className="text-xs text-gray-600 bg-indigo-50 rounded-lg px-3 py-2 border border-indigo-200">
              <span className="font-semibold text-indigo-700">Gợi ý: </span>{q.sample_answer}
            </div>
          )}

          {type === 'flashcard' && q.back && (
            <div className="text-sm text-indigo-700 bg-indigo-50 rounded-lg px-3 py-2 border border-indigo-200">
              <span className="font-semibold">Đáp án: </span>{q.back}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function History({ user }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const router = useRouter()

  useEffect(() => {
    if (!user) { router.push('/'); return }
    supabase.from('quiz_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => { setSessions(data || []); setLoading(false) })
  }, [user])

  function toggle(id) {
    setExpanded(prev => prev === id ? null : id)
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Lịch sử bài làm</h1>
        <button onClick={() => router.push('/')}
          className="text-sm text-indigo-600 hover:underline">← Trang chủ</button>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-12">Đang tải...</p>
      ) : sessions.length === 0 ? (
        <p className="text-center text-gray-400 py-12">Chưa có bài làm nào</p>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header — bấm để mở/đóng */}
              <button
                onClick={() => toggle(s.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition text-left"
              >
                <div className="flex-1 min-w-0 mr-3">
                  <p className="font-medium text-gray-800 truncate">{s.file_name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {typeLabel[s.quiz_type]} · {s.correct_answers}/{s.total_questions} câu đúng ·{' '}
                    {new Date(s.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xl font-bold ${s.score >= 80 ? 'text-green-600' : s.score >= 60 ? 'text-indigo-600' : 'text-amber-500'}`}>
                    {s.score}%
                  </span>
                  <span className={`text-gray-400 transition-transform duration-200 ${expanded === s.id ? 'rotate-180' : ''}`}>
                    ▾
                  </span>
                </div>
              </button>

              {/* Expandable question list */}
              {expanded === s.id && (
                <div className="px-4 pb-4">
                  <QuestionReview
                    questions={s.questions_json}
                    type={s.quiz_type}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const typeLabel = { multiple_choice: 'Trắc nghiệm', essay: 'Tự luận', flashcard: 'Flashcard' }

function ProgressDots({ total, answeredMap }) {
  if (!total) return null
  return (
    <div className="flex flex-wrap gap-1 mt-3">
      {Array.from({ length: total }).map((_, i) => {
        const a = answeredMap?.[i]
        return (
          <div key={i} title={`Câu ${i + 1}`}
            className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold
              ${!a ? 'bg-gray-100 text-gray-300 border border-gray-200' :
                a.isCorrect ? 'bg-green-500 text-white' : 'bg-red-400 text-white'}`}>
            {!a ? '·' : a.isCorrect ? '✓' : '✗'}
          </div>
        )
      })}
      <span className="text-xs text-gray-400 self-center ml-1">
        {answeredMap ? `${Object.keys(answeredMap).length}/${total} câu` : `0/${total} câu`}
      </span>
    </div>
  )
}

function QuestionReview({ questions, type, answeredMap }) {
  if (!questions?.length) return (
    <p className="text-sm text-gray-400 py-4 text-center">Không có dữ liệu câu hỏi</p>
  )
  return (
    <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
      {questions.map((q, idx) => {
        const userAnswer = answeredMap?.[idx]
        const notAnswered = !userAnswer
        return (
          <div key={idx} className={`rounded-xl p-4 border
            ${notAnswered ? 'bg-gray-50 border-gray-200' :
              userAnswer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-300'}`}>
            <div className="flex items-start gap-2 mb-3">
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 mt-0.5
                ${notAnswered ? 'bg-gray-200 text-gray-500' :
                  userAnswer.isCorrect ? 'bg-green-500 text-white' : 'bg-red-400 text-white'}`}>
                {notAnswered ? idx + 1 : userAnswer.isCorrect ? '✓' : '✗'}
              </span>
              <p className="font-medium text-gray-800 text-sm leading-relaxed">{q.question || q.front}</p>
            </div>

            {notAnswered && (
              <p className="text-xs text-gray-400 italic ml-8">Chưa làm tới câu này</p>
            )}

            {type === 'multiple_choice' && q.options && !notAnswered && (
              <div className="space-y-1.5 ml-8">
                {q.options.map((opt, i) => {
                  const isCorrect = i === q.correct
                  const isUserPick = i === userAnswer?.selectedIdx
                  let cls = 'bg-white border-gray-200 text-gray-500'
                  if (isCorrect) cls = 'bg-green-100 border-green-400 text-green-800 font-medium'
                  else if (isUserPick && !isCorrect) cls = 'bg-red-100 border-red-400 text-red-700'
                  return (
                    <div key={i} className={`text-xs px-3 py-2 rounded-lg flex items-center gap-2 border ${cls}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                        ${isCorrect ? 'bg-green-500 text-white' : isUserPick ? 'bg-red-400 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {['A','B','C','D'][i]}
                      </span>
                      {opt.replace(/^[A-D]\.\s*/, '')}
                      {isCorrect && <span className="ml-auto">✓ Đúng</span>}
                      {isUserPick && !isCorrect && <span className="ml-auto">← Bạn chọn</span>}
                    </div>
                  )
                })}
                {!userAnswer.isCorrect && q.explanation_wrong && (
                  <p className="text-xs text-red-600 mt-2 bg-red-50 rounded-lg px-3 py-2">⚠️ {q.explanation_wrong}</p>
                )}
                {q.explanation_correct && (
                  <p className="text-xs text-green-700 mt-1 bg-green-50 rounded-lg px-3 py-2">💡 {q.explanation_correct}</p>
                )}
              </div>
            )}

            {type === 'essay' && q.sample_answer && !notAnswered && (
              <div className="text-xs text-gray-600 bg-indigo-50 rounded-lg px-3 py-2 border border-indigo-200 ml-8">
                <span className="font-semibold text-indigo-700">Gợi ý: </span>{q.sample_answer}
              </div>
            )}
            {type === 'flashcard' && q.back && !notAnswered && (
              <div className="text-sm text-indigo-700 bg-indigo-50 rounded-lg px-3 py-2 border border-indigo-200 ml-8">
                <span className="font-semibold">Đáp án: </span>{q.back}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function History({ user }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const router = useRouter()

  useEffect(() => {
    if (!user) { router.push('/'); return }
    fetchSessions()
  }, [user])

  async function fetchSessions() {
    setLoading(true)
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    if (!error) setSessions(data || [])
    else console.error('fetchSessions error:', error)
    setLoading(false)
  }

  async function handleDelete(id) {
    setDeleting(id)
    const { error } = await supabase.from('quiz_sessions').delete().eq('id', id).eq('user_id', user.id)
    if (!error) {
      setSessions(prev => prev.filter(s => s.id !== id))
      if (expanded === id) setExpanded(null)
    } else {
      // fallback API
      const res = await fetch('/api/delete-session', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, user_id: user.id })
      })
      if (res.ok) setSessions(prev => prev.filter(s => s.id !== id))
    }
    setDeleting(null)
    setDeleteConfirm(null)
  }

  function handleResume(s) {
    sessionStorage.setItem('resume_session', JSON.stringify({
      questions: s.questions_json,
      quiz_type: s.quiz_type,
      current_index: s.current_index || 0,
      file_config: s.file_config_json,
      answered_map: s.answered_map_json || {},
      session_id: s.id
    }))
    router.push('/?resume=1')
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
          <button onClick={() => router.push('/')} className="text-sm text-indigo-600 hover:underline">← Trang chủ</button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Lịch sử bài làm</h1>
          {!loading && sessions.length > 0 && (
            <p className="text-sm text-gray-400 mt-1">
              {sessions.length} bài · {sessions.filter(s => s.completed === false).length} chưa xong
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-400">Chưa có bài làm nào</p>
            <button onClick={() => router.push('/')} className="mt-4 text-sm text-indigo-600 hover:underline">Tạo bài ngay →</button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(s => {
              const isIncomplete = s.completed === false
              const isExpanded = expanded === s.id
              const answeredMap = s.answered_map_json || null

              return (
                <div key={s.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden
                  ${isExpanded ? 'border-indigo-200' : 'border-gray-100'}`}>

                  <div className="p-4 flex items-center gap-3">
                    {/* Badge */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold
                      ${isIncomplete ? 'bg-amber-100 text-amber-700' :
                        s.score >= 80 ? 'bg-green-100 text-green-700' :
                        s.score >= 60 ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-600'}`}>
                      {isIncomplete ? '⏸' : `${s.score}%`}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => { setExpanded(prev => prev === s.id ? null : s.id); setDeleteConfirm(null) }}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-800 text-sm truncate max-w-[180px]">{s.file_name}</p>
                        {isIncomplete && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">⏸ Chưa xong</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {typeLabel[s.quiz_type]} · {s.correct_answers ?? 0}/{s.total_questions} đúng · {new Date(s.created_at).toLocaleDateString('vi-VN')}
                        {isIncomplete && ` · Dừng tại câu ${(s.current_index || 0) + 1}`}
                      </p>
                      {isIncomplete && (
                        <ProgressDots total={s.total_questions} answeredMap={answeredMap} />
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={e => { e.stopPropagation(); handleResume(s) }}
                        className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition
                          ${isIncomplete ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-700'}`}>
                        {isIncomplete ? '▶ Làm tiếp' : '↺ Làm lại'}
                      </button>

                      {deleteConfirm !== s.id ? (
                        <button onClick={e => { e.stopPropagation(); setDeleteConfirm(s.id) }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition">
                          🗑
                        </button>
                      ) : (
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <span className="text-xs text-gray-500">Xóa?</span>
                          <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id}
                            className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg disabled:opacity-50">
                            {deleting === s.id ? '...' : 'Có'}
                          </button>
                          <button onClick={() => setDeleteConfirm(null)}
                            className="text-xs border border-gray-200 px-2 py-1 rounded-lg text-gray-500 hover:bg-gray-50">
                            Không
                          </button>
                        </div>
                      )}

                      <button onClick={() => { setExpanded(prev => prev === s.id ? null : s.id); setDeleteConfirm(null) }}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition
                          ${isExpanded ? 'bg-indigo-50 text-indigo-500' : ''}`}>
                        <span className={`inline-block transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-50">
                      <QuestionReview questions={s.questions_json} type={s.quiz_type} answeredMap={answeredMap} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

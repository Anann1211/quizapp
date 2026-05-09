import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function History({ user }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
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

  const typeLabel = { multiple_choice: 'Trắc nghiệm', essay: 'Tự luận', flashcard: 'Flashcard' }

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
            <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="font-medium text-gray-800 truncate max-w-xs">{s.file_name}</p>
                <p className="text-sm text-gray-500">
                  {typeLabel[s.quiz_type]} · {s.correct_answers}/{s.total_questions} câu đúng ·{' '}
                  {new Date(s.created_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className={`text-2xl font-bold ${s.score >= 80 ? 'text-green-600' : s.score >= 60 ? 'text-indigo-600' : 'text-amber-500'}`}>
                {s.score}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

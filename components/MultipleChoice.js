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
    onPause({
      correct,
      total: questions.length,
      answered,
      current_index: current,
      answered_count: answered.length
    })
  }

  function getBtnClass(idx) {
    if (!isAnswered) return 'answer-btn'
    if (idx === q.correct) return 'answer-btn answer-correct'
    if (idx === selected && selected !== q.correct) return 'answer-btn answer-wrong'
    return 'answer-btn opacity-50'
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Pause confirm dialog */}
      {showPauseConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Dừng làm bài?</h3>
            <p className="text-gray-500 text-sm mb-5">Tiến độ sẽ được lưu vào Lịch sử. Bạn có thể làm tiếp sau.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowPauseConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition text-sm">
                Tiếp tục làm
              </button>
              <button onClick={handlePause}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition text-sm">
                Dừng & Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">Câu {current + 1} / {questions.length}</span>
          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            ✓ {answered.filter(a => a.correct).length} đúng
          </span>
        </div>
        <button onClick={() => setShowPauseConfirm(true)}
          className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition">
          ⏸ Dừng
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
        <div className="bg-indigo-500 h-1.5 rounded-full transition-all"
          style={{ width: `${((current) / questions.length) * 100}%` }} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 leading-relaxed">{q.question}</h3>
      </div>

      <div className="space-y-3 mb-6">
        {q.options.map((opt, idx) => (
          <button key={idx} onClick={() => choose(idx)} className={getBtnClass(idx)}>
            <span className="inline-flex items-center gap-3">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                ${!isAnswered ? 'bg-gray-100 text-gray-500' :
                  idx === q.correct ? 'bg-green-500 text-white' :
                  idx === selected ? 'bg-red-400 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {['A','B','C','D'][idx]}
              </span>
              {opt.replace(/^[A-D]\.\s*/, '')}
            </span>
          </button>
        ))}
      </div>

      {isAnswered && (
        <div className={`rounded-xl p-4 mb-6 border ${selected === q.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`font-semibold mb-1 ${selected === q.correct ? 'text-green-700' : 'text-red-700'}`}>
            {selected === q.correct ? '✅ Chính xác!' : '❌ Chưa đúng'}
          </p>
          <p className="text-sm text-gray-700">
            {selected === q.correct ? q.explanation_correct : q.explanation_wrong}
          </p>
          {selected !== q.correct && (
            <p className="text-sm text-green-700 mt-2 font-medium">
              ✅ Đáp án đúng: {q.options[q.correct]?.replace(/^[A-D]\.\s*/, '')} — {q.explanation_correct}
            </p>
          )}
        </div>
      )}

      {isAnswered && (
        <button onClick={next}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition">
          {current + 1 < questions.length ? 'Câu tiếp theo →' : 'Xem kết quả 🎯'}
        </button>
      )}
    </div>
  )
}

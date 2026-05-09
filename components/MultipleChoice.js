import { useState } from 'react'

export default function MultipleChoice({ questions, onFinish }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState([])

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
      const correct = answered.filter(a => a.correct).length + (selected === q.correct ? 1 : 0)
      onFinish({ correct, total: questions.length, answered: [...answered] })
    }
  }

  function getBtnClass(idx) {
    if (!isAnswered) return 'answer-btn'
    if (idx === q.correct) return 'answer-btn answer-correct'
    if (idx === selected && selected !== q.correct) return 'answer-btn answer-wrong'
    return 'answer-btn opacity-50'
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium text-gray-500">Câu {current + 1} / {questions.length}</span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all
              ${i < current ? 'w-4 bg-indigo-500' : i === current ? 'w-6 bg-indigo-400' : 'w-4 bg-gray-200'}`} />
          ))}
        </div>
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
              ✅ Đáp án đúng: {q.options[q.correct]} — {q.explanation_correct}
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

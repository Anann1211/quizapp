import { useState } from 'react'

export default function Essay({ questions, onFinish }) {
  const [current, setCurrent] = useState(0)
  const [answer, setAnswer] = useState('')
  const [showSample, setShowSample] = useState(false)
  const [done, setDone] = useState([])

  const q = questions[current]

  function next() {
    const newDone = [...done, { id: q.id, answer }]
    if (current + 1 < questions.length) {
      setDone(newDone)
      setCurrent(current + 1)
      setAnswer('')
      setShowSample(false)
    } else {
      onFinish({ correct: newDone.length, total: questions.length, answered: newDone })
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-gray-500 font-medium">Câu {current + 1} / {questions.length}</span>
        <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">Tự luận</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800">{q.question}</h3>
      </div>

      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        placeholder="Nhập câu trả lời của bạn..."
        rows={6}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700 resize-none mb-4"
      />

      <button onClick={() => setShowSample(!showSample)}
        className="text-sm text-indigo-600 hover:underline mb-4 block">
        {showSample ? 'Ẩn gợi ý' : '💡 Xem gợi ý đáp án'}
      </button>

      {showSample && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-semibold text-indigo-700 mb-1">Gợi ý đáp án:</p>
          <p className="text-sm text-gray-700">{q.sample_answer}</p>
        </div>
      )}

      <button onClick={next}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition">
        {current + 1 < questions.length ? 'Câu tiếp theo →' : 'Hoàn thành ✓'}
      </button>
    </div>
  )
}

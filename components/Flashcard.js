import { useState } from 'react'

export default function Flashcard({ questions, onFinish }) {
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState([])

  const q = questions[current]

  function mark(isKnown) {
    const newKnown = [...known, isKnown]
    if (current + 1 < questions.length) {
      setKnown(newKnown)
      setCurrent(current + 1)
      setFlipped(false)
    } else {
      onFinish({ correct: newKnown.filter(Boolean).length, total: questions.length, answered: newKnown })
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-gray-500">{current + 1} / {questions.length}</span>
        <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">Flashcard</span>
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        className={`cursor-pointer bg-white rounded-2xl border-2 p-10 text-center min-h-48 flex flex-col items-center justify-center shadow-sm transition-all
          ${flipped ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          {flipped ? 'Đáp án' : 'Câu hỏi — Bấm để lật'}
        </span>
        <p className="text-xl font-semibold text-gray-800">
          {flipped ? q.back : q.front}
        </p>
      </div>

      {flipped && (
        <div className="flex gap-3 mt-6">
          <button onClick={() => mark(false)}
            className="flex-1 py-3 rounded-xl border-2 border-red-300 text-red-600 font-semibold hover:bg-red-50 transition">
            😕 Chưa nhớ
          </button>
          <button onClick={() => mark(true)}
            className="flex-1 py-3 rounded-xl border-2 border-green-400 text-green-700 font-semibold hover:bg-green-50 transition">
            ✅ Đã nhớ
          </button>
        </div>
      )}

      {!flipped && (
        <p className="text-center text-sm text-gray-400 mt-4">Bấm vào thẻ để xem đáp án</p>
      )}
    </div>
  )
}

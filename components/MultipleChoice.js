import { useState } from 'react'

export default function MultipleChoice({ questions, onFinish, onSaveProgress, initialData }) {
  const [current, setCurrent] = useState(initialData?.current_index || 0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(initialData?.user_answers || [])

  const q = questions[current]
  const isAnswered = selected !== null

  function choose(idx) {
    if (isAnswered) return
    setSelected(idx)
    setAnswered(prev => [...prev, { id: q.id, correct: idx === q.correct, selected: idx }])
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

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between mb-6">
        <button onClick={() => onSaveProgress({ 
          total: questions.length, 
          correct: answered.filter(a => a.correct).length, 
          answered, 
          current_index: current 
        })} className="text-red-500 text-sm font-bold">🛑 Tạm dừng</button>
        <span className="text-gray-500">Câu {current + 1} / {questions.length}</span>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border mb-6">
        <h3 className="font-semibold">{q.question}</h3>
      </div>
      <div className="space-y-3 mb-6">
        {q.options.map((opt, idx) => (
          <button key={idx} onClick={() => choose(idx)} className={`w-full p-4 rounded-xl border-2 text-left ${
            !isAnswered ? 'hover:border-indigo-500' : idx === q.correct ? 'border-green-500 bg-green-50' : idx === selected ? 'border-red-500 bg-red-50' : 'opacity-50'
          }`}>{opt}</button>
        ))}
      </div>
      {isAnswered && <button onClick={next} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Tiếp theo ➔</button>}
    </div>
  )
}

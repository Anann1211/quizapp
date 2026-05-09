import { useState } from 'react'

export default function ResultScreen({ result, fileConfig, onContinue, onExport, onHome }) {
  const { correct, total } = result
  const score = Math.round((correct / total) * 100)
  const [nextType, setNextType] = useState('multiple_choice')
  const [showOptions, setShowOptions] = useState(false)

  const grade = score >= 80 ? { label: 'Xuất sắc 🏆', color: 'text-green-600' }
    : score >= 60 ? { label: 'Khá tốt 👍', color: 'text-indigo-600' }
    : { label: 'Cần ôn thêm 📚', color: 'text-amber-600' }

  const types = [
    { id: 'multiple_choice', label: 'Trắc nghiệm mới' },
    { id: 'essay', label: 'Tự luận' },
    { id: 'flashcard', label: 'Flashcard' },
  ]

  return (
    <div className="max-w-lg mx-auto py-12 px-4 text-center">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl font-bold text-indigo-600">{score}%</span>
        </div>
        <h2 className={`text-2xl font-bold mb-1 ${grade.color}`}>{grade.label}</h2>
        <p className="text-gray-500 text-sm">
          Bạn trả lời đúng <strong className="text-gray-700">{correct}/{total}</strong> câu
        </p>

        <div className="grid grid-cols-3 gap-3 mt-6 text-center">
          {[
            { label: 'Tổng câu', val: total, color: 'bg-gray-50' },
            { label: 'Đúng', val: correct, color: 'bg-green-50 text-green-700' },
            { label: 'Sai', val: total - correct, color: 'bg-red-50 text-red-600' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-3 ${s.color}`}>
              <div className="text-2xl font-bold">{s.val}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <button onClick={() => setShowOptions(!showOptions)}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition">
          🔄 Tiếp tục luyện tập
        </button>

        {showOptions && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-left">
            <p className="text-sm font-semibold text-gray-700 mb-3">Chọn dạng bài tiếp theo:</p>
            <div className="space-y-2 mb-4">
              {types.map(t => (
                <label key={t.id} className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="type" value={t.id}
                    checked={nextType === t.id}
                    onChange={() => setNextType(t.id)}
                    className="accent-indigo-600"
                  />
                  <span className="text-sm text-gray-700">{t.label}</span>
                </label>
              ))}
            </div>
            <button onClick={() => onContinue(nextType)}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition">
              Bắt đầu →
            </button>
          </div>
        )}

        <button onClick={onExport}
          className="w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition">
          📥 Xuất file câu hỏi (JSON)
        </button>

        <button onClick={onHome}
          className="w-full py-3 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition text-sm">
          Tải tài liệu mới
        </button>
      </div>
    </div>
  )
}

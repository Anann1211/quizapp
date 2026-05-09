import { useState, useRef } from 'react'

const ACCEPTED = '.pdf,.docx,.txt,.pptx,.png,.jpg,.jpeg,.webp'
const MAX_MB = 20

export default function UploadStep({ onReady }) {
  const [file, setFile] = useState(null)
  const [count, setCount] = useState(10)
  const [type, setType] = useState('multiple_choice')
  const [drag, setDrag] = useState(false)
  const inputRef = useRef()

  function pickFile(f) {
    if (!f) return
    if (f.size > MAX_MB * 1024 * 1024) return alert(`File quá lớn! Tối đa ${MAX_MB}MB`)
    setFile(f)
  }

  function handleDrop(e) {
    e.preventDefault(); setDrag(false)
    pickFile(e.dataTransfer.files[0])
  }

  async function handleStart() {
    if (!file) return alert('Vui lòng chọn file tài liệu')
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      onReady({ fileData: base64, fileName: file.name, fileMime: file.type, count, type })
    }
    reader.readAsDataURL(file)
  }

  const types = [
    { id: 'multiple_choice', label: 'Trắc nghiệm', icon: '◉', desc: '4 đáp án, có giải thích' },
    { id: 'essay', label: 'Tự luận', icon: '✏️', desc: 'Câu hỏi mở, gợi ý đáp án' },
    { id: 'flashcard', label: 'Flashcard', icon: '🃏', desc: 'Hỏi - đáp nhanh' },
  ]

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Tải tài liệu lên</h2>
      <p className="text-gray-500 mb-8">Hỗ trợ PDF, Word, PowerPoint, TXT, ảnh — tối đa 20MB</p>

      <div
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition
          ${drag ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}
          ${file ? 'border-green-400 bg-green-50' : ''}`}
      >
        <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden" onChange={e => pickFile(e.target.files[0])} />
        {file ? (
          <div>
            <div className="text-4xl mb-2">✅</div>
            <p className="font-semibold text-green-700">{file.name}</p>
            <p className="text-sm text-green-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <button onClick={e => { e.stopPropagation(); setFile(null) }} className="text-xs text-gray-400 mt-2 hover:text-red-500">Xóa file</button>
          </div>
        ) : (
          <div>
            <div className="text-5xl mb-3">📂</div>
            <p className="font-medium text-gray-600">Kéo thả file vào đây hoặc bấm để chọn</p>
            <p className="text-sm text-gray-400 mt-1">PDF · DOCX · PPTX · TXT · PNG · JPG · WEBP</p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Loại câu hỏi</label>
        <div className="grid grid-cols-3 gap-3">
          {types.map(t => (
            <button key={t.id} onClick={() => setType(t.id)}
              className={`p-4 rounded-xl border-2 text-left transition
                ${type === t.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
            >
              <div className="text-xl mb-1">{t.icon}</div>
              <div className="font-semibold text-sm text-gray-800">{t.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Số lượng câu hỏi: <span className="text-indigo-600">{count}</span>
        </label>
        <input type="range" min={5} max={50} step={5} value={count}
          onChange={e => setCount(parseInt(e.target.value))}
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>5</span><span>25</span><span>50</span>
        </div>
      </div>

      <button onClick={handleStart}
        className="mt-8 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-lg shadow-md shadow-indigo-200">
        Tạo câu hỏi với AI ✨
      </button>
    </div>
  )
}

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Cố gắng sửa JSON bị cắt ngang
function repairJSON(raw) {
  let str = raw.trim()

  // Xóa markdown fences
  str = str.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

  // Thử parse thẳng trước
  try { return JSON.parse(str) } catch {}

  // Tìm vị trí bắt đầu của object
  const start = str.indexOf('{')
  if (start === -1) throw new Error('Không tìm thấy JSON hợp lệ trong response')
  str = str.slice(start)

  // Đếm bracket mở/đóng để tự đóng nếu thiếu
  let depth = 0
  let inStr = false
  let escape = false
  let lastValidPos = 0

  for (let i = 0; i < str.length; i++) {
    const c = str[i]
    if (escape) { escape = false; continue }
    if (c === '\\' && inStr) { escape = true; continue }
    if (c === '"') { inStr = !inStr; continue }
    if (inStr) continue
    if (c === '{' || c === '[') { depth++; lastValidPos = i }
    if (c === '}' || c === ']') { depth--; if (depth === 0) lastValidPos = i }
  }

  // Nếu JSON bị cắt giữa chừng, tự bổ sung đóng
  if (depth > 0) {
    // Cắt tại câu hỏi cuối cùng hoàn chỉnh (trước dấu phẩy trailing)
    let fixed = str.slice(0, lastValidPos + 1)
    // Đóng mảng questions nếu đang mở
    const openArrays = (fixed.match(/\[/g) || []).length - (fixed.match(/\]/g) || []).length
    const openObjects = (fixed.match(/\{/g) || []).length - (fixed.match(/\}/g) || []).length
    // Xóa dấu phẩy trailing trước khi đóng
    fixed = fixed.replace(/,\s*$/, '')
    for (let i = 0; i < openArrays; i++) fixed += ']'
    for (let i = 0; i < openObjects; i++) fixed += '}'
    try { return JSON.parse(fixed) } catch {}
  }

  // Last resort: tìm và parse đoạn JSON hợp lệ nhất
  const match = str.match(/\{[\s\S]*"questions"\s*:\s*\[[\s\S]*?\][\s\S]*?\}/)
  if (match) {
    try { return JSON.parse(match[0]) } catch {}
  }

  throw new Error('Không thể parse JSON từ response AI')
}

export async function generateQuestions({ text, imageBase64, mimeType, count, type, previousQuestions, topic }) {
  // Giới hạn số câu mỗi batch để tránh token overflow
  const batchSize = Math.min(count, 15)

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    generationConfig: {
      maxOutputTokens: Math.min(500 + batchSize * 280, 4096),
      temperature: 0.7
    }
  })

  const topicContext = topic
    ? `\nTRỌNG TÂM: Câu hỏi PHẢI xoay quanh chủ đề "${topic}". Ưu tiên nội dung liên quan.`
    : ''

  const typeInstructions = {
    multiple_choice: `Tạo ĐÚNG ${batchSize} câu hỏi trắc nghiệm, mỗi câu có đúng 4 đáp án (A, B, C, D), chỉ 1 đáp án đúng. Giải thích NGẮN GỌN (tối đa 1 câu mỗi giải thích).`,
    essay: `Tạo ĐÚNG ${batchSize} câu hỏi tự luận ngắn, gợi ý đáp án tối đa 2 câu.`,
    flashcard: `Tạo ĐÚNG ${batchSize} cặp flashcard dạng hỏi - đáp, mỗi vế tối đa 15 từ.`,
  }

  const prevContext = previousQuestions?.length
    ? `\nĐã hỏi rồi (KHÔNG lặp lại): ${previousQuestions.slice(-10).join(' | ')}`
    : ''

  const formatGuide = {
    multiple_choice: `{"questions":[{"id":1,"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correct":0,"explanation_correct":"...","explanation_wrong":"..."}]}`,
    essay: `{"questions":[{"id":1,"question":"...","sample_answer":"..."}]}`,
    flashcard: `{"questions":[{"id":1,"front":"...","back":"..."}]}`,
  }

  const prompt = `Bạn là chuyên gia giáo dục. Dựa vào tài liệu, thực hiện:
${typeInstructions[type]}${topicContext}${prevContext}

QUAN TRỌNG:
- Chỉ trả về JSON thuần túy, KHÔNG có markdown, KHÔNG có backtick
- Phải tạo ĐỦ ${batchSize} câu hỏi
- Mỗi câu phải hoàn chỉnh trước khi qua câu tiếp theo
- Format bắt buộc: ${formatGuide[type]}`

  const parts = []
  if (imageBase64 && mimeType) {
    parts.push({ inlineData: { data: imageBase64, mimeType } })
  }
  const textContent = text ? `${prompt}\n\nTÀI LIỆU:\n${text.slice(0, 25000)}` : prompt
  parts.push({ text: textContent })

  const result = await model.generateContent(parts)
  const raw = result.response.text()
  const parsed = repairJSON(raw)

  // Đảm bảo luôn trả về đúng cấu trúc
  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error('AI trả về dữ liệu không đúng định dạng')
  }

  return parsed
}


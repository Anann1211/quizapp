import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function generateQuestions({ text, imageBase64, mimeType, count, type, previousQuestions }) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
  generationConfig: {
  maxOutputTokens: 4096,
  temperature: 0.7,
  }
  const typeInstructions = {
    multiple_choice: `Tạo ${count} câu hỏi trắc nghiệm, mỗi câu có đúng 4 đáp án (A, B, C, D), chỉ 1 đáp án đúng.`,
    essay: `Tạo ${count} câu hỏi tự luận / câu hỏi mở, yêu cầu trả lời chi tiết.`,
    flashcard: `Tạo ${count} cặp flashcard dạng hỏi - đáp ngắn gọn, súc tích.`,
  }

  const prevContext = previousQuestions?.length
    ? `\n\nCHÚ Ý: Đây là lượt tiếp theo. Các câu hỏi sau đã được hỏi rồi, hãy tạo câu hỏi MỚI không trùng lặp và nâng cao hơn:\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
    : ''

  const prompt = `Bạn là một chuyên gia giáo dục. Dựa trên nội dung tài liệu được cung cấp, hãy thực hiện yêu cầu sau:

${typeInstructions[type]}${prevContext}

QUAN TRỌNG: Trả về CHỈ JSON thuần túy, không markdown, không backtick, không giải thích thêm.

${type === 'multiple_choice' ? `Format JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "Câu hỏi...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct": 0,
      "explanation_correct": "Giải thích tại sao đáp án đúng...",
      "explanation_wrong": "Giải thích ngắn gọn tại sao các đáp án kia sai..."
    }
  ]
}` : type === 'essay' ? `Format JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "Câu hỏi tự luận...",
      "sample_answer": "Gợi ý trả lời mẫu..."
    }
  ]
}` : `Format JSON:
{
  "questions": [
    {
      "id": 1,
      "front": "Câu hỏi / khái niệm...",
      "back": "Định nghĩa / câu trả lời..."
    }
  ]
}`}`

  const parts = []
  if (imageBase64 && mimeType) {
    parts.push({ inlineData: { data: imageBase64, mimeType } })
  }
  parts.push({ text: text ? `${prompt}\n\nNỘI DUNG TÀI LIỆU:\n${text.slice(0, 30000)}` : prompt })

  const result = await model.generateContent(parts)
  const raw = result.response.text().replace(/```json|```/g, '').trim()
  return JSON.parse(raw)
}

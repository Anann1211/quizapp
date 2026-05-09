import { generateQuestions } from '../../lib/gemini'
import { extractText } from '../../lib/extractText'

export const config = { api: { bodyParser: { sizeLimit: '20mb' } } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { fileData, fileName, fileMime, count, type, previousQuestions, topic } = req.body

    if (!fileData) return res.status(400).json({ error: 'Không có file' })

    const buffer = Buffer.from(fileData, 'base64')
    const { text, imageBase64, mimeType } = await extractText(buffer, fileMime, fileName)

    const result = await generateQuestions({
      text,
      imageBase64,
      mimeType: imageBase64 ? fileMime : null,
      count: Math.min(parseInt(count) || 10, 50),
      type: type || 'multiple_choice',
      previousQuestions: previousQuestions || [],
      topic: topic || ''
    })

    res.status(200).json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Lỗi tạo câu hỏi' })
  }
}

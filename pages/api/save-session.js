import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { user_id, file_name, quiz_type, total, correct, questions } = req.body

  const { data, error } = await supabase.from('quiz_sessions').insert({
    user_id,
    file_name,
    quiz_type,
    total_questions: total,
    correct_answers: correct,
    score: Math.round((correct / total) * 100),
    questions_json: questions,
    created_at: new Date().toISOString()
  }).select().single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json(data)
}

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { id, user_id, file_name, quiz_type, total, correct, questions, is_finished, current_index, user_answers } = req.body

  const payload = {
    user_id, file_name, quiz_type,
    total_questions: total,
    correct_answers: correct,
    score: total > 0 ? Math.round((correct / total) * 100) : 0,
    questions_json: questions,
    is_finished: is_finished ?? true,
    current_index: current_index ?? 0,
    user_answers: user_answers ?? [],
    created_at: new Date().toISOString()
  }

  const { data, error } = id 
    ? await supabase.from('quiz_sessions').update(payload).eq('id', id).select().single()
    : await supabase.from('quiz_sessions').insert(payload).select().single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json(data)
}

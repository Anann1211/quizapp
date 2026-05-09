import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { user_id, file_name, quiz_type, total, correct, questions, answered_count, completed, current_index, file_config } = req.body

  const { data, error } = await supabase.from('quiz_sessions').insert({
    user_id,
    file_name,
    quiz_type,
    total_questions: total,
    correct_answers: correct ?? 0,
    score: total > 0 && correct != null ? Math.round((correct / total) * 100) : 0,
    questions_json: questions,
    answered_count: answered_count ?? total,
    completed: completed ?? true,
    current_index: current_index ?? 0,
    file_config_json: file_config ?? null,
    created_at: new Date().toISOString()
  }).select().single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json(data)
}

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // dùng service role để bypass RLS
)

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end()
  const { id, user_id } = req.body
  if (!id || !user_id) return res.status(400).json({ error: 'Thiếu id hoặc user_id' })

  const { error } = await supabase
    .from('quiz_sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id) // bảo mật: chỉ xóa của chính user

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ success: true })
}

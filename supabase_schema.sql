-- Chạy lệnh này trong Supabase SQL Editor
-- Project → SQL Editor → New query → paste vào → Run

create table if not exists quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  file_name text,
  quiz_type text,
  total_questions int,
  correct_answers int,
  score int,
  questions_json jsonb,
  created_at timestamptz default now()
);

-- Chỉ cho phép user đọc/ghi dữ liệu của chính họ
alter table quiz_sessions enable row level security;

create policy "Users can view own sessions"
  on quiz_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on quiz_sessions for insert
  with check (auth.uid() = user_id);

-- 여러 꿈을 묶어 반복 상징·감정 흐름·주제를 정리한 패턴 리포트.
-- 서버(service role)만 접근한다. RLS를 켜고 정책을 두지 않아 anon/authenticated 접근을 막는다.
create table public.dream_pattern_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dream_ids uuid[] not null,
  dream_count integer not null,
  report jsonb not null,
  created_at timestamptz not null default now()
);

create index dream_pattern_reports_user_id_created_at_idx
  on public.dream_pattern_reports (user_id, created_at desc);

alter table public.dream_pattern_reports enable row level security;

-- 비로그인 체험: 게스트가 만든 꿈 이야기를 보관하고, 로그인 후 본인 서재로 옮긴다.
-- 서버(service role)만 접근한다. RLS를 켜고 정책을 두지 않아 anon/authenticated 접근을 막는다.
create table public.guest_dreams (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  dream_input_text text not null,
  dream_keywords text[],
  dream_emotion text,
  story_preference_genre text,
  story_preference_mood text,
  generated_story_title text not null,
  generated_story_content text not null,
  generated_image_prompt text not null,
  raw_gemini_response jsonb,
  created_at timestamptz not null default now(),
  claimed_by uuid references auth.users (id) on delete set null,
  claimed_at timestamptz,
  claimed_dream_id uuid references public.dreams (id) on delete set null
);

create index guest_dreams_ip_hash_created_at_idx on public.guest_dreams (ip_hash, created_at);
create index guest_dreams_created_at_idx on public.guest_dreams (created_at);

alter table public.guest_dreams enable row level security;

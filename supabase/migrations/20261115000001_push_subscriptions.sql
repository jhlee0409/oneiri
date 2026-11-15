-- 아침 꿈 알림: 사용자가 동의한 Web Push 구독을 보관한다.
-- 서버(service role)만 접근한다. RLS를 켜고 정책을 두지 않아 anon/authenticated 접근을 막는다.
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  -- KST 기준 알림 시각(시)
  reminder_hour smallint not null default 8 check (reminder_hour between 5 and 11),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  last_sent_on date
);

create index push_subscriptions_user_id_idx on public.push_subscriptions (user_id);
create index push_subscriptions_reminder_hour_idx on public.push_subscriptions (reminder_hour)
  where enabled;

alter table public.push_subscriptions enable row level security;

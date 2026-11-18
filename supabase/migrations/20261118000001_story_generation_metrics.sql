create table public.story_generation_metrics (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  audience text not null check (audience in ('guest', 'member')),
  model text not null,
  elapsed_ms integer not null check (elapsed_ms >= 0),
  outcome text not null check (outcome in ('generated', 'provider_error', 'invalid_output')),
  provider_status integer check (provider_status between 100 and 599),
  input_tokens integer check (input_tokens >= 0),
  output_tokens integer check (output_tokens >= 0),
  estimated_cost_nano_usd bigint check (estimated_cost_nano_usd >= 0)
);

create index story_generation_metrics_created_at_idx
  on public.story_generation_metrics (created_at);
alter table public.story_generation_metrics enable row level security;
revoke all on public.story_generation_metrics from anon, authenticated;
grant insert, select on public.story_generation_metrics to service_role;

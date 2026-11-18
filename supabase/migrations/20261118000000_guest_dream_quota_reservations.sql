create table public.guest_dream_quota_reservations (
  quota_date date not null,
  ip_hash text not null check (ip_hash ~ '^[0-9a-f]{64}$'),
  attempt_count integer not null default 1 check (attempt_count > 0),
  primary key (quota_date, ip_hash)
);

alter table public.guest_dream_quota_reservations enable row level security;
revoke all on table public.guest_dream_quota_reservations
  from public, anon, authenticated, service_role;

-- Carry today's successful legacy requests into the new quota. Group by IP but
-- count every success, including any duplicates admitted by the old race.
with current_kst_day as (
  select (pg_catalog.statement_timestamp() at time zone 'Asia/Seoul')::date as quota_date
)
insert into public.guest_dream_quota_reservations (quota_date, ip_hash, attempt_count)
select day.quota_date, dream.ip_hash, count(*)::integer
from current_kst_day as day
join public.guest_dreams as dream
  on dream.created_at >= (day.quota_date::timestamp at time zone 'Asia/Seoul')
  and dream.created_at < ((day.quota_date + 1)::timestamp at time zone 'Asia/Seoul')
group by day.quota_date, dream.ip_hash;

create function public.reserve_guest_dream_quota(p_ip_hash text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  kst_day date;
begin
  -- PostgREST uses READ COMMITTED. Reject isolation levels that could retain
  -- a snapshot taken before another caller released the advisory lock.
  if pg_catalog.current_setting('transaction_isolation') <> 'read committed' then
    raise exception 'Guest dream quota requires READ COMMITTED';
  end if;

  -- Serialize reservations only, not model calls. Read the clock after waiting
  -- so a request queued across KST midnight is charged to the new day.
  perform pg_catalog.pg_advisory_xact_lock(20261118, 1);
  kst_day := (pg_catalog.clock_timestamp() at time zone 'Asia/Seoul')::date;

  if exists (
    select 1
    from public.guest_dream_quota_reservations
    where quota_date = kst_day and ip_hash = p_ip_hash
  ) then
    return 'ip_limit';
  end if;

  if (
    select coalesce(sum(attempt_count), 0)
    from public.guest_dream_quota_reservations
    where quota_date = kst_day
  ) >= 300 then
    return 'global_limit';
  end if;

  insert into public.guest_dream_quota_reservations (quota_date, ip_hash)
  values (kst_day, p_ip_hash);
  return 'reserved';
end;
$$;

revoke all on function public.reserve_guest_dream_quota(text)
  from public, anon, authenticated;
grant execute on function public.reserve_guest_dream_quota(text) to service_role;

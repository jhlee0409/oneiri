create table public.dream_postcard_interest (
  offer_version text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  shown_at timestamptz not null default clock_timestamp(),
  signed_up_at timestamptz check (signed_up_at >= shown_at),
  primary key (offer_version, user_id)
);

alter table public.dream_postcard_interest enable row level security;
revoke all on public.dream_postcard_interest from public, anon, authenticated, service_role;
grant select, insert, update on public.dream_postcard_interest to service_role;

-- No dream identifier is stored. It is used only to authorize the request.
create function public.record_dream_postcard_interest(
  p_offer_version text,
  p_user_id uuid,
  p_dream_id uuid,
  p_action text
) returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  existing_signup timestamptz;
begin
  if not exists (
    select 1 from public.dreams where id = p_dream_id and user_id = p_user_id
  ) then
    return 'not_found';
  end if;

  -- Serialize enrollment so parallel opens cannot exceed the cohort limit.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('dream_postcard_interest:' || p_offer_version, 0)
  );

  select signed_up_at into existing_signup
  from public.dream_postcard_interest
  where offer_version = p_offer_version and user_id = p_user_id;

  if found then
    if existing_signup is not null then
      return 'signed_up';
    end if;
    if p_action = 'signup' then
      update public.dream_postcard_interest
      set signed_up_at = greatest(shown_at, clock_timestamp())
      where offer_version = p_offer_version and user_id = p_user_id;
      return 'signed_up';
    end if;
    return 'shown';
  end if;

  if p_action <> 'show' then
    return 'not_shown';
  end if;

  if (select count(*) from public.dream_postcard_interest where offer_version = p_offer_version) >= 50 then
    return 'cohort_full';
  end if;

  insert into public.dream_postcard_interest (offer_version, user_id)
  values (p_offer_version, p_user_id);
  return 'shown';
end;
$$;

revoke all on function public.record_dream_postcard_interest(text, uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.record_dream_postcard_interest(text, uuid, uuid, text)
  to service_role;
